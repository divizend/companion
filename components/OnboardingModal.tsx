import React, { useRef, useState } from 'react';

import RNDateTimePicker, { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Button, Icon } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import i18next from 'i18next';
import {
  Alert,
  Dimensions,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Purchases from 'react-native-purchases';

import { apiPost } from '@/common/api';
import { colors } from '@/common/colors';
import { countries } from '@/common/countries';
import { usePrincipalLegalEntity, useUserProfile } from '@/common/profile';
import { usePurchases } from '@/hooks/usePurchases';
import { useThemeColor } from '@/hooks/useThemeColor';
import { t } from '@/i18n';

import { SafeAreaView } from './base/SafeAreaView';
import { useSnackbar } from './global/Snackbar';

interface OnboardingModalProps {
  visible: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function OnboardingModal({ visible }: OnboardingModalProps) {
  const theme = useThemeColor();
  const { updateProfile, updatePrincipalLegalEntity } = useUserProfile();
  const principalLegalEntity = usePrincipalLegalEntity();
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState(principalLegalEntity?.data.info.nationality ?? '');
  const [birthday, setBirthday] = useState<Date | null>(
    principalLegalEntity?.data.info.birthday ? new Date(principalLegalEntity.data.info.birthday) : null,
  );

  const { showSnackbar } = useSnackbar();
  const { eligibleForTrial } = usePurchases();

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date | undefined) => {
    if (event.type === 'set') {
      // Only update if a date is selected
      const currentDate = selectedDate || birthday;
      setBirthday(currentDate);
    }
  };

  const scrollViewRef = useRef<ScrollView>(null);
  const [isLoading, setIsLoading] = useState(false);

  const prioritizedCountryIds = ['de', 'ch', 'at', 'li'];
  const prioritizedCountries = [
    ...prioritizedCountryIds.map(id => countries.find(country => country.id === id)!),
    ...countries.filter(country => !prioritizedCountryIds.includes(country.id)),
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(contentOffsetX / screenWidth);
    setCurrentPage(page);
  };

  let availablePages = 3;
  if (principalLegalEntity?.data.info.nationality) {
    availablePages = 4;
    if (principalLegalEntity?.data.info.birthday) {
      availablePages = 5;
    }
  }

  const formatDate = (date: Date) => date.toISOString().slice(0, 10);

  const renderPageIndicator = () => {
    return (
      <View style={styles.pageIndicator}>
        {Array.from({ length: availablePages }).map((_, page) => (
          <View key={page} style={[styles.indicatorDot, page === currentPage && styles.indicatorDotActive]} />
        ))}
      </View>
    );
  };

  const renderPages = () => {
    return (
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.page}>
          <Text style={styles.modalTitle}>{t('onboarding.intro.title')}</Text>
          <Text style={styles.modalText}>{t('onboarding.intro.message')}</Text>
        </View>
        <View style={styles.page}>
          <Text style={styles.modalTitle}>{t('onboarding.aiDisclaimer.title')}</Text>
          <Text style={styles.modalText}>{t('onboarding.aiDisclaimer.message')}</Text>
        </View>
        <View style={styles.page}>
          <Text style={styles.modalTitle}>{t('onboarding.taxResidency.title')}</Text>
          <Text style={styles.modalText}>{t('onboarding.taxResidency.message')}</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCountry}
              onValueChange={itemValue => setSelectedCountry(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="" value="" />
              {prioritizedCountries.map(country => (
                <Picker.Item key={country.id} label={country.name} value={country.id} />
              ))}
            </Picker>
          </View>
        </View>
        <View style={styles.page}>
          <Text style={styles.modalTitle}>{t('onboarding.birthday.title')}</Text>
          <Text style={styles.modalText}>{t('onboarding.birthday.message')}</Text>
          <View>
            {Platform.OS === 'android' ? (
              <View className="flex gap-2 justify-center">
                <TouchableOpacity
                  onPress={() => DateTimePickerAndroid.open({ value: birthday || new Date(), onChange: onDateChange })}
                  className="px-5 py-4 bg-secondary-light rounded-xl flex flex-row justify-between items-center w-[100%]"
                >
                  <Text className="text-slate-800 text-lg">
                    {!!birthday ? t('{{date,day}}', { date: birthday }) : ''}
                  </Text>
                  <Icon name="event" color={theme.theme} type="material" />
                </TouchableOpacity>
              </View>
            ) : (
              <RNDateTimePicker
                value={birthday || new Date()}
                onChange={onDateChange}
                locale={i18next.language} // Use i18n locale
                mode="date"
                display="default"
              />
            )}
          </View>
        </View>
        {!!eligibleForTrial && (
          <View style={styles.page}>
            <Text style={styles.modalTitle}>Start your journey with a Free trial</Text>
            <Text style={styles.modalText}>
              {t(`subscription.trialPeriod.${eligibleForTrial.product.introPrice!.period}.free`)}
            </Text>
            <Text style={styles.modalText}>
              {t(`subscription.trialPeriod.${eligibleForTrial.product.introPrice!.period}.after`, {
                price: eligibleForTrial.product.pricePerMonthString,
                period: 'Month',
              })}
            </Text>
          </View>
        )}
        {availablePages >= 5 && (
          <View style={styles.page}>
            <Text style={styles.modalTitle}>{t('onboarding.allSet.title')}</Text>
            <Text style={styles.modalText}>{t('onboarding.allSet.message')}</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const isValidBirthday = (date: Date | null) => {
    if (!date) return false;
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return +date < +oneYearAgo;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => {}}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={['#FFFFFF', '#E8E8FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientBackground}
        />
        <View style={styles.modalContainer}>
          {renderPages()}
          {renderPageIndicator()}
          <Button
            title={
              currentPage !== 4
                ? t('common.next')
                : isLoading
                  ? t('common.loading')
                  : !!eligibleForTrial
                    ? t('onboarding.freeTrial')
                    : t('onboarding.finalConfirm')
            }
            onPress={async () => {
              if (currentPage === 0 || currentPage === 1) {
                scrollViewRef.current?.scrollTo({
                  x: screenWidth * (currentPage + 1),
                  animated: true,
                });
              } else if (currentPage === 2) {
                setIsLoading(true);
                try {
                  await apiPost(`/legalEntities/${principalLegalEntity?.id}/nationality`, {
                    nationality: selectedCountry,
                  });
                  updatePrincipalLegalEntity(p => {
                    p.data.info.nationality = selectedCountry;
                  });
                  setTimeout(
                    () =>
                      scrollViewRef.current?.scrollTo({
                        x: screenWidth * 3,
                        animated: true,
                      }),
                    200,
                  );
                } catch (error: any) {
                  Alert.alert(t('common.error'), error.message);
                } finally {
                  setIsLoading(false);
                }
              } else if (currentPage === 3) {
                setIsLoading(true);
                try {
                  const formattedBirthday = formatDate(birthday!);
                  await apiPost(`/legalEntities/${principalLegalEntity?.id}/birthday`, { birthday: formattedBirthday });
                  updatePrincipalLegalEntity(p => {
                    p.data.info.birthday = formattedBirthday;
                  });
                  setTimeout(
                    () =>
                      scrollViewRef.current?.scrollTo({
                        x: screenWidth * 4,
                        animated: true,
                      }),
                    200,
                  );
                } catch (error: any) {
                  Alert.alert(t('common.error'), error.message);
                } finally {
                  setIsLoading(false);
                }
              } else if (currentPage === 4) {
                setIsLoading(true);
                // Here add logic for trial if eligible.
                try {
                  if (eligibleForTrial) {
                    await Purchases.purchaseSubscriptionOption(
                      eligibleForTrial.product.subscriptionOptions?.find(item => !!item.freePhase)!,
                    );
                  }
                  await apiPost('/users/flag', {
                    name: 'allowedCompanionAI',
                    value: true,
                  });
                  updateProfile(p => {
                    p.flags.allowedCompanionAI = true;
                  });
                } catch (error: any) {
                  showSnackbar(error.message);
                  console.log(error);
                } finally {
                  setIsLoading(false);
                }
              }
            }}
            buttonStyle={styles.modalButton}
            titleStyle={styles.buttonText}
            loading={isLoading}
            disabled={
              isLoading ||
              (currentPage === 2 && !selectedCountry) ||
              (currentPage === 3 && (!birthday || !isValidBirthday(birthday)))
            }
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: screenHeight,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 40,
  },
  page: {
    width: screenWidth,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  modalTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 28,
    color: 'black',
  },
  modalButton: {
    backgroundColor: colors.theme,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    minWidth: 200,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  indicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    marginHorizontal: 5,
  },
  indicatorDotActive: {
    backgroundColor: colors.theme,
  },
  dropdown: {
    width: '80%',
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
  },
  pickerContainer: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
  },
  dateInput: {
    width: 200,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
});

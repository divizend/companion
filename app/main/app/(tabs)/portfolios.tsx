import React from 'react';

import { useSignals } from '@preact/signals-react/runtime';
import { Icon } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import { Dimensions, ImageBackground, Pressable, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, { ICarouselInstance, Pagination } from 'react-native-reanimated-carousel';

import { useUserProfile } from '@/common/profile';
import SectionList from '@/components/SectionList';
import { Button, SafeAreaView, Text } from '@/components/base';
import PortfolioConnectModal from '@/components/features/portfolio-import/PortfolioConnectModal';
import { BankParentIcon } from '@/components/features/portfolio-overview/BankParentIcon';
import { ModalManager } from '@/components/global/modal';
import { useThemeColor } from '@/hooks/useThemeColor';
import { isPortfolioConnectOnboardingVisible, setIsPortfolioConnectOnboardingVisible } from '@/signals/app.signal';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

function PortfolioOnboarding() {
  const { t, i18n } = useTranslation();
  const { colorScheme } = useColorScheme();
  const theme = useThemeColor();

  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  const data = React.useMemo(() => {
    const result = t('portfolioOverview.onBoarding', { returnObjects: true }) as {
      title: string;
      description: string;
    }[];

    return result.map((item, index) => ({
      ...item,
      src: `https://picsum.photos/1920/1080?random=${index}`,
      button: (
        <Button
          containerStyle={{ marginTop: 'auto' }}
          onPress={() => {
            ModalManager.showModal(PortfolioConnectModal);
            setIsPortfolioConnectOnboardingVisible(false);
          }}
        >
          {t('portfolioConnect.cta')}
        </Button>
      ),
    }));
  }, [i18n.language]);

  return (
    <View style={{ flex: 1, marginHorizontal: -20 }}>
      <Carousel<{ src?: string; title: string; description?: string; button: React.ReactNode }>
        ref={ref}
        width={width}
        height={height - 250}
        style={{ marginTop: -20 }}
        data={data}
        onProgressChange={progress}
        renderItem={({ item }) => (
          <View
            className="shadow flex flex-col gap-2 p-5 pb-8"
            style={{
              flex: 1,
              margin: 20,
              borderRadius: 16,
              backgroundColor: theme.backgroundSecondary,
            }}
          >
            <Pressable
              className="rounded-full p-1 mb-3"
              style={{ backgroundColor: theme.backgroundPrimary, marginLeft: 'auto' }}
              onPress={() => setIsPortfolioConnectOnboardingVisible(false)}
            >
              <Icon name="close" type="material" size={20} color={theme.text} />
            </Pressable>
            <ImageBackground
              source={{ uri: item.src }}
              imageStyle={{ borderRadius: 16 }}
              style={{
                width: '100%',
                marginBottom: 22,
                aspectRatio: 16 / 12,
              }}
            >
              {colorScheme === 'dark' && (
                <LinearGradient
                  colors={['transparent', theme.backgroundSecondary]}
                  style={{ height: '100%', width: '100%' }}
                />
              )}
            </ImageBackground>

            <Text h3 className="text-center font-bold">
              {item.title}
            </Text>
            <Text className="text-center">{item.description}</Text>
            {item.button}
          </View>
        )}
      />

      <Pagination.Custom
        progress={progress}
        data={data}
        size={25}
        onPress={onPressPagination}
        dotStyle={{
          width: 10,
          height: 10,
          borderRadius: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          marginHorizontal: 5,
        }}
        activeDotStyle={{
          backgroundColor: theme.theme,
        }}
        containerStyle={{
          height: 10,
          alignItems: 'center',
          marginTop: 5,
        }}
      />
    </View>
  );
}

export default function Portfolios() {
  const { t } = useTranslation();
  const { profile } = useUserProfile();
  const theme = useThemeColor();

  useSignals();

  const filteredPortfolios = profile.depots.filter(d => !d.isClone);

  return (
    <SafeAreaView style={styles.container}>
      <Text className="text-3xl font-bold mb-5">
        {t('portfolioOverview.title')}
        {/* {filteredPortfolios.length ? '(' + filteredPortfolios.length + ')' : undefined} */}
      </Text>

      {/* <Button
        disabled={isPortfolioConnectOnboardingVisible.value}
        onPress={() => (isPortfolioConnectOnboardingVisible.value = true)}
      >
        Onboarding
      </Button> */}

      {isPortfolioConnectOnboardingVisible.value ? (
        <PortfolioOnboarding />
      ) : !filteredPortfolios.length ? (
        <View className="flex-1 flex gap-5 justify-center items-center">
          <Icon name="block" type="material" size={64} color={theme.muted} />
          <Text h3>{t('portfolioOverview.noPortfolios')}</Text>
          <Button onPress={() => ModalManager.showModal(PortfolioConnectModal)}>
            {t('portfolioConnect.bankLogin.title')}
          </Button>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <SectionList
              items={filteredPortfolios.map(portfolio => ({
                leftIcon: <BankParentIcon bankParent={portfolio.bankType} size={25} />,
                title: (
                  <View>
                    <Text h4 className="font-bold line-clamp-1">
                      {portfolio.bankName}
                    </Text>
                    <Text className="line-clamp-1">{portfolio.description || portfolio.number}</Text>
                  </View>
                ),
              }))}
            />
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
});

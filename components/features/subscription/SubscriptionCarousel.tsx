import React, { useState } from 'react';

import { Icon } from '@rneui/themed';
import { Dimensions, ImageBackground, Pressable, View } from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { useSharedValue } from 'react-native-reanimated';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';

import { apiPost } from '@/common/api';
import { clsx } from '@/common/clsx';
import FullScreenActivityIndicator from '@/components/FullScreenActivityIndicator';
import { Button, Text } from '@/components/base';
import { useSnackbar } from '@/components/global/Snackbar';
import { showAlert } from '@/components/global/prompt';
import { usePurchases } from '@/hooks/usePurchases';
import { useThemeColor } from '@/hooks/useThemeColor';
import { t } from '@/i18n';

import { useWaitlistStatus } from './queries';
import { requiresWaitlist } from './util';

type Props = { close: () => void };

export default function SubscriptionCarousel({ close }: Props) {
  const { showSnackbar } = useSnackbar();
  const theme = useThemeColor();
  const { loading, purchasePackages, setCustomerInfo } = usePurchases();
  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage>();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { data, isLoading, refetch } = useWaitlistStatus();

  const handleSubscribe = async (product: PurchasesPackage) => {
    await Purchases.purchasePackage(product)
      .then(makePurchaseResult => setCustomerInfo(makePurchaseResult.customerInfo))
      .catch(err => showSnackbar(err.message, { type: 'error' }));
  };

  if (loading || !purchasePackages || isLoading || !data) return <FullScreenActivityIndicator />;

  const userInWaitlist = !!data.waitingForPoints;

  const isSpotReserved = (purchasePackage: PurchasesPackage): boolean => {
    if (!data.waitingForPoints) return false;
    if (requiresWaitlist(purchasePackage) === data.spotsReserved) return true;
    return false;
  };

  const attemptSubscribe = async (purchasePackage: PurchasesPackage) => {
    try {
      setIsSubscribing(true);

      const pointsRequired = requiresWaitlist(purchasePackage);
      if (!pointsRequired) return await handleSubscribe(purchasePackage);
      // Can purhcase only returns true when the spots were reserved on that call.
      const canPurchase = await apiPost<boolean>('/sponsored-purchase/initialize', {
        points: pointsRequired,
      });
      if (canPurchase || isSpotReserved(purchasePackage)) return await handleSubscribe(purchasePackage);
      else {
        refetch();
        showAlert({
          title: 'You joined the waitlist',
          message:
            'You have opted for a sponsored subscription plan but there are no available spots. We will send you an email when you are ready to finalize the subscription.',
          actions: [{ title: 'OK' }],
        });
      }
    } catch (error) {
      console.error(error);
      showSnackbar('Error', { type: 'error' });
    } finally {
      setIsSubscribing(false);
      close();
    }
  };

  const featureMatrix: { [key: string]: string[] } = {};
  Object.values(purchasePackages).forEach(product => {
    featureMatrix[product.identifier] = [
      ...t(`subscription.commonFeatures`, { returnObjects: true }),
      ...t(`subscription.subscriptionPlans.${product.identifier}.features`, { returnObjects: true }),
    ];
  });

  return (
    <View className="mb-4">
      <Text h1 className="text-center">
        {t('subscription.choosePlan')}
      </Text>
      <Carousel
        ref={ref}
        width={Dimensions.get('window').width}
        height={(Dimensions.get('window').width - 40) / 1.5}
        data={purchasePackages}
        loop={false}
        mode="parallax"
        style={{ marginLeft: -20, marginRight: -20 }}
        modeConfig={{}}
        onProgressChange={progress}
        renderItem={({ item }) => (
          <Pressable className="flex-1" onPress={() => setSelectedPackage(item)}>
            <ImageBackground
              alt="background-bubbles"
              className="flex-1 m-2 rounded-xl"
              imageStyle={{ opacity: 0.3 }}
              source={require('@/assets/images/card-background.png')}
            >
              <View
                key={item.identifier}
                className={clsx(
                  'flex-1 flex flex-row dark:bg-transparent border border-gray-200 rounded-xl justify-between p-6',
                  item.identifier === selectedPackage?.identifier &&
                    'border-theme border-2 bg-[#3939ff1a] dark:bg-[#3939ff1a]',
                )}
              >
                <View className="flex justify-between max-w-[70%]">
                  <Text h2 className="font-bold mb-2 ">
                    {t(`subscription.subscriptionPlans.${item.identifier}.title`)}
                  </Text>
                  <View className="mb-2 max-w-[100%]">
                    {featureMatrix[item.identifier].map((feature, index) => (
                      <View key={index} className="flex flex-row items-start gap-2">
                        <Icon name="check" color={theme.muted} size={18} />
                        <Text className="text-sm" type="muted">
                          {feature}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View>
                  <Text className="text-end" h3>
                    {item.product.priceString}
                  </Text>
                  <Text className="text-end">{t('subscription.monthly')}</Text>
                </View>
              </View>
            </ImageBackground>
          </Pressable>
        )}
      />

      <Button
        disabled={
          !selectedPackage ||
          (userInWaitlist && !isSpotReserved(selectedPackage) && !!requiresWaitlist(selectedPackage))
        }
        loading={isSubscribing}
        onPress={() => selectedPackage && attemptSubscribe(selectedPackage)}
        title={
          <Text
            style={{
              textAlign: 'center',
              color: theme.allColors.dark.text,
              fontSize: 16,
              fontWeight: 'bold',
            }}
          >
            {(!selectedPackage ||
              !requiresWaitlist(selectedPackage) ||
              requiresWaitlist(selectedPackage) <= data.unreservedSpots) &&
              t('subscription.actions.getStarted')}
            {!!selectedPackage &&
            !!requiresWaitlist(selectedPackage) &&
            requiresWaitlist(selectedPackage) > data.unreservedSpots
              ? isSpotReserved(selectedPackage)
                ? t('subscription.actions.spotsReservedSubscribe')
                : userInWaitlist
                  ? t('subscription.actions.alreadyInWaitlist')
                  : t('subscription.actions.joinWaitlist')
              : ''}
          </Text>
        }
        containerStyle={{ borderRadius: 12, width: '85%', alignSelf: 'center' }}
        buttonStyle={{ backgroundColor: theme.theme }}
      />
    </View>
  );
}

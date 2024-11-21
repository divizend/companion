import React from 'react';

import { CheckBox } from '@rneui/themed';
import { ImageBackground, Pressable, ScrollView, View } from 'react-native';
import { PurchasesPackage } from 'react-native-purchases';

import { clsx } from '@/common/clsx';
import FullScreenActivityIndicator from '@/components/FullScreenActivityIndicator';
import { Text } from '@/components/base';
import Accordion from '@/components/base/Accordion';
import { usePurchases } from '@/hooks/usePurchases';
import { useThemeColor } from '@/hooks/useThemeColor';
import { t as tBase } from '@/i18n';

function SubscriptionCard({
  product,
  setSelectedPackage,
  isSelected,
}: {
  product: PurchasesPackage;
  setSelectedPackage: React.Dispatch<React.SetStateAction<PurchasesPackage | undefined>>;
  isSelected: boolean;
}) {
  const theme = useThemeColor();

  return (
    <Pressable key={product.identifier} className="flex-1" onPress={() => setSelectedPackage(product)}>
      <ImageBackground
        alt="background-bubbles"
        className="flex-1 rounded-xl"
        imageStyle={{ opacity: 0.3 }}
        source={require('@/assets/images/card-background.png')}
      >
        <View
          key={product.identifier}
          className={clsx(
            'flex-1 flex flex-row dark:bg-transparent border border-gray-200 rounded-xl justify-between items-start p-5',
            isSelected && 'border-theme border-2 bg-[#3939ff1a] dark:bg-[#3939ff1a]',
          )}
        >
          <View className="flex justify-between max-w-[70%]">
            <Text h3 type="muted" className="font-semibold mb-2 tracking-widest">
              {tBase(`subscription.subscriptionPlans.${product.identifier}.title`)}
            </Text>
            <View>
              <Text className="text-end" h3>
                {product.product.priceString}{' '}
                <Text type="muted" className="font-normal" h4>
                  {tBase('subscription.monthly')}
                </Text>
              </Text>
            </View>
          </View>
          <CheckBox
            wrapperStyle={{ backgroundColor: 'transparent', margin: 0, padding: 0 }}
            iconType="material-community"
            checkedIcon="radiobox-marked"
            uncheckedIcon="radiobox-blank"
            checkedColor={theme.theme}
            containerStyle={{
              backgroundColor: 'transparent',
              margin: 0,
              padding: 0,
              marginLeft: 0,
              marginRight: 0,
            }}
            checked={isSelected}
          />
        </View>
      </ImageBackground>
    </Pressable>
  );
}

export default function SubscriptionOptions({
  selectedPackage,
  setSelectedPackage,
}: {
  selectedPackage: PurchasesPackage | undefined;
  setSelectedPackage: React.Dispatch<React.SetStateAction<PurchasesPackage | undefined>>;
}) {
  const { loading, purchasePackages } = usePurchases();

  const t = (key: string, data?: any) => tBase('subscription.choosePlan.steps.plans.' + key, data);

  // TODO: Disable button when there's no subscription

  // const handleSubscribe = async (product: PurchasesPackage) => {
  //   await Purchases.purchasePackage(product)
  //     .then(makePurchaseResult =>
  //       makePurchaseResult.customerInfo.entitlements.all['divizend-membership']?.store === 'PROMOTIONAL'
  //         ? // If a trial exists, revoke it so the user gets the right package displayed instead of the trial after purchase.
  //           apiDelete('/revoke-trial').then(refreshCustomerInfo)
  //         : setCustomerInfo(makePurchaseResult.customerInfo),
  //     )
  //     .catch(err => showSnackbar(err.message, { type: 'error' }));
  // };

  // if (loading || !purchasePackages || isLoading || !data) return <FullScreenActivityIndicator />;

  // const solidarityProducts = purchasePackages.slice(0, 2);
  // const productsRest = purchasePackages.slice(2);

  // const isSpotReserved = (purchasePackage: PurchasesPackage): boolean => {
  //   if (!data.waitingForPoints) return false;
  //   if (requiresWaitlist(purchasePackage) === data.spotsReserved) return true;
  //   return false;
  // };

  // const attemptSubscribe = async (purchasePackage: PurchasesPackage) => {
  //   try {
  //     setIsSubscribing(true);

  //     const pointsRequired = requiresWaitlist(purchasePackage);
  //     if (!pointsRequired) return await handleSubscribe(purchasePackage);
  //     // Can purhcase only returns true when the spots were reserved on that call.
  //     const canPurchase = await apiPost<boolean>('/sponsored-purchase/initialize', {
  //       points: pointsRequired,
  //     });
  //     if (canPurchase || isSpotReserved(purchasePackage)) return await handleSubscribe(purchasePackage);
  //     else {
  //       refetch();
  //       showAlert({
  //         title: 'You joined the waitlist',
  //         message:
  //           'You have opted for a sponsored subscription plan but there are no available spots. We will send you an email when you are ready to finalize the subscription.',
  //         actions: [{ title: 'OK' }],
  //       });
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     showSnackbar('Error', { type: 'error' });
  //   } finally {
  //     setIsSubscribing(false);
  //   }
  // };

  if (loading || !purchasePackages) return <FullScreenActivityIndicator />;

  const solidarityProducts = purchasePackages.slice(0, 2);
  const productsRest = purchasePackages.slice(2);

  return (
    <ScrollView className="p-4 flex-1 gap-2">
      <Text className="mb-4 text-center" id="title" h2>
        {t('title')}
      </Text>
      <Accordion
        title={t('solidarityPrices')}
        content={
          <View className="flex gap-2">
            {solidarityProducts.map(item => (
              <SubscriptionCard
                key={item.identifier}
                isSelected={selectedPackage?.identifier === item.identifier}
                product={item}
                setSelectedPackage={setSelectedPackage}
              />
            ))}
          </View>
        }
      />

      <View className="flex gap-2">
        {productsRest.map(item => (
          <SubscriptionCard
            key={item.identifier}
            isSelected={selectedPackage?.identifier === item.identifier}
            product={item}
            setSelectedPackage={setSelectedPackage}
          />
        ))}
      </View>

      {/* <Button
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
      /> */}
    </ScrollView>
  );
}

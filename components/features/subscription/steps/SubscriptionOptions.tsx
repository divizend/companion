import React from 'react';

import { CheckBox, Divider, Icon } from '@rneui/themed';
import { ImageBackground, Pressable, ScrollView, View } from 'react-native';
import { PurchasesPackage } from 'react-native-purchases';

import { clsx } from '@/common/clsx';
import FullScreenActivityIndicator from '@/components/FullScreenActivityIndicator';
import { Text } from '@/components/base';
import Accordion from '@/components/base/Accordion';
import { usePurchases } from '@/hooks/usePurchases';
import { useThemeColor } from '@/hooks/useThemeColor';
import { t as tBase } from '@/i18n';

import { useWaitlistStatus } from '../queries';
import { requiresWaitlist } from '../util';

function SubscriptionCard({
  product,
  isActive,
  setSelectedPackage,
  isSelected,
  awaitedPackage,
}: {
  product: PurchasesPackage;
  isActive?: boolean;
  setSelectedPackage: React.Dispatch<React.SetStateAction<PurchasesPackage | undefined>>;
  isSelected: boolean;
  awaitedPackage?: PurchasesPackage;
}) {
  const theme = useThemeColor();
  const { data, isLoading } = useWaitlistStatus();
  const t = (key: string, data?: any) => tBase('subscription.choosePlan.steps.plans.' + key, data);

  if (!data || isLoading) return null;
  const requiredPoints = requiresWaitlist(product);
  const isReserved = !!requiredPoints && data.spotsReserved === requiredPoints;

  return (
    <Pressable
      key={product.identifier}
      className="flex-1"
      onPress={() =>
        (awaitedPackage?.identifier !== product.identifier || isReserved) && !isActive && setSelectedPackage(product)
      }
    >
      <ImageBackground
        alt="background-bubbles"
        className="flex-1 rounded-xl"
        imageStyle={{ opacity: 0.3 }}
        source={require('@/assets/images/card-background.png')}
      >
        <View
          key={product.identifier}
          className={clsx(
            'flex-1 flex flex-row dark:bg-transparent border-2 border-gray-200 rounded-xl justify-between items-start p-5',
            isSelected && 'border-theme border-2 bg-[#3939ff1a] dark:bg-[#3939ff1a]',
          )}
        >
          <View className="flex justify-between max-w-[70%]">
            <Text h3 type="muted" className="font-semibold mb-2 tracking-widest">
              {tBase(`subscription.subscriptionPlans.${product.identifier}.title`)}
            </Text>
            <View className="flex flex-row justify-between">
              <Text h3>
                {product.product.priceString}{' '}
                <Text type="muted" className="font-normal" h4>
                  {tBase('subscription.monthly')}
                </Text>
              </Text>
            </View>
          </View>
          <View className="flex justify-between h-full items-end">
            <CheckBox
              wrapperStyle={{ backgroundColor: 'transparent', margin: 0, padding: 0 }}
              iconType="material-community"
              checkedIcon="radiobox-marked"
              uncheckedIcon="radiobox-blank"
              checkedColor={
                (awaitedPackage?.identifier === product.identifier && !isReserved) || isActive
                  ? theme.muted
                  : theme.theme
              }
              containerStyle={{
                backgroundColor: 'transparent',
                margin: 0,
                padding: 0,
                marginLeft: 0,
                marginRight: 0,
              }}
              checked={(awaitedPackage?.identifier === product.identifier && !isReserved) || isSelected || !!isActive}
            />
            {isReserved && (
              <Text className="py-1 px-2 bg-theme rounded-sm text-lime-50 shadow-theme shadow-md">{t('reserved')}</Text>
            )}
            {isActive && (
              <Text className="py-1 px-2 bg-theme rounded-sm text-lime-50 shadow-theme shadow-md">{t('active')}</Text>
            )}
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

export default function SubscriptionOptions({
  selectedPackage,
  setSelectedPackage,
  awaitedPackage,
}: {
  selectedPackage: PurchasesPackage | undefined;
  setSelectedPackage: React.Dispatch<React.SetStateAction<PurchasesPackage | undefined>>;
  awaitedPackage?: PurchasesPackage;
}) {
  const { loading, purchasePackages, customerInfo } = usePurchases();
  const { data, isLoading } = useWaitlistStatus();
  const theme = useThemeColor();

  const t = (key: string, data?: any) => tBase('subscription.choosePlan.steps.plans.' + key, data);

  if (loading || !purchasePackages || isLoading || !data) return <FullScreenActivityIndicator />;

  const solidarityProducts = purchasePackages.slice(0, 2);
  const productsRest = purchasePackages.slice(2);

  const entitlement = customerInfo?.entitlements.active['divizend-membership'];

  const activeSubscription = !entitlement
    ? undefined
    : purchasePackages.find(purchasePackage => {
        return (
          purchasePackage.product.identifier ===
            entitlement.productIdentifier + ':' + entitlement.productPlanIdentifier ||
          purchasePackage.product.identifier === entitlement.productIdentifier
        );
      });

  return (
    <ScrollView className="p-4 flex-1 gap-2">
      <Text className="mb-4 text-center" id="title" h2>
        {t('title')}
      </Text>
      {!!awaitedPackage && (
        <View className="flex items-center bg-secondary-light dark:bg-secondary-dark px-2 py-5 rounded-xl gap-3 mb-8 shadow-lg">
          <View className="bg-primary-light dark:bg-primary-dark rounded-3xl p-2">
            <Icon name="info" type="material" size={20} color={theme.text} />
          </View>
          <Text h4 className="max-w-[85%] font-bold text-center">
            {tBase('subscription.currentPlan.waitlist.title', {
              name: tBase(`subscription.subscriptionPlans.${awaitedPackage.identifier}.title`),
            })}
          </Text>
          <Text type="muted" className="max-w-[95%] text-center">
            {t('positionDisclaimer')}
          </Text>
        </View>
      )}
      <Accordion
        title={t('solidarityPrices')}
        initiallyOpen={!!awaitedPackage}
        content={
          <View className="flex gap-2">
            {entitlement && entitlement?.store !== 'PROMOTIONAL' ? (
              <View className="flex items-center bg-secondary-light dark:bg-secondary-dark px-2 py-5 rounded-xl gap-3 shadow-lg">
                <View className="bg-primary-light dark:bg-primary-dark rounded-3xl p-2">
                  <Icon name="warning" type="material" size={20} color={theme.text} />
                </View>
                <Text h4 className="max-w-[85%] font-bold text-center">
                  {t('crossgrading.sponsored.title')}
                </Text>
                <Text type="muted" className="max-w-[95%] text-center">
                  {t('crossgrading.sponsored.description')}
                </Text>
              </View>
            ) : (
              solidarityProducts.map(item => (
                <SubscriptionCard
                  awaitedPackage={awaitedPackage}
                  key={item.identifier}
                  isSelected={selectedPackage?.identifier === item.identifier}
                  product={item}
                  setSelectedPackage={setSelectedPackage}
                />
              ))
            )}
            <Divider style={{ marginHorizontal: 40, marginVertical: 5 }} width={1} />
          </View>
        }
      />
      <View className={clsx('flex gap-2 mb-6')}>
        {productsRest.map(item => (
          <SubscriptionCard
            isActive={item.identifier === activeSubscription?.identifier}
            key={item.identifier}
            isSelected={selectedPackage?.identifier === item.identifier}
            product={item}
            setSelectedPackage={setSelectedPackage}
          />
        ))}
      </View>
    </ScrollView>
  );
}

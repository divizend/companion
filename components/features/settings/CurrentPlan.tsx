import React from 'react';

import { Icon } from '@rneui/base';
import * as Linking from 'expo-linking';
import { ActivityIndicator, View } from 'react-native';

import { clsx } from '@/common/clsx';
import StyledButton from '@/components/StyledButton';
import { ScrollScreen, Text } from '@/components/base';
import '@/global.css';
import { usePrompt } from '@/hooks/usePrompt';
import { usePurchases } from '@/hooks/usePurchases';
import { useThemeColor } from '@/hooks/useThemeColor';
import { t } from '@/i18n';

import SubscriptionCarousel from '../subscription/SubscriptionCarousel';
import { requiresWaitlist } from '../subscription/util';
import { useWaitlistStatus } from './queries';

export default function CurrentPlan() {
  const theme = useThemeColor();
  const { showCustom } = usePrompt();
  const { purchasePackages, loading, customerInfo } = usePurchases();
  const { data, isLoading } = useWaitlistStatus();

  if (loading || !customerInfo || !purchasePackages || isLoading || !data)
    return (
      <View className="flex-1 justify-center">
        <ActivityIndicator />
      </View>
    );

  const activeSubscription =
    JSON.stringify(customerInfo.entitlements.active) === '{}'
      ? undefined
      : purchasePackages.find(purchasePackage => {
          const plan = customerInfo.entitlements.active['divizend-membership'];
          return (
            purchasePackage.product.identifier === plan.productIdentifier + ':' + plan.productPlanIdentifier ||
            purchasePackage.product.identifier === plan.productIdentifier
          );
        });

  const awaitedPurchasePackage =
    !!data.waitingForPoints &&
    purchasePackages.find(purchasePackage => requiresWaitlist(purchasePackage) === data.waitingForPoints);

  return (
    <>
      <ScrollScreen style={{ flex: 1 }}>
        <View
          className={clsx(
            'rounded-full bg-secondary-light mb-8 self-center p-8 shadow-lg',
            !!activeSubscription ? 'shadow-theme' : 'shadow-muted',
          )}
        >
          <Icon
            color={!!activeSubscription ? theme.theme : theme.muted}
            name="crown-outline"
            type="material-community"
            size={80}
          ></Icon>
        </View>

        <View className="flex flex-row justify-center items-center gap-2">
          <View
            className={clsx(
              'w-2 h-2 dark:bg-green-400 bg-green-600 rounded-full',
              !activeSubscription && 'bg-red-500 dark:bg-red-500',
            )}
          />
          <Text type={!!activeSubscription ? 'success' : 'danger'} className="text-center">
            {!!activeSubscription ? t('subscription.currentPlan.active') : t('subscription.currentPlan.inactive')}
          </Text>
        </View>
        <Text h1 className="text-center mb-8 font-semibold">
          {activeSubscription?.product.title || t('subscription.currentPlan.noActiveSubscription')}
        </Text>

        {/* Free tiral notice */}
        {!!activeSubscription &&
          customerInfo.entitlements.active['divizend-membership'].periodType === 'TRIAL' &&
          activeSubscription && (
            <View className="flex items-center bg-secondary-light dark:bg-secondary-dark px-2 py-5 rounded-xl gap-3 mb-8 shadow-lg">
              <View className="bg-primary-light dark:bg-primary-dark rounded-3xl p-2">
                <Icon name="info" type="material" size={20} color={theme.text} />
              </View>
              <Text h4 className="max-w-[85%] font-bold text-center">
                {t('subscription.currentPlan.freeTrial.ends', {
                  date: new Date(customerInfo.entitlements.active['divizend-membership'].expirationDateMillis!),
                })}
              </Text>
              <Text type="muted" className="max-w-[95%] text-center">
                {t('subscription.currentPlan.freeTrial.after', {
                  price: activeSubscription.product.pricePerMonthString,
                })}
              </Text>
            </View>
          )}

        {/* Waitlist information */}
        {!!awaitedPurchasePackage && (
          <View className="flex items-center bg-secondary-light dark:bg-secondary-dark px-2 py-5 rounded-xl gap-3 mb-8 shadow-lg">
            <View className="bg-primary-light dark:bg-primary-dark rounded-3xl p-2">
              <Icon name="info" type="material" size={20} color={theme.text} />
            </View>
            <Text h4 className="max-w-[85%] font-bold text-center">
              You are in the waiting list for{' '}
              {t(`subscription.subscriptionPlans.${awaitedPurchasePackage.identifier}.title`)}
            </Text>
            <Text type="muted" className="max-w-[95%] text-center">
              {data.spotsReserved === data.waitingForPoints
                ? 'You have until. You can now subscribe to Companion for a reduced price.'
                : 'You are yet to be selected to get the sponsorship.'}
            </Text>
          </View>
        )}
        {/* Plan details table */}
        {!!activeSubscription && (
          <View className="gap-4 mb-8 px-6 py-5">
            <View className="flex flex-row">
              <Text type="muted" className="flex-1">
                {t('subscription.currentPlan.table.plan')}
              </Text>
              <Text className="flex-1 font-bold">
                {t(`subscription.subscriptionPlans.${activeSubscription.identifier}.title`)}
              </Text>
            </View>

            <View className="flex flex-row">
              <Text type="muted" className="flex-1">
                {t('subscription.currentPlan.table.price')}
              </Text>
              <Text className="flex-1 font-bold">{activeSubscription.product.pricePerMonthString}</Text>
            </View>

            <View className="flex flex-row">
              <Text type="muted" className="flex-1">
                {t('subscription.currentPlan.table.expiresAt')}
              </Text>
              <Text className="flex-1 font-bold">
                {t('{{date,dayLongAndTime}}', {
                  date: customerInfo.entitlements.active['divizend-membership'].expirationDate,
                })}
              </Text>
            </View>
          </View>
        )}
      </ScrollScreen>
      <View className="flex gap-2 bg-primary-light p-5 pt-0">
        {!activeSubscription && (
          <StyledButton
            title={
              <Text
                style={{
                  textAlign: 'center',
                  color: theme.allColors.dark.text,
                  fontSize: 18,
                  fontWeight: 'bold',
                }}
              >
                {t('subscription.actions.subscribe')}
              </Text>
            }
            onPress={() => showCustom(SubscriptionCarousel)}
            buttonStyle={{ backgroundColor: theme.theme, borderRadius: 12, paddingVertical: 15 }}
          />
        )}
        {!!activeSubscription && (
          <StyledButton
            onPress={() => customerInfo.managementURL && Linking.openURL(customerInfo.managementURL)}
            title={
              <Text
                style={{
                  textAlign: 'center',
                  color: theme.text,
                  fontSize: 18,
                  fontWeight: 'bold',
                }}
              >
                {t('subscription.actions.managePlan')}
              </Text>
            }
            buttonStyle={{ borderRadius: 12, backgroundColor: theme.backgroundSecondary, paddingVertical: 15 }}
          />
        )}
      </View>
    </>
  );
}

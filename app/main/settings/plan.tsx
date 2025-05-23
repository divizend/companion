import React, { useState } from 'react';

import { Icon } from '@rneui/base';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, View } from 'react-native';
import Purchases from 'react-native-purchases';

import { apiDelete } from '@/common/api';
import { clsx } from '@/common/clsx';
import { useUserProfile } from '@/common/profile';
import FullScreenActivityIndicator from '@/components/FullScreenActivityIndicator';
import { Button, ScrollScreen, Text } from '@/components/base';
import SubscriptionModal from '@/components/features/subscription/SubscriptionModal';
import { useWaitlistStatus } from '@/components/features/subscription/queries';
import { requiresWaitlist } from '@/components/features/subscription/util';
import { useSnackbar } from '@/components/global/Snackbar';
import { ModalManager } from '@/components/global/modal';
import { showAlert } from '@/components/global/prompt';
import '@/global.css';
import { usePurchases } from '@/hooks/usePurchases';
import { useThemeColor } from '@/hooks/useThemeColor';

const showSubscriptionModal = () => ModalManager.showModal(SubscriptionModal);

export default function CurrentPlan() {
  const { t } = useTranslation();
  const theme = useThemeColor();
  const { profile } = useUserProfile();
  const { purchasePackages, loading, customerInfo, refreshCustomerInfo, setCustomerInfo } = usePurchases();
  const { data, isLoading, refetch } = useWaitlistStatus();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { showSnackbar } = useSnackbar();

  if (loading || !customerInfo || !purchasePackages || isLoading || !data || !profile)
    return <FullScreenActivityIndicator />;

  const entitlement = customerInfo.entitlements.active['divizend-membership'];

  const activeSubscription = !entitlement
    ? undefined
    : purchasePackages.find(purchasePackage => {
        return (
          purchasePackage.product.identifier ===
            entitlement.productIdentifier + ':' + entitlement.productPlanIdentifier ||
          purchasePackage.product.identifier === entitlement.productIdentifier
        );
      });

  const awaitedPurchasePackage = !!data.waitingForPoints
    ? purchasePackages.find(purchasePackage => requiresWaitlist(purchasePackage) === data.waitingForPoints)
    : undefined;

  return (
    <View className={clsx('flex-1')}>
      <ScrollScreen style={{ flex: 1 }}>
        <View
          className={clsx(
            'rounded-full bg-secondary-light mb-8 self-center p-8 shadow-lg',
            !!entitlement ? 'shadow-theme' : 'shadow-muted',
          )}
        >
          <Icon
            color={!!entitlement ? theme.theme : theme.muted}
            name="crown-outline"
            type="material-community"
            size={80}
          ></Icon>
        </View>

        <View className="flex flex-row justify-center items-center gap-2">
          <View
            className={clsx(
              'w-2 h-2 dark:bg-green-400 bg-green-600 rounded-full',
              !entitlement && 'bg-red-500 dark:bg-red-500',
            )}
          />
          <Text type={!!entitlement ? 'success' : 'danger'} className="text-center">
            {!!entitlement ? t('subscription.currentPlan.active') : t('subscription.currentPlan.inactive')}
          </Text>
        </View>
        <Text h1 className="text-center mb-8 font-semibold">
          {!!entitlement
            ? !!profile.flags.canAccessCompanionFeaturesWithoutSubscription
              ? t('subscription.currentPlan.privilegedAccess')
              : t('subscription.currentPlan.membership')
            : t('subscription.currentPlan.noActiveSubscription')}
        </Text>

        {/* Priviliged access notice */}
        {!!profile.flags.canAccessCompanionFeaturesWithoutSubscription && (
          <View className="flex items-center bg-secondary-light dark:bg-secondary-dark px-2 py-5 rounded-xl gap-3 mb-8 shadow-lg">
            <View className="bg-primary-light dark:bg-primary-dark rounded-3xl p-2">
              <Icon name="info" type="material" size={20} color={theme.text} />
            </View>
            <Text h4 className="max-w-[85%] font-bold text-center">
              {t('subscription.currentPlan.unlimitedAccess.title')}
            </Text>
            <Text type="muted" className="max-w-[95%] text-center">
              {t('subscription.currentPlan.unlimitedAccess.subtitle')}
            </Text>
          </View>
        )}

        {/* Free tiral notice */}
        {!!entitlement && entitlement.store === 'PROMOTIONAL' && (
          <View className="flex items-center bg-secondary-light dark:bg-secondary-dark px-2 py-5 rounded-xl gap-3 mb-8 shadow-lg">
            <View className="bg-primary-light dark:bg-primary-dark rounded-3xl p-2">
              <Icon name="info" type="material" size={20} color={theme.text} />
            </View>
            <Text h4 className="max-w-[85%] font-bold text-center">
              {t('subscription.currentPlan.freeTrial.ends', {
                date: new Date(entitlement.expirationDateMillis!),
              })}
            </Text>
            <Text type="muted" className="max-w-[95%] text-center">
              {t('subscription.currentPlan.freeTrial.after')}
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
              {t('subscription.currentPlan.waitlist.title', {
                name: t(`subscription.subscriptionPlans.${awaitedPurchasePackage.identifier}.title`),
              })}
            </Text>
            <Text type="muted" className="max-w-[95%] text-center">
              {data.spotsReserved === data.waitingForPoints
                ? t('subscription.currentPlan.waitlist.ready')
                : t('subscription.currentPlan.waitlist.waiting')}
            </Text>
            {data.spotsReserved !== data.waitingForPoints && (
              <Text type="muted" className="max-w-[95%] text-center">
                {t('subscription.currentPlan.waitlist.notification')}
              </Text>
            )}
            {data.spotsReserved === data.waitingForPoints && (
              <View className="mt-3 w-full">
                <Button
                  loading={isSubscribing}
                  buttonStyle={{ backgroundColor: theme.theme, borderRadius: 12, paddingVertical: 10 }}
                  title={'Activate now'}
                  onPress={async () => {
                    setIsSubscribing(true);
                    await Purchases.purchasePackage(awaitedPurchasePackage)
                      .then(makePurchaseResult => {
                        if (
                          makePurchaseResult.customerInfo.entitlements.all['divizend-membership']?.store ===
                          'PROMOTIONAL'
                        )
                          // If a trial exists, revoke it so the user gets the right package displayed instead of the trial after purchase.
                          apiDelete('/revoke-trial').then(refreshCustomerInfo);
                        else setCustomerInfo(makePurchaseResult.customerInfo);
                        refetch();
                      })
                      .catch(err => showSnackbar(err.message, { type: 'error' }))
                      .finally(() => setIsSubscribing(false));
                  }}
                />
              </View>
            )}
          </View>
        )}
        {/* Plan details table */}
        {!!activeSubscription && (
          <View className="gap-4 mb-8 px-6 py-5">
            <View className="flex flex-row">
              <Text type="muted" className="flex-1">
                {t('subscription.currentPlan.table.price')}
              </Text>
              <Text className="flex-1 font-bold">{activeSubscription.product.pricePerMonthString}</Text>
            </View>

            <View className="flex flex-row">
              <Text type="muted" className="flex-1">
                {!!entitlement.unsubscribeDetectedAtMillis
                  ? t('subscription.currentPlan.table.expiresAt')
                  : t('subscription.currentPlan.table.renewsAt')}
              </Text>
              <Text className="flex-1 font-bold">
                {/* TODO: Make it dayLongUTC instead (leave it long for dev reasons) */}
                {t('{{date,dayLongAndTime}}', {
                  date: customerInfo.entitlements.active['divizend-membership'].expirationDate,
                })}
              </Text>
            </View>

            {!!entitlement.unsubscribeDetectedAtMillis && (
              <View className="flex flex-row">
                <Text type="muted" className="flex-1">
                  {t('subscription.currentPlan.table.cancelledAt')}
                </Text>
                <Text className="flex-1 font-bold">
                  {t('{{date,dayLongAndTime}}', {
                    date: new Date(entitlement.unsubscribeDetectedAtMillis),
                  })}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollScreen>
      {!profile.flags.canAccessCompanionFeaturesWithoutSubscription && (
        <View
          className={clsx(
            'flex gap-2 p-5 pb-8 pt-0 bg-primary-light dark:bg-primary-dark',
            Platform.OS === 'ios' && 'pb-10',
          )}
        >
          {!activeSubscription && (
            <Button
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
              onPress={showSubscriptionModal}
              buttonStyle={{ backgroundColor: theme.theme, borderRadius: 12, paddingVertical: 15 }}
            />
          )}
          {!!activeSubscription && (
            <Button
              onPress={() =>
                showAlert({
                  title: t('subscription.actions.managePlan.title'),
                  actions: [
                    {
                      title: t('subscription.actions.managePlan.change'),
                      // This is a temporary solution that fixes the problem where the modal is rendered while the
                      // Prompt is still rendered and is doing close animation.
                      onPress: () =>
                        setTimeout(() => ModalManager.showModal(SubscriptionModal, { skipFirstStep: true })),
                    },
                    {
                      title: t('subscription.actions.managePlan.cancelOrPause'),
                      onPress: () => customerInfo.managementURL && Linking.openURL(customerInfo.managementURL),
                    },
                  ],
                })
              }
              title={
                <Text
                  style={{
                    textAlign: 'center',
                    color: theme.text,
                    fontSize: 18,
                    fontWeight: 'bold',
                  }}
                >
                  {t('subscription.actions.managePlan.title')}
                </Text>
              }
              buttonStyle={{ borderRadius: 12, backgroundColor: theme.backgroundSecondary, paddingVertical: 15 }}
            />
          )}
        </View>
      )}
    </View>
  );
}

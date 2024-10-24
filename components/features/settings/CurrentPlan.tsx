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
import { l } from '@/i18n';

import SubscriptionCarousel from '../subscription/SubscriptionCarousel';

export default function CurrentPlan() {
  const theme = useThemeColor();
  const { showCustom } = usePrompt();
  const { products, loading, customerInfo } = usePurchases();

  if (loading || !customerInfo || !products)
    return (
      <View className="flex-1 justify-center">
        <ActivityIndicator />
      </View>
    );

  const activeSubscription =
    JSON.stringify(customerInfo.entitlements.active) === '{}'
      ? undefined
      : products.find(product => {
          const plan = customerInfo.entitlements.active['divizend-membership'];
          return product.identifier === plan.productIdentifier + ':' + plan.productPlanIdentifier;
        });

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
            {!!activeSubscription ? 'Active' : 'Inactive'}
          </Text>
        </View>
        <Text h1 className="text-center mb-8 font-semibold">
          {activeSubscription?.title || 'No active subscription'}
        </Text>

        {/* Free tiral notice */}
        {/* <View className="flex items-center bg-secondary-light dark:bg-secondary-dark px-2 py-5 rounded-xl gap-3 mb-8 shadow-lg">
          <View className="bg-primary-light dark:bg-primary-dark rounded-3xl p-2">
            <Icon name="info" type="material" size={20} color={theme.text} />
          </View>
          <Text h4 className="max-w-[85%] font-bold text-center">
            Your free trial will end on July 1, 2024 at 12:00 AM
          </Text>
          <Text type="muted" className="max-w-[95%] text-center">
            After that you will be automatically billed $49.99
          </Text>
        </View> */}
        {/* Plan details table */}
        {!!activeSubscription && (
          <View className="gap-4 mb-8 px-6 py-5">
            <View className="flex flex-row">
              <Text type="muted" className="flex-1">
                Plan
              </Text>
              <Text className="flex-1 font-bold">{activeSubscription.description}</Text>
            </View>

            <View className="flex flex-row">
              <Text type="muted" className="flex-1">
                Price
              </Text>
              <Text className="flex-1 font-bold">{activeSubscription.pricePerMonthString}</Text>
            </View>

            <View className="flex flex-row">
              <Text type="muted" className="flex-1">
                Expires at
              </Text>
              <Text className="flex-1 font-bold">
                {l('date.formats.long', customerInfo.entitlements.active['divizend-membership'].expirationDate)}
              </Text>
            </View>

            <View className="flex flex-row">
              <Text type="muted" className="flex-1">
                Will renew
              </Text>
              <Text className="flex-1 font-bold">
                {customerInfo.entitlements.active['divizend-membership'].willRenew ? 'Yes' : 'No'}
              </Text>
            </View>
          </View>
        )}
      </ScrollScreen>
      <View className="flex gap-2">
        <StyledButton
          title={
            <Text
              style={{
                textAlign: 'center',
                color: theme.allColors.dark.text,
                fontSize: 16,
                fontWeight: 'bold',
              }}
            >
              Manage plan
            </Text>
          }
          onPress={() => showCustom(SubscriptionCarousel)}
          buttonStyle={{ backgroundColor: theme.theme, borderRadius: 12 }}
        />
        {!!activeSubscription && (
          <StyledButton
            onPress={() => customerInfo.managementURL && Linking.openURL(customerInfo.managementURL)}
            title={
              <Text
                style={{
                  textAlign: 'center',
                  color: theme.text,
                  fontSize: 16,
                  fontWeight: 'bold',
                }}
              >
                Cancel plan
              </Text>
            }
            buttonStyle={{ borderRadius: 12, backgroundColor: theme.backgroundSecondary }}
          />
        )}
      </View>
    </>
  );
}

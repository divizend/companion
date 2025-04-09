import React from 'react';

import { Icon } from '@rneui/themed';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { isPaywallPressed, isPaywallVisible } from '@/signals/app.signal';

import { Text } from '../base';
import SubscriptionModal from '../features/subscription/SubscriptionModal';
import { ModalManager } from './modal';

export default function Paywall() {
  const handlePress = () => {
    if (!!isPaywallPressed.value) return;
    isPaywallPressed.value = true;
    ModalManager.showModal(SubscriptionModal);
    // Reset after a short delay
    setTimeout(() => (isPaywallPressed.value = false), 500);
  };

  useFocusEffect(() => {
    isPaywallVisible.value = true;

    return () => {
      isPaywallVisible.value = false;
    };
  });

  return (
    <Pressable
      onPress={handlePress}
      disabled={isPaywallPressed.value}
      style={{
        ...StyleSheet.absoluteFillObject,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        justifyContent: 'flex-end',
        alignItems: 'center',
      }}
    />
  );
}

export function PaywallBottomTab() {
  const { t } = useTranslation();
  const theme = useThemeColor();

  const handlePress = () => {
    if (!!isPaywallPressed.value) return;
    isPaywallPressed.value = true;
    ModalManager.showModal(SubscriptionModal);
    // Reset after a short delay
    setTimeout(() => (isPaywallPressed.value = false), 500);
  };

  return (
    <Pressable
      onPress={handlePress}
      className="bg-primary-light dark:bg-primary-dark w-full py-3 px-5 shadow-[0_-2px_4px_rgba(0,0,0,0.1)]"
    >
      <View className="flex-row justify-between">
        <Text h4 className="font-semibold max-w-[90%]">
          {t('subscription.paywall.reservedForMembers')}
        </Text>
        <Icon type="material-community" name="lock-outline" color={theme.theme} />
      </View>
      <Text type="muted" className="text-sm">
        {t('subscription.paywall.pressToStart')}
      </Text>
    </Pressable>
  );
}

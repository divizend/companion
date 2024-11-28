import React, { useState } from 'react';

import { Icon } from '@rneui/themed';
import { Pressable, StyleSheet, View } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { t } from '@/i18n';

import { Text } from '../base';
import SubscriptionModal from '../features/subscription/SubscriptionModal';
import { ModalManager } from './modal';

export default function Paywall() {
  const theme = useThemeColor();
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    if (isPressed) return;
    setIsPressed(true);
    ModalManager.showModal(SubscriptionModal);
    // Reset after a short delay
    setTimeout(() => setIsPressed(false), 500);
  };
  return (
    <Pressable
      onPress={handlePress}
      disabled={isPressed}
      className="justify-end items-center"
      style={{
        ...StyleSheet.absoluteFillObject,
        bottom: 49,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
      }}
    >
      <View className="bg-primary-light dark:bg-primary-dark w-full py-3 px-5 shadow-[0_-2px_4px_rgba(0,0,0,0.1)]">
        <View className="flex-row justify-between">
          <Text h4 className="font-semibold">
            {t('paywall.reservedForMembers')}
          </Text>
          <Icon type="material-community" name="lock-outline" color={theme.theme} />
        </View>
        <Text type="muted" className="text-sm">
          {t('paywall.pressToStart')}
        </Text>
      </View>
    </Pressable>
  );
}

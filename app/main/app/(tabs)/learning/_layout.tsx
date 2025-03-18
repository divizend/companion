import React from 'react';

import { Stack } from 'expo-router';

import Paywall from '@/components/global/Paywall';
import { usePurchases } from '@/hooks/usePurchases';

export default function Layout() {
  const { customerInfo } = usePurchases();

  return (
    <>
      <Stack
        initialRouteName={'index'}
        // Needed to change because the default animation for Android doesn't work well with BlurView
        // slide_from_right is a setting only for Android, it falls back to default for iOS
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      />
      {!customerInfo?.entitlements.active['divizend-membership'] && <Paywall />}
    </>
  );
}

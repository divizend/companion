import React from 'react';

import { Redirect, Stack } from 'expo-router';

import { useUserProfile } from '@/common/profile';
import FullScreenActivityIndicator from '@/components/FullScreenActivityIndicator';
import { usePurchases } from '@/hooks/usePurchases';

export default function Layout() {
  const { customerInfo, loading } = usePurchases();
  const { profile } = useUserProfile();

  if (!profile.flags.allowedCompanionAI) return <Redirect href="/main/onboarding" />;
  if (!customerInfo || loading) return <FullScreenActivityIndicator />;
  if (!customerInfo.entitlements.active['divizend-membership'])
    return <Redirect href={{ pathname: '/main/settings/plan', params: { subscriptionInactive: 'true' } }} />;

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

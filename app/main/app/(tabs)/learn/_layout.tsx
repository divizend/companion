import React from 'react';

import { Stack } from 'expo-router';

import { useUserProfile } from '@/common/profile';

export default function Layout() {
  const { companionProfile } = useUserProfile();

  return (
    <Stack
      initialRouteName={companionProfile.goalSetupDone ? 'realize-goals' : 'insights'}
      // Needed to change because the default animation for Android doesn't work well with BlurView
      // slide_from_right is a setting only for Android, it falls back to default for iOS
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    />
  );
}

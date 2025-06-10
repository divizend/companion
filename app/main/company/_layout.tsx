import React from 'react';

import { Slot } from 'expo-router';
import { Platform, View } from 'react-native';

import { SafeAreaView } from '@/components/base';

export default function Layout() {
  const ParentView = Platform.OS === 'ios' ? View : SafeAreaView;

  return (
    <ParentView className="flex-1 dark:bg-primary-dark bg-primary-light">
      <Slot />
    </ParentView>
  );
}

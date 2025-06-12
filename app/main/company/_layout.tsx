import React from 'react';

import { Slot } from 'expo-router';

import { SafeAreaView } from '@/components/base';

export default function Layout() {
  return (
    <SafeAreaView className="flex-1 dark:bg-primary-dark bg-primary-light">
      <Slot />
    </SafeAreaView>
  );
}

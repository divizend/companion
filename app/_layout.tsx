import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import PromptProvider from '@/hooks/usePrompt';
import { RevenueCatProvider } from '@/hooks/usePurchases';

import '../global.css';

export const queryClient = new QueryClient();

export default function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <GestureHandlerRootView>
          <PromptProvider>
            <RevenueCatProvider>
              <Slot />
            </RevenueCatProvider>
          </PromptProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import React from 'react';
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

export const queryClient = new QueryClient();

export default function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Slot />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

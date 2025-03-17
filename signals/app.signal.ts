import { signal } from '@preact/signals-react';
import * as SecureStore from 'expo-secure-store';

export const isHeaderVisible = signal(false);

export const isPaywallVisible = signal(false);

export const isPaywallPressed = signal(false);

export const isPortfolioConnectOnboardingVisible = signal(true);

export const setIsPortfolioConnectOnboardingVisible = (value: boolean) => {
  isPortfolioConnectOnboardingVisible.value = value;
  SecureStore.setItemAsync('isPortfolioConnectOnboardingVisible', JSON.stringify(value));
};

SecureStore.getItemAsync('isPortfolioConnectOnboardingVisible').then(value => {
  isPortfolioConnectOnboardingVisible.value = value ? JSON.parse(value) : true;
});

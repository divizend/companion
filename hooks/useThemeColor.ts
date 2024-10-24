/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */
import { useEffect } from 'react';

import * as SecureStore from 'expo-secure-store';
import { useColorScheme } from 'nativewind';

import { Colors } from '@/constants/Colors';

export function useThemeColor() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const theme = colorScheme ?? 'light';
  useEffect(() => {
    const storedTheme = SecureStore.getItem('theme');
    if (!storedTheme) SecureStore.setItemAsync('theme', theme);
    if (storedTheme !== theme) toggleColorScheme();
  }, []);

  return {
    ...Colors[theme as 'light' | 'dark'],
    style: theme,
    allColors: Colors,
    toggleTheme: () => {
      SecureStore.setItem('theme', theme === 'dark' ? 'light' : 'dark');
      toggleColorScheme();
    },
  };
}

/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useColorScheme } from 'nativewind';
import { useColorScheme as getSystemTheme } from 'react-native';

import { Colors } from '@/constants/Colors';

export function useThemeColor() {
  let theme = useColorScheme().colorScheme ?? 'light';
  if (theme === 'system') theme = getSystemTheme() ?? 'light';

  return Colors[theme as 'light' | 'dark'];
}

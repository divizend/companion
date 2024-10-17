/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */
import { useColorScheme } from 'nativewind';

import { Colors } from '@/constants/Colors';

export function useThemeColor() {
  const theme = useColorScheme().colorScheme ?? 'light';
  return { ...Colors[theme as 'light' | 'dark'], style: theme, allColors: Colors };
}

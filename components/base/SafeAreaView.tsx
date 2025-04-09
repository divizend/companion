import React from 'react';

import { SafeAreaView as NativeSafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';

import { useThemeColor } from '@/hooks/useThemeColor';

type Props = SafeAreaViewProps;

export function SafeAreaView({ children, style, ...props }: Props) {
  const theme = useThemeColor();

  return (
    <NativeSafeAreaView
      {...props}
      style={[
        {
          backgroundColor: theme.backgroundPrimary,
          flex: 1,
        },
        style,
      ]}
    >
      {children}
    </NativeSafeAreaView>
  );
}

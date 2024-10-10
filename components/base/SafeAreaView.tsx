import React from 'react';

import { SafeAreaView as NativeSafeAreaView, ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

type Props = ViewProps;

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

import React, { forwardRef } from 'react';

import { ScrollView as NativeScrollView, ScrollViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

type Props = ScrollViewProps;

export type ScrollViewRef = NativeScrollView;

export const ScrollView = forwardRef<NativeScrollView, Props>(
  ({ children, style, contentContainerStyle, ...props }, ref) => {
    const theme = useThemeColor();

    return (
      <NativeScrollView
        {...props}
        ref={ref}
        style={[
          {
            backgroundColor: theme.backgroundPrimary,
            flex: 1,
          },
          style,
        ]}
        contentContainerStyle={[
          {
            paddingTop: 50,
            paddingBottom: 20,
            paddingHorizontal: 20,
          },
          contentContainerStyle,
        ]}
      >
        {children}
      </NativeScrollView>
    );
  },
);

import React, { forwardRef } from 'react';

import { ScrollView as NativeScrollView, ScrollViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { isHeaderVisible } from '@/signals/app.signal';

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
            marginTop: 40,
            overflow: 'visible',
          },
          style,
        ]}
        contentContainerStyle={[
          {
            paddingTop: 50,
            paddingHorizontal: 20,
            marginTop: -40,
            overflow: 'visible',
          },
          contentContainerStyle,
        ]}
        onScroll={props => {
          const y = props.nativeEvent.contentOffset.y;
          if (y > 15) {
            isHeaderVisible.value = true;
          } else {
            isHeaderVisible.value = false;
          }
        }}
      >
        {children}
      </NativeScrollView>
    );
  },
);

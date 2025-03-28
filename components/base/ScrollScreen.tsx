import React, { forwardRef, useRef } from 'react';

import { useFocusEffect } from 'expo-router';
import { ScrollView as NativeScrollView, ScrollViewProps } from 'react-native';

import { isHeaderVisible } from '@/signals/app.signal';

type Props = ScrollViewProps;

export type ScrollScreenRef = NativeScrollView;

export const ScrollScreen = forwardRef<NativeScrollView, Props>(
  ({ children, style, contentContainerStyle, ...props }, ref) => {
    const scrollY = useRef<number>();
    const isFocused = useRef<boolean>(true);

    useFocusEffect(() => {
      isFocused.current = true;
      isHeaderVisible.value = (scrollY.current ?? 0) > 15;

      return () => {
        isFocused.current = false;
        isHeaderVisible.value = false;
      };
    });

    return (
      <NativeScrollView
        {...props}
        ref={ref}
        style={[
          {
            flex: 1,
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
        onScroll={event => {
          const y = event.nativeEvent.contentOffset.y;
          scrollY.current = y;

          if (!isFocused.current) return;

          if (y > 15) {
            isHeaderVisible.value = true;
          } else {
            isHeaderVisible.value = false;
          }
          props.onScroll?.(event);
        }}
      >
        {children}
      </NativeScrollView>
    );
  },
);

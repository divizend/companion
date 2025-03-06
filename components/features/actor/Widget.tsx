import React from 'react';

import { ActivityIndicator, StyleProp, View } from 'react-native';
import { ViewStyle } from 'react-native';

import { Text } from '@/components/base';
import { useThemeColor } from '@/hooks/useThemeColor';

import ComingSoon from './ComingSoon';

type WidgetProps = {
  title: string;
  children?: React.ReactNode;
  comingSoon?: boolean;
  ready?: boolean;
  settings?: React.ReactNode;
  styles?: {
    container?: StyleProp<ViewStyle>;
    root?: StyleProp<ViewStyle>;
  };
};

export default function Widget({ title, children, comingSoon, ready, settings, styles }: WidgetProps) {
  const theme = useThemeColor();

  return (
    <View
      className="rounded-xl p-4 mb-6"
      style={[
        styles?.root,
        {
          backgroundColor: theme.backgroundSecondary,
        },
      ]}
    >
      <View className="mb-4 flex flex-row justify-between items-center">
        <Text h3 className="font-bold">
          {title}
        </Text>
        {settings}
      </View>
      <View style={styles?.container}>
        {!ready ? <ActivityIndicator /> : comingSoon ? <ComingSoon iconName="hourglass-empty" /> : children}
      </View>
    </View>
  );
}

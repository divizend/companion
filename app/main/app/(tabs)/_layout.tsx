import React from 'react';

import { useSignals } from '@preact/signals-react/runtime';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import { Icon } from '@rneui/themed';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { StyleSheet, useColorScheme } from 'nativewind';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import BlurredHeader from '@/components/global/BlurredHeader';
import { PaywallBottomTab } from '@/components/global/Paywall';
import { useThemeColor } from '@/hooks/useThemeColor';
import { isPaywallVisible } from '@/signals/app.signal';

export default function TabLayout() {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const theme = useThemeColor();
  useSignals();

  return (
    <Tabs
      tabBar={props => {
        return (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
            }}
          >
            {isPaywallVisible.value && <PaywallBottomTab />}
            <BottomTabBar {...props} />
          </View>
        );
      }}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          const iconMap: { [key: string]: string } = {
            learn: 'school',
            learning: 'cast-for-education',
            portfolios: 'account-balance',
            analyze: 'analytics',
            track: 'trending-up',
            decide: 'lightbulb',
            discover: 'explore',
            profile: 'person',
          };
          iconName = iconMap[route.name];
          return <Icon name={iconName!} type="material" size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.theme,
        tabBarInactiveTintColor: 'gray',
        header: props => <BlurredHeader title={t(`common.tabs.${route.name}`)} {...props} />,
        tabBarBackground: () => (
          <BlurView
            experimentalBlurMethod="dimezisBlurView"
            tint={colorScheme === 'dark' ? 'dark' : 'light'}
            intensity={80}
            style={{
              ...StyleSheet.absoluteFillObject,
              overflow: 'hidden',
              backgroundColor: 'transparent',
            }}
          />
        ),
        tabBarStyle: {
          // position: 'absolute',
          backgroundColor: 'transparent',
          borderTopColor: theme.backgroundPrimary,
          borderTopWidth: 0,
        },
      })}
    >
      <Tabs.Screen
        name="learn"
        options={{
          title: t('common.tabs.learn'),
        }}
      />
      <Tabs.Screen
        name="learning"
        options={{
          title: t('common.tabs.learning'),
        }}
      />
      <Tabs.Screen
        name="analyze"
        options={{
          title: t('common.tabs.analyze'),
        }}
      />
      <Tabs.Screen
        name="portfolios"
        options={{
          title: t('common.tabs.portfolios'),
        }}
      />
      <Tabs.Screen
        name="track"
        options={{
          title: t('common.tabs.track'),
          href: null,
        }}
      />
      <Tabs.Screen
        name="decide"
        options={{
          title: t('common.tabs.decide'),
          href: null,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: t('common.tabs.discover'),
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('common.tabs.profile'),
        }}
      />
    </Tabs>
  );
}

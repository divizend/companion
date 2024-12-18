import { Icon } from '@rneui/themed';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { StyleSheet, useColorScheme } from 'nativewind';

import BlurredHeader from '@/components/global/BlurredHeader';
import { useThemeColor } from '@/hooks/useThemeColor';
import { t } from '@/i18n';

export default function TabLayout() {
  const theme = useThemeColor();
  const { colorScheme } = useColorScheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          const iconMap: { [key: string]: string } = {
            learn: 'school',
            analyze: 'analytics',
            track: 'trending-up',
            decide: 'lightbulb',
            discover: 'explore',
          };
          iconName = iconMap[route.name];
          return <Icon name={iconName!} type="material" size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.theme,
        tabBarInactiveTintColor: 'gray',
        header: props => <BlurredHeader title={t(`${route.name}.title`)} {...props} />,
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
          backgroundColor: 'transparent',
          borderTopColor: theme.backgroundPrimary,
          borderTopWidth: 0,
        },
      })}
    >
      <Tabs.Screen
        name="learn"
        options={{
          title: t('tabs.learn'),
        }}
      />
      <Tabs.Screen
        name="analyze"
        options={{
          title: t('tabs.analyze'),
        }}
      />
      <Tabs.Screen
        name="track"
        options={{
          title: t('tabs.track'),
        }}
      />
      <Tabs.Screen
        name="decide"
        options={{
          title: t('tabs.decide'),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: t('tabs.discover'),
        }}
      />
    </Tabs>
  );
}

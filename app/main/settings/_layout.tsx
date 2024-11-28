import React from 'react';

import { Header, Icon } from '@rneui/themed';
import { Slot, router, useSegments } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';

import { Text } from '@/components/base';
import { useThemeColor } from '@/hooks/useThemeColor';
import { t } from '@/i18n';

export default function Layout() {
  const theme = useThemeColor();

  const segments = useSegments();

  return (
    <View className="flex-1 dark:bg-primary-dark bg-primary-light">
      <Header
        backgroundColor={theme.backgroundPrimary}
        centerComponent={
          <View className="flex-1 flex-row items-center">
            <Text className="font-bold text-[16px] text-center">
              {t(`settings.pages.${['settings', 'plan'].includes(segments.at(-1)!) ? segments.at(-1) : 'settings'}`)}
            </Text>
          </View>
        }
        // The back button should only be used to go back to the main settings menu or any nested routes in the settings stack. It should never be used to go back to 'app' stack.
        leftComponent={
          segments.at(-1) !== 'settings' ? (
            <TouchableOpacity pressRetentionOffset={20} onPress={() => router.navigate('/main/settings')}>
              <View className="dark:bg-[#232223] bg-[#e0e0e0] rounded-2xl p-1 m-[5px]">
                <Icon name="arrow-back" size={16} color="#666" />
              </View>
            </TouchableOpacity>
          ) : undefined
        }
        // Only show exit button when user has access back to the app
        rightComponent={
          <TouchableOpacity onPress={() => router.navigate('/main/app')}>
            <View className="dark:bg-[#232223] bg-[#e0e0e0] rounded-2xl p-1 m-[5px]">
              <Icon name="close" size={16} color="#666" />
            </View>
          </TouchableOpacity>
        }
        containerStyle={{ borderBottomWidth: 0 }}
      />
      <View className="flex-1">
        <Slot screenOptions={{ headerShown: false }} />
      </View>
    </View>
  );
}

import React from 'react';

import { Icon } from '@rneui/themed';
import { Slot, router, useSegments } from 'expo-router';
import { Platform, TouchableOpacity, View } from 'react-native';

import { clsx } from '@/common/clsx';
import { SafeAreaView, Text } from '@/components/base';
import { useThemeColor } from '@/hooks/useThemeColor';
import { t } from '@/i18n';

export default function Layout() {
  const theme = useThemeColor();

  const segments = useSegments();

  const ParentView = Platform.OS === 'ios' ? View : SafeAreaView;

  return (
    <ParentView className="flex-1 dark:bg-primary-dark bg-primary-light">
      <View
        className="flex-row justify-between items-center"
        style={{ backgroundColor: theme.backgroundPrimary, padding: 10, paddingTop: 15 }}
      >
        <View>
          <TouchableOpacity
            pressRetentionOffset={20}
            onPress={() => router.navigate('/main/settings')}
            className={clsx(segments.at(-1) === 'settings' && 'opacity-0 pointer-events-none')}
          >
            <View className="dark:bg-[#232223] bg-[#e0e0e0] rounded-2xl p-1 m-[5px]">
              <Icon name="arrow-back" size={16} color="#666" />
            </View>
          </TouchableOpacity>
        </View>
        <View className="flex-1 flex-row items-center justify-center">
          <Text className="font-bold text-[16px] text-center">
            {t(`settings.pages.${['settings', 'plan'].includes(segments.at(-1)!) ? segments.at(-1) : 'settings'}`)}
          </Text>
        </View>
        <View>
          <TouchableOpacity onPress={() => router.navigate('/main/app')}>
            <View className="dark:bg-[#232223] bg-[#e0e0e0] rounded-2xl p-1 m-[5px]">
              <Icon name="close" size={16} color="#666" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <View className="flex-1">
        <Slot screenOptions={{ headerShown: false }} />
      </View>
    </ParentView>
  );
}

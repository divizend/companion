import React from 'react';

import { Header, Icon } from '@rneui/themed';
import { Platform, View } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native';

import { clsx } from '@/common/clsx';
import { useThemeColor } from '@/hooks/useThemeColor';

import { Text } from '../base';

type Props = { dismiss: () => void; children: React.ReactNode; title: string; noScrollView?: boolean };

export default function ModalLayout({ dismiss, children, title, noScrollView = false }: Props) {
  const theme = useThemeColor();
  return (
    <View className={clsx('flex-1 dark:bg-primary-dark bg-primary-light', Platform.OS === 'ios' && 'pb-5')}>
      <Header
        backgroundColor={theme.backgroundPrimary}
        centerComponent={
          <View className="flex-1 flex-row items-center">
            <Text className="font-bold text-[16px] text-center">{title}</Text>
          </View>
        }
        rightComponent={
          <TouchableOpacity onPress={dismiss}>
            <View className="dark:bg-[#232223] bg-[#e0e0e0] rounded-2xl p-1 m-[5px]">
              <Icon name="close" size={16} color="#666" />
            </View>
          </TouchableOpacity>
        }
        containerStyle={{ borderBottomWidth: 0 }}
      />

      {!noScrollView ? (
        <ScrollView>
          <View className="p-5">{children}</View>
        </ScrollView>
      ) : (
        <View className="flex-1">{children}</View>
      )}
    </View>
  );
}

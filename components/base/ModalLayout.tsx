import React from 'react';

import { useNavigation } from '@react-navigation/native';
import { Header, Icon } from '@rneui/themed';
import { ScrollView, TouchableOpacity, View } from 'react-native';

import { Text } from '@/components/base';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ModalLayoutProps {
  title: string;
  children: React.ReactNode;
  canGoBack?: boolean;
}

export default function ModalLayout({ title, children, canGoBack = true }: ModalLayoutProps) {
  const navigation = useNavigation();
  const theme = useThemeColor();
  return (
    <View className="flex-1 dark:bg-primary-dark bg-primary-light py-10">
      <Header
        backgroundColor={theme.backgroundPrimary}
        centerComponent={
          <View className="flex-1 flex-row items-center">
            <Text className="font-bold text-[16px] text-center">{title}</Text>
          </View>
        }
        leftComponent={
          canGoBack ? (
            <TouchableOpacity pressRetentionOffset={20} onPress={navigation.goBack}>
              <View className="dark:bg-[#232223] bg-[#e0e0e0] rounded-2xl p-1 m-[5px]">
                <Icon name="arrow-back" size={16} color="#666" />
              </View>
            </TouchableOpacity>
          ) : undefined
        }
        rightComponent={
          <TouchableOpacity onPress={() => navigation.navigate('App' as never)}>
            <View className="dark:bg-[#232223] bg-[#e0e0e0] rounded-2xl p-1 m-[5px]">
              <Icon name="close" size={16} color="#666" />
            </View>
          </TouchableOpacity>
        }
        containerStyle={{ borderBottomWidth: 0 }}
      />
      <ScrollView>
        <View className="p-5">{children}</View>
      </ScrollView>
    </View>
  );
}

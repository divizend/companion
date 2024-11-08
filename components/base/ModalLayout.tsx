import React from 'react';

import { useNavigation } from '@react-navigation/native';
import { Header, Icon } from '@rneui/themed';
import { ScrollView, TouchableOpacity, View } from 'react-native';

import { Text } from '@/components/base';
import { usePurchases } from '@/hooks/usePurchases';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ModalLayoutProps {
  title: string;
  children: React.ReactNode;
  canGoBack?: boolean;
  noScrollView?: boolean;
}

export default function ModalLayout({ title, children, canGoBack = true, noScrollView }: ModalLayoutProps) {
  const navigation = useNavigation();
  const theme = useThemeColor();
  const { customerInfo } = usePurchases();
  return (
    <View className="flex-1 dark:bg-primary-dark bg-primary-light">
      <Header
        backgroundColor={theme.backgroundPrimary}
        centerComponent={
          <View className="flex-1 flex-row items-center">
            <Text className="font-bold text-[16px] text-center">{title}</Text>
          </View>
        }
        leftComponent={
          canGoBack ? (
            <TouchableOpacity pressRetentionOffset={20} onPress={() => navigation.navigate('Settings' as never)}>
              <View className="dark:bg-[#232223] bg-[#e0e0e0] rounded-2xl p-1 m-[5px]">
                <Icon name="arrow-back" size={16} color="#666" />
              </View>
            </TouchableOpacity>
          ) : undefined
        }
        // Only show exit button when user has access back to the app
        rightComponent={
          <TouchableOpacity
            {...(!customerInfo?.entitlements.active['divizend-membership'] && {
              style: { opacity: 0 },
              activeOpacity: 0,
              disabled: true,
            })}
            onPress={() =>
              !!customerInfo?.entitlements.active['divizend-membership'] && navigation.navigate('App' as never)
            }
          >
            <View className="dark:bg-[#232223] bg-[#e0e0e0] rounded-2xl p-1 m-[5px]">
              <Icon name="close" size={16} color="#666" />
            </View>
          </TouchableOpacity>
        }
        containerStyle={{ borderBottomWidth: 0 }}
      />
      {noScrollView ? (
        <View className="flex-1">{children}</View>
      ) : (
        <ScrollView>
          <View className="p-5">{children}</View>
        </ScrollView>
      )}
    </View>
  );
}

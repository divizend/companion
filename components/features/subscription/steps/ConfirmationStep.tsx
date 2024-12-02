import React from 'react';

import { Icon } from '@rneui/themed';
import * as Linking from 'expo-linking';
import { View } from 'react-native';

import { Text } from '@/components/base';
import { useThemeColor } from '@/hooks/useThemeColor';
import { t as tBase } from '@/i18n';

type Props = {};

export default function ConfirmationStep({}: Props) {
  const t = (key: string, data?: any) => tBase('subscription.choosePlan.steps.confirmation.' + key, data);
  const theme = useThemeColor();

  return (
    <View className="flex-1 flex p-6 mb-2 items-center">
      <View className="self-center mb-7 ">
        <Icon
          name="check-circle-outline"
          type="material-community"
          size={100}
          color={theme.theme}
          className=" shadow-theme shadow"
        />
      </View>
      <View>
        <Text className="text-3xl font-bold text-center text-gray-800 mb-6">{t('title')}</Text>
        <Text className="text-base text-gray-600 mb-6">{t('thankYou')}</Text>
        <Text className="text-base text-gray-600 mb-6">{t('activationMessage')}</Text>

        <View>
          <Text className="text-xl font-semibold text-gray-800 mb-4">{t('helpSection.title')}</Text>
          <Text className="text-base text-gray-600">
            {t('helpSection.message')}{' '}
            <Text type="info" onPress={() => Linking.openURL('mailto:support@divizend.com')} className="font-semibold">
              {t('helpSection.email')}
            </Text>
            .
          </Text>
        </View>
      </View>
    </View>
  );
}

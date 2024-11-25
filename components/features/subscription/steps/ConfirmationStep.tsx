import React from 'react';

import * as Linking from 'expo-linking';
import { View } from 'react-native';

import { Text } from '@/components/base';
import { t as tBase } from '@/i18n';

type Props = {};

export default function ConfirmationStep({}: Props) {
  const t = (key: string, data?: any) => tBase('subscription.choosePlan.steps.confirmation.' + key, data);

  return (
    <View className="flex-1 flex p-4 mb-2 items-start justify-center  gap-5">
      <Text className="text-3xl font-bold text-center text-gray-800 mb-4">🎉 {t('title')}</Text>
      <Text className="text-base text-gray-600 mb-6">{t('thankYou')}</Text>
      <Text className="text-base text-gray-600 mb-6">{t('activationMessage')}</Text>

      <View className="mb-6">
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
  );
}

import React from 'react';

import { View } from 'react-native';
import { ScrollView } from 'react-native';

import { Text } from '@/components/base';
import Accordion from '@/components/base/Accordion';
import { t as tBase } from '@/i18n';

type Props = {};

export default function JoinedWaitlistStep({}: Props) {
  const t = (key: string, data?: any) => tBase('subscription.choosePlan.steps.waitlist.' + key, data);

  return (
    <View className="flex-1">
      <ScrollView className="flex p-4 mb-2">
        <Text className="mb-4 text-center" id="title" h2>
          {t('title')}
        </Text>
        <Text className="mb-4 px-5" id="description">
          {t('description')}
        </Text>
        <Accordion
          unitedBackground
          initiallyOpen
          title={t('accordion.title')}
          content={
            <View className="py-3 px-5 gap-2">
              <Text className="font-semibold">{t('accordion.spotMatching.title')}</Text>
              <Text className="ml-2">
                {`\u2022`} {t('accordion.spotMatching.point1')}
              </Text>
              <Text className="ml-2">
                {`\u2022`} {t('accordion.spotMatching.point2')}
              </Text>
              <Text className="font-semibold">{t('accordion.notification.title')}</Text>
              <Text className="ml-2">
                {`\u2022`} {t('accordion.notification.point1')}
              </Text>
              <Text className="ml-2">
                {`\u2022`} {t('accordion.notification.point2')}
              </Text>
              <Text className="font-semibold">{t('accordion.forfeiting.title')}</Text>
              <Text className="ml-2">
                {`\u2022`} {t('accordion.forfeiting.point1')}
              </Text>
            </View>
          }
        />
      </ScrollView>
    </View>
  );
}

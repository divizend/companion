import React from 'react';

import { CheckBox } from '@rneui/themed';
import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/base';
import Accordion from '@/components/base/Accordion';
import { useThemeColor } from '@/hooks/useThemeColor';
import { t as tBase } from '@/i18n';

import { IStepProps } from '../SubscriptionModal';

export default function ExplainerStep({ setCanContinue, canContinue }: IStepProps) {
  const t = (key: string, data?: any) => tBase('subscription.choosePlan.steps.explainer.' + key, data);
  const theme = useThemeColor();

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
          className="mb-4"
          title={t('accordion.pricingOptions.title')}
          initiallyOpen={true}
          unitedBackground
          content={
            <View className="py-3 px-5">
              <Text>{t('accordion.pricingOptions.content')}</Text>
            </View>
          }
        />
        <Accordion
          className="mb-4"
          title={t('accordion.factorMeaning.title')}
          initiallyOpen={true}
          unitedBackground
          content={
            <View className="py-3 px-5">
              <Text className="font-semibold">{t('accordion.factorMeaning.content.higherFactor.title')}</Text>
              <Text className="mb-3">
                {' '}
                {`\u2022`} {t('accordion.factorMeaning.content.higherFactor.bullet')}
              </Text>
              <Text className="font-semibold">{t('accordion.factorMeaning.content.lowerFactor.title')}</Text>
              <Text className="mb-3">
                {' '}
                {`\u2022`} {t('accordion.factorMeaning.content.lowerFactor.bullet')}
              </Text>
              <Text className="font-semibold">{t('accordion.factorMeaning.content.allCases.title')}</Text>
              <Text className="mb-3">
                {' '}
                {`\u2022`} {t('accordion.factorMeaning.content.allCases.bullet')}
              </Text>
            </View>
          }
        />

        <Pressable
          onPress={() => setCanContinue(prev => !prev)}
          className="py-3 px-5 bg-secondary-light dark:bg-secondary-dark flex flex-row items-center justify-between rounded-xl mb-6"
        >
          <Text>{t('understand')}</Text>
          <CheckBox
            wrapperStyle={{ backgroundColor: 'transparent', margin: 0, padding: 0 }}
            iconType="material-community"
            checkedIcon="checkbox-marked"
            uncheckedIcon="checkbox-blank-outline"
            checkedColor={theme.theme}
            containerStyle={{
              backgroundColor: 'transparent',
              margin: 0,
              padding: 0,
              marginLeft: 0,
              marginRight: 0,
            }}
            checked={canContinue}
          />
        </Pressable>
      </ScrollView>
    </View>
  );
}

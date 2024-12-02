import { ScrollView, View } from 'react-native';

import { Text } from '@/components/base';
import Accordion from '@/components/base/Accordion';
import { t as tBase } from '@/i18n';

import { IStepProps } from '../SubscriptionModal';

export default function SolidarityDisclaimerStep({}: IStepProps) {
  const t = (key: string, data?: any) => tBase('subscription.choosePlan.steps.disclaimer.' + key, data);

  return (
    <ScrollView className="flex p-4 mb-2">
      <Text className="mb-4 text-center" id="title" h2>
        {t('title')}
      </Text>
      <Text className="mb-4 px-5" id="description">
        {t('description')}
      </Text>

      <Accordion
        className="mb-4"
        title={t('accordion.spotsContributions.title')}
        initiallyOpen
        unitedBackground
        content={
          <View className="py-3 px-5">
            <Text className="font-semibold">{t('accordion.spotsContributions.content.sponsors.title')}</Text>
            <Text className="mb-3">
              {' '}
              {`\u2022`} {t('accordion.spotsContributions.content.sponsors.bullet1')}
            </Text>
            <Text className="mb-3">
              {' '}
              {`\u2022`} {t('accordion.spotsContributions.content.sponsors.bullet2')}
            </Text>
            <Text className="mb-3">
              {' '}
              {`\u2022`} {t('accordion.spotsContributions.content.sponsors.bullet3')}
            </Text>

            <Text className="font-semibold">{t('accordion.spotsContributions.content.sponsored.title')}</Text>
            <Text className="mb-3">
              {' '}
              {`\u2022`} {t('accordion.spotsContributions.content.sponsored.bullet1')}
            </Text>
            <Text className="mb-3">
              {' '}
              {`\u2022`} {t('accordion.spotsContributions.content.sponsored.bullet2')}
            </Text>
          </View>
        }
      />

      <Accordion
        className="mb-4"
        title={t('accordion.waitlist.title')}
        unitedBackground
        initiallyOpen
        content={
          <View className="py-3 px-5">
            <Text className="mb-3">
              {' '}
              {`\u2022`} {t('accordion.waitlist.content.bullet1')}
            </Text>
            <Text className="mb-3">
              {' '}
              {`\u2022`} {t('accordion.waitlist.content.bullet2')}
            </Text>
            <Text className="mb-3">
              {' '}
              {`\u2022`} {t('accordion.waitlist.content.bullet3')}
            </Text>
          </View>
        }
      />

      <Accordion
        className="mb-4"
        title={t('accordion.changes.title')}
        unitedBackground
        initiallyOpen
        content={
          <View className="py-3 px-5">
            <Text className="mb-3">
              {' '}
              {`\u2022`} {t('accordion.changes.content.bullet1')}
            </Text>
            <Text className="mb-3">
              {' '}
              {`\u2022`} {t('accordion.changes.content.bullet2')}
            </Text>
            <Text className="font-semibold">{t('accordion.changes.content.note')}</Text>
            <Text className="mb-3">
              {' '}
              {`\u2022`} {t('accordion.changes.content.bullet3')}
            </Text>
          </View>
        }
      />
    </ScrollView>
  );
}

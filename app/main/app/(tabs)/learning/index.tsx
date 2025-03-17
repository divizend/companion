import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import SectionList from '@/components/SectionList';
import { SafeAreaView, ScrollScreen, Text } from '@/components/base';
import { useThemeColor } from '@/hooks/useThemeColor';

export type Lesson = {
  title: string;
  firstView: [
    {
      title: string;
      content: string;
    },
  ];
  sections: [
    {
      title: string;
      questions: [string];
    },
  ];
};

export default function Learning() {
  const { t } = useTranslation();
  const theme = useThemeColor();

  const lessons = t('learning.lessons.items', {
    returnObjects: true,
  }) as Array<Lesson>;

  return (
    <SafeAreaView
      style={{
        backgroundColor: theme.backgroundPrimary,
      }}
    >
      <ScrollScreen>
        <Text className="text-3xl font-bold mb-5 mx-1.5">{t('learning.title')}</Text>
        <View className="mb-9 mx-1">
          <Text className="text-[16px] mb-2.5">{t('learning.description')}</Text>
        </View>
        <SectionList
          title={t('learning.lessons.title')}
          items={lessons.map((lesson, index) => ({
            title: lesson.title,
            onPress: () => router.push({ pathname: '/main/app/learning/lesson-details', params: { lessonId: index } }),
          }))}
        />
      </ScrollScreen>
    </SafeAreaView>
  );
}

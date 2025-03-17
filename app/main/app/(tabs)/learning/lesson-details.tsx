import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useRoute } from '@react-navigation/native';
import { CheckBox, Icon } from '@rneui/themed';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { clsx } from '@/common/clsx';
import { useUserProfile } from '@/common/profile';
import ChatModal from '@/components/ChatModal';
import SectionList from '@/components/SectionList';
import { SafeAreaView, ScrollScreen, ScrollScreenRef, Text, TextInput } from '@/components/base';
import { ModalManager } from '@/components/global/modal';
import { useThemeColor } from '@/hooks/useThemeColor';
import { loadDepot } from '@/signals/actions/actor.actions';

import { Lesson } from '.';

export default function LessonDetails() {
  const route = useRoute();
  const theme = useThemeColor();
  const { t, i18n } = useTranslation();
  const { lessonId } = route.params as { lessonId: string };
  const [inputData, setInputData] = useState<Array<string>>([]);
  const [usePortfolioContent, setUsePortfolioContent] = useState(false);
  const scrollViewRef = useRef<ScrollScreenRef>(null);
  const profile = useUserProfile().profile;
  const currency = profile?.flags.currency;
  const canUseOwnPortfolios = profile?.depots?.length > 0;

  const { data: depot } = useQuery({
    queryKey: ['depot', currency, 'all', profile?.depots?.length],
    queryFn: async () => loadDepot(undefined),
  });

  const stockNames = useMemo(
    () =>
      Object.values(depot?.securities ?? {})
        .filter(s => s.name)
        .map(s => '- ' + s.name)
        .join('\n'),
    [depot],
  );

  const lesson = useMemo(
    () =>
      (
        t('learning.lessons.items', {
          returnObjects: true,
          input: inputData.length > 0 ? inputData : undefined,
        }) as Array<Lesson>
      )[+lessonId],
    [lessonId, inputData, t, i18n.language],
  );

  useEffect(() => {
    setInputData(lesson.firstView.map(v => v.content));
  }, [lessonId]);

  return (
    <SafeAreaView>
      <ScrollScreen ref={scrollViewRef}>
        <Text h1 style={styles.title}>
          {lesson.title}
        </Text>

        <View className="mb-10">
          {lesson.firstView.map((item, index) => (
            <View key={index} className="mb-5">
              <Text h4 className="mb-2">
                {item.title}
              </Text>
              <TextInput
                value={inputData[index]}
                onChangeText={text => {
                  const newData = [...inputData];
                  newData[index] = text;
                  setInputData(newData);
                }}
              />
            </View>
          ))}
          <View className={clsx('flex flex-row items-center ', !canUseOwnPortfolios && 'opacity-50')}>
            <CheckBox
              disabled={!canUseOwnPortfolios}
              checked={usePortfolioContent && canUseOwnPortfolios}
              onPress={() => setUsePortfolioContent(prev => !prev)}
              wrapperStyle={{ backgroundColor: 'transparent', margin: 0, padding: 0, marginRight: 5 }}
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
            />

            <TouchableOpacity onPress={() => setUsePortfolioContent(prev => !prev)} disabled={!canUseOwnPortfolios}>
              <View className="flex flex-col">
                <Text>{t('learning.lessons.portfolioContentCheckbox.text')}</Text>
              </View>
            </TouchableOpacity>
          </View>
          {!canUseOwnPortfolios && (
            <View className="flex flex-row items-center">
              <Icon name="info-outline" type="material" size={20} className="mr-2" />
              <Text className="mt-1">{t('learning.lessons.portfolioContentCheckbox.note')}</Text>
            </View>
          )}
        </View>
        {lesson.sections.map((section, index) => (
          <SectionList
            key={index}
            title={section.title}
            items={section.questions.map(question => ({
              title: question,
              onPress: () =>
                ModalManager.showModal(({ dismiss }) => (
                  <ChatModal
                    dismiss={dismiss}
                    systemPrompt={`You are an AI assistant that helps the user with the goal of \"${
                      question
                    }\". Never use Markdown. Make sure to give exceptionally intelligent and helpful responses. All responses should always be practical, pragmatic, as specific as possible and clearly actionable. The user already stated the following context for this question, which should be considered in all responses:\n
                  `}
                    initialUserMessage={
                      usePortfolioContent && canUseOwnPortfolios
                        ? t('learning.lessons.questionWithStocks', { stockNames, question })
                        : question
                    }
                  />
                )),
            }))}
            containerStyle={styles.sectionContainer}
          />
        ))}
      </ScrollScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: 'bold',
    marginBottom: 30,
    marginHorizontal: 5,
  },
  sectionContainer: {
    marginBottom: 40,
  },
  fieldContainer: {
    marginBottom: 20,
  },
});

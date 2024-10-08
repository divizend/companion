import React, { useEffect, useRef, useState } from 'react';

import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import { Alert, Animated, StyleSheet, View } from 'react-native';
import uuid from 'react-native-uuid';

import { apiPost } from '@/common/api';
import { showInputDialog } from '@/common/inputDialog';
import { CompanionProfileLearnQuestion, useUserProfile } from '@/common/profile';
import SectionList from '@/components/SectionList';
import StyledButton from '@/components/StyledButton';
import { ScrollView, Text } from '@/components/base';
import { SafeAreaView } from '@/components/base/SafeAreaView';
import { t } from '@/i18n';

import UserInsightsSectionList from './UserInsightsSectionList';

export default function GenerateInsights() {
  const { colorScheme } = useColorScheme();
  const navigation = useNavigation();
  const { profile, updateCompanionProfile } = useUserProfile();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [similarQuestionsLoadingQuestionId, setSimilarQuestionsLoadingQuestionId] = useState<string | null>(null);
  const [generateInsightLoadingQuestionId, setGenerateInsightLoadingQuestionId] = useState<string | null>(null);
  // const [selectedQuestionToPrompt, setSelectedQuestionToPrompt] = useState<string | undefined>(undefined);
  // const [insightAnswer, setInsightAnswer] = useState('');

  const [defaultQuestions] = useState<CompanionProfileLearnQuestion[]>(
    (t('learn.insights.defaultQuestions') as any).map((q: any) => ({
      ...q,
      id: uuid.v4(),
    })) as CompanionProfileLearnQuestion[],
  );
  const displayedQuestions: CompanionProfileLearnQuestion[] =
    (profile.companionProfile?.learnQuestions ?? []).length > 0
      ? profile.companionProfile!.learnQuestions!
      : defaultQuestions;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [displayedQuestions]);

  const getSimilarQuestions = async (questionId: string) => {
    setSimilarQuestionsLoadingQuestionId(questionId);
    try {
      const allQuestions = await apiPost('/companion/learn/similar-questions', {
        currentQuestions: displayedQuestions,
        questionId,
      });
      updateCompanionProfile({ learnQuestions: allQuestions });
    } finally {
      setSimilarQuestionsLoadingQuestionId(null);
      fadeAnim.setValue(0);
    }
  };

  const generateInsight = async (questionId: string) => {
    const question = displayedQuestions.find(q => q.id === questionId)!;

    const answer = await showInputDialog(question.question);

    if (answer) {
      try {
        setGenerateInsightLoadingQuestionId(questionId);
        const insight = await apiPost('/companion/learn/generate-insight', {
          currentQuestions: displayedQuestions,
          question: question.question,
          answer,
        });
        updateCompanionProfile(p => {
          p.userInsights.push(insight);
        });
      } finally {
        setGenerateInsightLoadingQuestionId(null);
      }
    }
  };

  // useEffect(() => {
  //   if (!selectedQuestionToPrompt) setInsightAnswer('');
  // }, [selectedQuestionToPrompt]);

  // const generateInsight = async (questionId: string) => {
  //   const question = displayedQuestions.find(q => q.id === questionId)!;

  //   try {
  //     setSelectedQuestionToPrompt(undefined);
  //     setGenerateInsightLoadingQuestionId(questionId);
  //     const insight = await apiPost('/companion/learn/generate-insight', {
  //       currentQuestions: displayedQuestions,
  //       question: question.question,
  //       answer: insightAnswer,
  //     });
  //     updateCompanionProfile(p => {
  //       p.userInsights.push(insight);
  //     });
  //   } finally {
  //     setGenerateInsightLoadingQuestionId(null);
  //   }
  // };

  return (
    <SafeAreaView>
      <ScrollView>
        {/* <Prompt
          isVisible={!!selectedQuestionToPrompt}
          actions={[
            {
              title: t('common.cancel'),
              onPress: () => setSelectedQuestionToPrompt(undefined),
              id: 'cancel',
            },
            {
              title: t('common.submit'),
              onPress: () => selectedQuestionToPrompt && generateInsight(selectedQuestionToPrompt),
              loading: generateInsightLoadingQuestionId === selectedQuestionToPrompt,
              id: 'submit',
            },
          ]}
          title={t('learn.insights.questionOptions.answer')}
          text={displayedQuestions.find(q => q.id === selectedQuestionToPrompt)?.question || ''}
          textInputProps={{
            value: insightAnswer,
            onChangeText: e => setInsightAnswer(e),
            autoFocus: true,
            placeholder: t('learn.insights.questionOptions.answer'),
          }}
        /> */}
        <Text className="text-3xl font-bold mb-5 mx-1.5">{t('learn.insights.title')}</Text>
        <View className="mb-9 mx-1">
          <Text className="text-[16px] mb-2.5">{t('learn.vision')}</Text>
          <Text className="text-[16px] mb-2.5">{t('learn.insights.explanation')}</Text>
          <Text className="text-[16px] mb-2.5">{t('learn.insights.explanation2')}</Text>
        </View>

        <SectionList
          title={t('learn.insights.questionsTitle')}
          items={displayedQuestions.map(question => ({
            title: `${question.category}: ${question.question}${
              question.id === similarQuestionsLoadingQuestionId || question.id === generateInsightLoadingQuestionId
                ? ` (${t('common.loading')})`
                : ''
            }`,
            onPress: () => {
              Alert.alert(
                question.question,
                undefined,
                [
                  {
                    text: t('learn.insights.questionOptions.getSimilar'),
                    onPress: () => getSimilarQuestions(question.id),
                  },
                  {
                    text: t('learn.insights.questionOptions.answer'),
                    onPress: () => {
                      generateInsight(question.id);
                    },
                  },
                  {
                    text: t('common.cancel'),
                    style: 'cancel',
                  },
                ],
                { userInterfaceStyle: (colorScheme === 'system' ? 'dark' : colorScheme) as 'light' | 'dark' },
              );
            },
            disabled:
              question.id === similarQuestionsLoadingQuestionId || question.id === generateInsightLoadingQuestionId,
            containerStyle: question.isNew ? { opacity: fadeAnim } : undefined,
            itemStyle: question.isNew ? styles.newQuestionContainer : undefined,
          }))}
          containerStyle={styles.questionList}
          ItemComponent={Animated.View}
        />

        {profile.companionProfile.userInsights?.length > 0 && (
          <>
            <UserInsightsSectionList isOnboarding />
            <StyledButton
              title={t(`learn.insights.confirmButton`)}
              onPress={() => navigation.navigate('Goals' as never)}
              containerStyle={styles.confirmButton}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  confirmButton: {
    marginTop: 20,
    marginBottom: 40,
    marginHorizontal: 20,
  },
  questionList: {
    marginBottom: 40,
  },
  newQuestionContainer: {
    backgroundColor: '#E6F3FF',
  },
});

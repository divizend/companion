import { apiPost } from '@/common/api';
import { showInputDialog } from '@/common/inputDialog';
import { CompanionProfileLearnQuestion, useUserProfile } from '@/common/profile';
import { Text } from '@/components/base/Text';
import SectionList from '@/components/SectionList';
import StyledButton from '@/components/StyledButton';
import { t } from '@/i18n';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import uuid from 'react-native-uuid';
import UserInsightsSectionList from './UserInsightsSectionList';

export default function GenerateInsights() {
  const navigation = useNavigation();
  const { profile, updateCompanionProfile } = useUserProfile();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [similarQuestionsLoadingQuestionId, setSimilarQuestionsLoadingQuestionId] = useState<string | null>(null);
  const [generateInsightLoadingQuestionId, setGenerateInsightLoadingQuestionId] = useState<string | null>(null);

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

  return (
    <SafeAreaView>
      <ScrollView className="dark:bg-black bg-[#f2f2f2] py-10 px-5">
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
              Alert.alert(question.question, undefined, [
                {
                  text: t('learn.insights.questionOptions.getSimilar'),
                  onPress: () => getSimilarQuestions(question.id),
                },
                {
                  text: t('learn.insights.questionOptions.answer'),
                  onPress: () => generateInsight(question.id),
                },
                {
                  text: t('common.cancel'),
                  style: 'cancel',
                },
              ]);
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
    marginBottom: 20,
    marginHorizontal: 20,
  },
  questionList: {
    marginBottom: 40,
  },
  newQuestionContainer: {
    backgroundColor: '#E6F3FF',
  },
});

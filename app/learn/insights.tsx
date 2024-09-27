import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Animated, SafeAreaView, ScrollView, Alert } from 'react-native';
import { Text } from '@rneui/themed';
import uuid from 'react-native-uuid';
import { t } from '@/i18n';
import StyledButton from '@/components/StyledButton';
import SectionList from '@/components/SectionList';
import { showInputDialog } from '@/common/inputDialog';
import { apiPost } from '@/common/api';
import { useUserProfile, CompanionProfileLearnQuestion } from '@/common/profile';
import { useNavigation } from '@react-navigation/native';
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View className="pt-20 border rounded-lg bg-green-400 flex italic font-medium">
          <Text className="font-light text-orange-300">Ki ZEBI</Text>
        </View>
        <Text h1 style={styles.title}>
          {t('learn.insights.title')}
        </Text>
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationText}>{t('learn.vision')}</Text>
          <Text style={styles.explanationText}>{t('learn.insights.explanation')}</Text>
          <Text style={styles.explanationText}>{t('learn.insights.explanation2')}</Text>
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

        {profile.companionProfile.userInsights.length > 0 && (
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
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  scrollViewContent: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    marginHorizontal: 5,
  },
  confirmButton: {
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  explanationContainer: {
    marginHorizontal: 5,
    marginBottom: 35,
  },
  explanationText: {
    fontSize: 16,
    marginBottom: 10,
  },
  questionList: {
    marginBottom: 40,
  },
  confirmText: {
    fontSize: 16,
    marginBottom: 20,
  },
  newQuestionContainer: {
    backgroundColor: '#E6F3FF',
  },
});

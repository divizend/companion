import React, { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, View } from 'react-native';

import { apiGet, apiPost } from '@/common/api';
import { useGoal, useUserProfile } from '@/common/profile';
import SectionList from '@/components/SectionList';
import { Text } from '@/components/base';
import ModalLayout from '@/components/global/ModalLayout';
import { showPrompt } from '@/components/global/prompt';

interface AssessRealitiesModalProps {
  dismiss: () => void;
  goalId: string;
}

export default function AssessRealitiesModal({ dismiss, goalId }: AssessRealitiesModalProps) {
  const { t } = useTranslation();
  const { updateCompanionProfile } = useUserProfile();
  const goal = useGoal(goalId);
  const [isAddingReality, setIsAddingReality] = useState(false);
  const [isAddingRealityIndex, setIsAddingRealityIndex] = useState<number | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(true);
  const [realitiesAddedSinceLastLoad, setRealitiesAddedSinceLastLoad] = useState(false);

  const loadQuestions = async () => {
    try {
      setIsLoadingQuestions(true);
      const loadedQuestions = await apiGet(`/companion/goal/${goalId}/realities-questions`);
      setQuestions(loadedQuestions);
      setRealitiesAddedSinceLastLoad(false);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleAddRealityFromQuestion = async (questionIndex: number) => {
    const text = await showPrompt({ title: questions[questionIndex] });
    if (!text) return;
    try {
      setIsAddingRealityIndex(questionIndex);
      const newReality = await apiPost(`/companion/goal/${goalId}/generate-reality`, {
        question: questions[questionIndex],
        answer: text,
      });
      updateCompanionProfile(p => {
        p.goals.find(g => g.id === goalId)?.realities.push(newReality);
      });
      setRealitiesAddedSinceLastLoad(true);
      Alert.alert(t('learn.goalDetails.realities.assess.success'), newReality.reality);
    } finally {
      setIsAddingRealityIndex(null);
    }
  };

  const handleAddManualReality = async () => {
    const text = await showPrompt({
      title: goal!.description,
      message: t('learn.goalDetails.realities.addRealityPrompt'),
    });
    if (!text) return;
    try {
      setIsAddingReality(true);
      const newReality = await apiPost(`/companion/goal/${goalId}/reality`, {
        reality: text,
      });
      updateCompanionProfile(p => {
        p.goals.find(g => g.id === goalId)?.realities.push(newReality);
      });
      setRealitiesAddedSinceLastLoad(true);
      Alert.alert(t('learn.goalDetails.realities.assess.success'), newReality.reality);
    } finally {
      setIsAddingReality(false);
    }
  };

  return (
    <ModalLayout dismiss={dismiss} title={t('learn.goalDetails.realities.assess.title')}>
      <View style={styles.container}>
        <Text style={styles.explanation}>
          {t('learn.goalDetails.realities.assess.explanation', {
            goal: goal?.description,
          })}
        </Text>
        <SectionList
          items={[
            {
              title: isLoadingQuestions
                ? t('learn.goalDetails.realities.assess.loading')
                : t('learn.goalDetails.realities.assess.updateQuestions'),
              onPress: () => loadQuestions(),
              disabled: isLoadingQuestions,
              leftIcon: {
                name: isLoadingQuestions ? 'hourglass-empty' : 'refresh',
                type: 'material',
              },
            },
            ...(isLoadingQuestions ? [] : questions).map((question, index) => ({
              title: question + (isAddingRealityIndex === index ? ` (${t('common.loading')})` : ''),
              onPress: () => handleAddRealityFromQuestion(index),
              disabled: isAddingRealityIndex === index,
            })),
          ].filter(x => !!x)}
        />
        {isLoadingQuestions ? null : (
          <SectionList
            title={t('learn.goalDetails.realities.assess.furtherActions')}
            items={[
              {
                title: isAddingReality ? t('common.loading') : t('learn.goalDetails.realities.assess.addManual'),
                onPress: handleAddManualReality,
                disabled: isAddingReality,
                leftIcon: { name: 'add', type: 'material' },
              },
            ]}
            containerStyle={styles.manualAddContainer}
          />
        )}
      </View>
    </ModalLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  explanation: {
    marginBottom: 30,
    fontSize: 16,
  },
  manualAddContainer: {
    marginTop: 20,
  },
});

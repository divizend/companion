import React from 'react';

import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { ScrollScreen, Text } from '@/components/base';
import { SafeAreaView } from '@/components/base/SafeAreaView';
import GoalsSectionList from '@/components/features/learn/GoalsSectionList';
import UserInsightsSectionList from '@/components/features/learn/UserInsightsSectionList';

export default function RealizeGoals() {
  const { t } = useTranslation();

  return (
    <SafeAreaView>
      <ScrollScreen>
        <Text h1 style={styles.title}>
          {t('learn.realizeGoals.title')}
        </Text>
        <Text style={styles.explanationText}>{t('learn.realizeGoals.explanation')}</Text>
        <GoalsSectionList parentGoalId={null} />
        <UserInsightsSectionList />
      </ScrollScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    marginHorizontal: 5,
  },
  explanationText: {
    fontSize: 16,
    marginHorizontal: 5,
    marginBottom: 30,
  },
  UserInsightsSectionList: {
    marginTop: 30,
  },
});

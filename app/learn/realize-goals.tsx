import React from 'react';

import { StyleSheet } from 'react-native';

import { ScrollScreen, Text } from '@/components/base';
import { SafeAreaView } from '@/components/base/SafeAreaView';
import { t } from '@/i18n';

import GoalsSectionList from './GoalsSectionList';
import UserInsightsSectionList from './UserInsightsSectionList';

export default function RealizeGoals() {
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

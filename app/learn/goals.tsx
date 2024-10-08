import React, { useState } from 'react';

import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { apiPost } from '@/common/api';
import { Text } from '@/components/base';
import { SafeAreaView } from '@/components/base/SafeAreaView';
import { t } from '@/i18n';

import GoalsManager from './GoalsManager';

export default function GenerateGoals() {
  const navigation = useNavigation();
  const [confirmingGoals, setConfirmingGoals] = useState<boolean>(false);

  const handleConfirmGoals = async () => {
    setConfirmingGoals(true);
    try {
      await apiPost('/companion/goals-done', {});
      navigation.navigate('RealizeGoals' as never);
    } finally {
      setConfirmingGoals(false);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>{t('learn.goals.title')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Insights' as never)}>
          <Text style={styles.backLink}>{t('learn.goals.backLink')}</Text>
        </TouchableOpacity>
        <Text style={styles.explanationText}>{t('learn.goals.explanation')}</Text>
        <GoalsManager
          confirmButtonProps={{
            title: t('learn.goals.confirmGoals'),
            onPress: handleConfirmGoals,
            disabled: confirmingGoals,
            loading: confirmingGoals,
          }}
          parentGoalId={null}
          allowRedetermine
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  backLink: {
    color: 'grey',
    marginHorizontal: 5,
    marginBottom: 10,
  },
  explanationText: {
    fontSize: 16,
    marginHorizontal: 5,
    marginBottom: 30,
  },
});

import React, { useState } from 'react';

import { useNavigation } from '@react-navigation/native';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { apiPost } from '@/common/api';
import { ScrollView, Text } from '@/components/base';
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
      <ScrollView>
        <Text className="text-3xl font-bold mb-5 mx-1.5">{t('learn.goals.title')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Insights' as never)}>
          <Text className="text-gray-500 mx-1.5 mb-2.5">{t('learn.goals.backLink')}</Text>
        </TouchableOpacity>
        <Text className="text-[16px] mx-1.5 mb-8">{t('learn.goals.explanation')}</Text>
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

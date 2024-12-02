import React, { useState } from 'react';

import { router } from 'expo-router';
import { TouchableOpacity } from 'react-native';

import { apiPost } from '@/common/api';
import { ScrollScreen, Text } from '@/components/base';
import { SafeAreaView } from '@/components/base/SafeAreaView';
import GoalsManager from '@/components/features/learn/GoalsManager';
import { t } from '@/i18n';

export default function GenerateGoals() {
  const [confirmingGoals, setConfirmingGoals] = useState<boolean>(false);

  const handleConfirmGoals = async () => {
    setConfirmingGoals(true);
    try {
      await apiPost('/companion/goals-done', {});
      router.navigate('/main/app/(tabs)/learn/realize-goals');
    } finally {
      setConfirmingGoals(false);
    }
  };

  return (
    <SafeAreaView>
      <ScrollScreen>
        <Text className="text-3xl font-bold mb-5 mx-1.5">{t('learn.goals.title')}</Text>
        <TouchableOpacity onPress={() => router.navigate('/main/app/(tabs)/learn/insights')}>
          <Text type="muted" className="mx-1.5 mb-2.5">
            {t('learn.goals.backLink')}
          </Text>
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
      </ScrollScreen>
    </SafeAreaView>
  );
}

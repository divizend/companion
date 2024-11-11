import React, { useState } from 'react';

import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { useUserProfile } from '@/common/profile';
import SectionList from '@/components/SectionList';
import { t } from '@/i18n';

import GoalsManagerModal from './GoalsManagerModal';

interface GoalsSectionListProps {
  parentGoalId: string | null;
  allowRedetermine?: boolean;
  style?: any;
}

export default function GoalsSectionList({ parentGoalId, allowRedetermine, style }: GoalsSectionListProps) {
  const { profile } = useUserProfile();

  const [showGoalsManagerModal, setShowGoalsManagerModal] = useState(false);
  const variant = parentGoalId ? 'secondary' : 'primary';

  return (
    <>
      <SectionList
        title={t(`learn.goalsManager.${variant}.listTitle`)}
        items={[
          ...profile.companionProfile.goals
            .filter(g => g.parentGoalId === parentGoalId)
            .map(goal => ({
              title: goal.description,
              onPress: () =>
                router.push({ pathname: '/main/app/(tabs)/learn/goal-details', params: { goalId: goal.id } }),
              leftIcon: goal.emoji,
            })),
          {
            title: t(`learn.goalsManager.${variant}.title`),
            onPress: () => setShowGoalsManagerModal(true),
            leftIcon: { name: 'edit', type: 'material' },
          },
        ]}
        containerStyle={style ?? styles.sectionContainer}
        bottomText={variant === 'secondary' ? t(`learn.goalsManager.${variant}.explanation`) : undefined}
      />

      <GoalsManagerModal
        visible={showGoalsManagerModal}
        onClose={() => setShowGoalsManagerModal(false)}
        parentGoalId={parentGoalId}
        allowRedetermine={allowRedetermine}
      />
    </>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 0,
    marginBottom: 40,
  },
});

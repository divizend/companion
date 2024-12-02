import React from 'react';

import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { useUserProfile } from '@/common/profile';
import SectionList from '@/components/SectionList';
import ModalLayout from '@/components/global/ModalLayout';
import { ModalManager } from '@/components/global/modal';
import { t } from '@/i18n';

import GoalsManager from './GoalsManager';

interface GoalsSectionListProps {
  parentGoalId: string | null;
  allowRedetermine?: boolean;
  style?: any;
}

export default function GoalsSectionList({ parentGoalId, allowRedetermine, style }: GoalsSectionListProps) {
  const { profile } = useUserProfile();

  const variant = parentGoalId ? 'secondary' : 'primary';

  const GoalsManagerModal = ({ dismiss }: any) => (
    <ModalLayout dismiss={() => dismiss()} title={t(`learn.goalsManager.${variant}.title`)}>
      <GoalsManager parentGoalId={parentGoalId} allowRedetermine />
    </ModalLayout>
  );

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
            onPress: () => ModalManager.showModal(GoalsManagerModal),
            leftIcon: { name: 'edit', type: 'material' },
          },
        ]}
        containerStyle={style ?? styles.sectionContainer}
        bottomText={variant === 'secondary' ? t(`learn.goalsManager.${variant}.explanation`) : undefined}
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

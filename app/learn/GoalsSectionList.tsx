import React, { useState } from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { t } from '@/i18n';
import { useUserProfile } from '@/common/profile';
import { useNavigation } from '@react-navigation/native';
import SectionList from '@/components/SectionList';
import GoalsManagerModal from './GoalsManagerModal';

interface GoalsSectionListProps {
  parentGoalId: string | null;
  allowRedetermine?: boolean;
  style?: any;
}

export default function GoalsSectionList({ parentGoalId, allowRedetermine, style }: GoalsSectionListProps) {
  const navigation = useNavigation();
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
                // super ugly typecast to avoid TS errors relating to "never"
                (navigation.navigate as any)('GoalDetails', {
                  goalId: goal.id,
                }),
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

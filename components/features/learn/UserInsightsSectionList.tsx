import React, { useState } from 'react';

import { Alert, StyleSheet } from 'react-native';

import { apiPost } from '@/common/api';
import { CompanionProfileUserInsight, useUserProfile } from '@/common/profile';
import SectionList from '@/components/SectionList';
import { showPrompt } from '@/components/global/prompt';
import { t } from '@/i18n';

interface UserInsightsSectionListProps {
  isOnboarding?: boolean;
}

export default function UserInsightsSectionList({ isOnboarding }: UserInsightsSectionListProps) {
  const { profile, updateCompanionProfile } = useUserProfile();
  const [removingInsightId, setRemovingInsightId] = useState<string | null>(null);
  const [addingInsight, setAddingInsight] = useState<boolean>(false);

  const handleRemoveInsight = (insightId: string) => {
    Alert.alert(
      profile.companionProfile.userInsights.find(i => i.id === insightId)?.insight!,
      t('learn.insights.removeInsight.message'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.remove'),
          onPress: async () => {
            const filteredInsights = profile.companionProfile.userInsights.filter(
              (i: CompanionProfileUserInsight) => i.id !== insightId,
            );
            try {
              setRemovingInsightId(insightId);
              await apiPost('/companion/insights', {
                newUserInsights: filteredInsights,
              });
              updateCompanionProfile({
                userInsights: filteredInsights,
              });
            } finally {
              setRemovingInsightId(null);
            }
          },
          style: 'destructive',
        },
      ],
    );
  };

  const handleAddInsight = async () => {
    const insight = await showPrompt({ title: t('learn.insights.addInsight.message') });
    if (!insight) return;

    try {
      setAddingInsight(true);
      const newInsight = await apiPost('/companion/insights/reformulate', {
        insight,
      });
      updateCompanionProfile(p => {
        p.userInsights.push(newInsight);
      });
    } finally {
      setAddingInsight(false);
    }
  };

  return (
    <SectionList
      title={t(`learn.insights.${isOnboarding ? 'insightsOnboarding' : 'insights'}.title`)}
      items={[
        ...profile.companionProfile.userInsights.map((insight: CompanionProfileUserInsight) => ({
          title: insight.insight + (removingInsightId === insight.id ? ` (${t('common.removing')})` : ''),
          disabled: removingInsightId === insight.id,
          onRemove: () => handleRemoveInsight(insight.id),
        })),
        isOnboarding
          ? null
          : {
              title: addingInsight ? t('common.loading') : t('learn.insights.addInsight.title'),
              onPress: handleAddInsight,
              disabled: addingInsight,
              leftIcon: {
                name: addingInsight ? 'hourglass-empty' : 'add',
                type: 'material',
              },
            },
      ].filter(x => !!x)}
      bottomText={t(`learn.insights.${isOnboarding ? 'insightsOnboarding' : 'insights'}.bottomText`)}
      containerStyle={styles.sectionContainer}
    />
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 0,
    marginBottom: 20,
  },
});

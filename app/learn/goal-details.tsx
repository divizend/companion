import React, { useRef, useState } from 'react';

import { useRoute } from '@react-navigation/native';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { apiDelete, apiGet, apiPost } from '@/common/api';
import { showConfirmationDialog } from '@/common/inputDialog';
import { showInputDialog } from '@/common/inputDialog';
import { useGoal, useUserProfile } from '@/common/profile';
import ChatModal from '@/components/ChatModal';
import SectionList from '@/components/SectionList';
import { ScrollView, ScrollViewRef, Text } from '@/components/base';
import { SafeAreaView } from '@/components/base/SafeAreaView';
import { t } from '@/i18n';

import AssessRealitiesModal from './AssessRealitiesModal';
import GoalsSectionList from './GoalsSectionList';

export default function GoalDetails() {
  const route = useRoute();
  const { goalId } = route.params as { goalId: string };
  const { updateCompanionProfile } = useUserProfile();
  const goal = useGoal(goalId)!;

  const [showAssessModal, setShowAssessModal] = useState(false);
  const [isRefiningRealityId, setIsRefiningRealityId] = useState<string | null>(null);
  const [isRemovingRealityId, setIsRemovingRealityId] = useState<string | null>(null);
  const [isAddingLearningIntentions, setIsAddingLearningIntentions] = useState(false);
  const [isRemovingLearningIntentionId, setIsRemovingLearningIntentionId] = useState<string | null>(null);
  const [isClearingLearningIntentions, setIsClearingLearningIntentions] = useState(false);
  const [chatModalOpenLearningIntentionId, setChatModalOpenLearningIntentionId] = useState<string | null>(null);
  const [isModifyingEmoji, setIsModifyingEmoji] = useState(false);

  const scrollViewRef = useRef<ScrollViewRef>(null);

  const handleRemoveReality = async (realityId: string) => {
    const realityToRemove = goal.realities.find(r => r.id === realityId);
    if (!realityToRemove) return;

    const confirmation = await showConfirmationDialog(
      realityToRemove.reality,
      t('learn.goalDetails.realities.removeReality'),
    );

    if (confirmation) {
      try {
        setIsRemovingRealityId(realityId);
        const newRealities = goal!.realities.filter(r => r.id !== realityId);
        await apiPost(`/companion/goal/${goalId}/realities`, {
          newRealities,
        });
        updateCompanionProfile(p => {
          p.goals.find(g => g.id === goalId)!.realities = newRealities;
        });
      } finally {
        setIsRemovingRealityId(null);
      }
    }
  };

  const handleRefineReality = async (realityId: string) => {
    const realityToRefineIndex = goal.realities.findIndex(r => r.id === realityId);
    if (realityToRefineIndex === -1) return;
    const realityToRefine = goal.realities[realityToRefineIndex];

    const feedback = await showInputDialog(realityToRefine.reality, t('learn.goalDetails.realities.refineReality'));

    if (feedback) {
      try {
        setIsRefiningRealityId(realityId);
        const updatedReality = await apiPost(`/companion/goal/${goalId}/reality/${realityId}/refine`, { feedback });
        updateCompanionProfile(p => {
          p.goals.find(g => g.id === goalId)!.realities[realityToRefineIndex] = updatedReality;
        });
      } finally {
        setIsRefiningRealityId(null);
      }
    }
  };

  const handleAddLearningIntentions = async () => {
    setIsAddingLearningIntentions(true);
    try {
      const newLearningIntentions = await apiGet(`/companion/goal/${goalId}/suggest-learning-intentions`);
      updateCompanionProfile(p => {
        p.goals.find(g => g.id === goalId)!.learningIntentions.push(...newLearningIntentions);
      });
    } finally {
      setIsAddingLearningIntentions(false);
    }
  };

  const handleRemoveLearningIntention = async (learningIntentionId: string) => {
    const confirmation = await showConfirmationDialog(
      goal.learningIntentions.find(i => i.id === learningIntentionId)?.summary!,
      t('learn.goalDetails.learningIntentions.removeIntention'),
    );

    if (confirmation) {
      try {
        setIsRemovingLearningIntentionId(learningIntentionId);
        await apiDelete(`/companion/goal/${goalId}/learning-intention/${learningIntentionId}`);
        updateCompanionProfile(p => {
          const goal = p.goals.find(g => g.id === goalId)!;
          goal.learningIntentions = goal.learningIntentions.filter(i => i.id !== learningIntentionId);
        });
      } finally {
        setIsRemovingLearningIntentionId(null);
      }
    }
  };

  const handleClearLearningIntentions = async () => {
    const confirmation = await showConfirmationDialog(
      t('learn.goalDetails.learningIntentions.clear.title'),
      t('learn.goalDetails.learningIntentions.clear.message'),
    );

    if (confirmation) {
      try {
        setIsClearingLearningIntentions(true);
        await apiDelete(`/companion/goal/${goalId}/learning-intentions`);
        updateCompanionProfile(p => {
          p.goals.find(g => g.id === goalId)!.learningIntentions = [];
        });
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      } finally {
        setIsClearingLearningIntentions(false);
      }
    }
  };

  const handleModifyEmoji = async () => {
    const emojiDesire = await showInputDialog(t('askEmoji'));
    if (emojiDesire) {
      try {
        setIsModifyingEmoji(true);
        const newGoal = await apiPost(`/companion/goal/${goalId}/emoji`, {
          input: emojiDesire,
        });
        updateCompanionProfile(p => {
          const goalIndex = p.goals.findIndex(g => g.id === goalId);
          p.goals[goalIndex] = newGoal;
        });
      } finally {
        setIsModifyingEmoji(false);
      }
    }
  };

  if (!goal) {
    return null;
  }

  return (
    <SafeAreaView>
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollViewContent}>
        <TouchableOpacity onPress={handleModifyEmoji} activeOpacity={1}>
          {goal.emoji || isModifyingEmoji ? (
            <Text style={styles.emojiIcon}>{isModifyingEmoji ? '⏳' : goal.emoji}</Text>
          ) : null}
          <Text h1 style={styles.title}>
            {goal.description}
          </Text>
        </TouchableOpacity>

        <SectionList
          title={t('learn.goalDetails.learningIntentions.title')}
          items={[
            ...goal.learningIntentions.map(intention => ({
              title:
                intention.summary +
                (isRemovingLearningIntentionId === intention.id ? ` (${t('common.removing')})` : ''),
              leftIcon: intention.emoji,
              onRemove: () => handleRemoveLearningIntention(intention.id),
              disabled: isRemovingLearningIntentionId === intention.id,
              onPress: () => setChatModalOpenLearningIntentionId(intention.id),
              additional:
                chatModalOpenLearningIntentionId === intention.id ? (
                  <ChatModal
                    visible={chatModalOpenLearningIntentionId === intention.id}
                    onClose={() => setChatModalOpenLearningIntentionId(null)}
                    systemPrompt={`You are an AI assistant that helps the user with the goal of \"${
                      goal.description
                    }\". Never use Markdown. Make sure to give exceptionally intelligent and helpful responses. All responses should always be practical, pragmatic, as specific as possible and clearly actionable. The user already stated the following facts and context for this goal, which should be considered in all responses:\n${goal.realities
                      .map(r => `- ${r.reality}`)
                      .join('\n')}`}
                    initialUserMessage={intention.question}
                  />
                ) : null,
            })),
            {
              title: isAddingLearningIntentions
                ? t('common.loading')
                : goal.learningIntentions.length > 0
                  ? t('learn.goalDetails.learningIntentions.addMore')
                  : t('learn.goalDetails.learningIntentions.add'),
              onPress: handleAddLearningIntentions,
              leftIcon: {
                name: isAddingLearningIntentions ? 'hourglass-empty' : 'add',
                type: 'material',
              },
              disabled: isAddingLearningIntentions,
            },
            goal.learningIntentions.length > 0 && {
              title: isClearingLearningIntentions
                ? t('common.loading')
                : t('learn.goalDetails.learningIntentions.clear.title'),
              onPress: handleClearLearningIntentions,
              leftIcon: {
                name: isClearingLearningIntentions ? 'hourglass-empty' : 'delete',
                type: 'material',
              },
              disabled: isClearingLearningIntentions,
            },
          ].filter(x => !!x)}
          bottomText={t('learn.goalDetails.learningIntentions.explanation')}
          containerStyle={styles.sectionContainer}
        />

        <SectionList
          title={t('learn.goalDetails.realities.title')}
          items={[
            ...goal.realities.map(reality => ({
              title:
                isRefiningRealityId === reality.id
                  ? `${reality.reality} (${t('common.refining')})`
                  : isRemovingRealityId === reality.id
                    ? `${reality.reality} (${t('common.removing')})`
                    : reality.reality,
              disabled: isRefiningRealityId === reality.id || isRemovingRealityId === reality.id,
              onPress: () => handleRefineReality(reality.id),
              onRemove: () => handleRemoveReality(reality.id),
            })),
            {
              title: t('learn.goalDetails.realities.assess.cta'),
              onPress: () => setShowAssessModal(true),
              leftIcon: { name: 'add', type: 'material' },
            },
          ]}
          bottomText={t('learn.goalDetails.realities.explanation')}
          containerStyle={styles.sectionContainer}
        />

        <GoalsSectionList parentGoalId={goalId} allowRedetermine />

        <AssessRealitiesModal visible={showAssessModal} onClose={() => setShowAssessModal(false)} goalId={goalId} />
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
    fontWeight: 'bold',
    marginBottom: 30,
    marginHorizontal: 5,
  },
  sectionContainer: {
    marginBottom: 40,
  },
  emojiIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
});

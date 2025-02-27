import React, { useRef, useState } from 'react';

import { useRoute } from '@react-navigation/native';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { apiDelete, apiGet, apiPost } from '@/common/api';
import { showConfirmationDialog } from '@/common/inputDialog';
import { useGoal, useUserProfile } from '@/common/profile';
import ChatModal from '@/components/ChatModal';
import SectionList from '@/components/SectionList';
import { ScrollScreen, ScrollScreenRef, Text } from '@/components/base';
import { SafeAreaView } from '@/components/base/SafeAreaView';
import AssessRealitiesModal from '@/components/features/learn/AssessRealitiesModal';
import GoalsSectionList from '@/components/features/learn/GoalsSectionList';
import { ModalManager } from '@/components/global/modal';
import { showPrompt } from '@/components/global/prompt';
import { t } from '@/i18n';

export default function GoalDetails() {
  const route = useRoute();
  const { goalId } = route.params as { goalId: string };
  const { updateCompanionProfile } = useUserProfile();
  const goal = useGoal(goalId)!;

  const [isRefiningRealityId, setIsRefiningRealityId] = useState<string | null>(null);
  const [isRemovingRealityId, setIsRemovingRealityId] = useState<string | null>(null);
  const [isAddingLearningIntentions, setIsAddingLearningIntentions] = useState(false);
  const [isRemovingLearningIntentionId, setIsRemovingLearningIntentionId] = useState<string | null>(null);
  const [isClearingLearningIntentions, setIsClearingLearningIntentions] = useState(false);
  const [isModifyingEmoji, setIsModifyingEmoji] = useState(false);

  const scrollViewRef = useRef<ScrollScreenRef>(null);

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

    const feedback = await showPrompt({
      title: realityToRefine.reality,
      message: t('learn.goalDetails.realities.refineReality'),
    });

    if (!feedback) return;
    try {
      setIsRefiningRealityId(realityId);
      const updatedReality = await apiPost(`/companion/goal/${goalId}/reality/${realityId}/refine`, { feedback });
      updateCompanionProfile(p => {
        p.goals.find(g => g.id === goalId)!.realities[realityToRefineIndex] = updatedReality;
      });
    } finally {
      setIsRefiningRealityId(null);
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
    const emojiDesire = await showPrompt({
      title: t('common.askEmoji'),
    });
    if (!emojiDesire) return;
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
  };

  if (!goal) {
    return null;
  }

  const AssessRealities = ({ dismiss }: { dismiss: () => void }) => (
    <AssessRealitiesModal dismiss={dismiss} goalId={goal.id} />
  );

  return (
    <SafeAreaView>
      <ScrollScreen ref={scrollViewRef}>
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
              onPress: () =>
                ModalManager.showModal(({ dismiss }) => (
                  <ChatModal
                    dismiss={dismiss}
                    systemPrompt={`You are an AI assistant that helps the user with the goal of \"${
                      goal.description
                    }\". Never use Markdown. Make sure to give exceptionally intelligent and helpful responses. All responses should always be practical, pragmatic, as specific as possible and clearly actionable. The user already stated the following facts and context for this goal, which should be considered in all responses:\n${goal.realities
                      .map(r => `- ${r.reality}`)
                      .join('\n')}`}
                    initialUserMessage={intention.question}
                  />
                )),
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
              onPress: () => ModalManager.showModal(AssessRealities),
              leftIcon: { name: 'add', type: 'material' },
            },
          ]}
          bottomText={t('learn.goalDetails.realities.explanation')}
          containerStyle={styles.sectionContainer}
        />

        <GoalsSectionList parentGoalId={goalId} allowRedetermine />
      </ScrollScreen>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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

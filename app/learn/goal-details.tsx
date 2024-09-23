import React, { useState } from "react";
import { StyleSheet, SafeAreaView, ScrollView, Alert } from "react-native";
import { Text } from "@rneui/themed";
import { useRoute } from "@react-navigation/native";
import { t } from "@/i18n";
import { useUserProfile, useGoal } from "@/common/profile";
import SectionList from "@/components/SectionList";
import { apiPost } from "@/common/api";
import { showConfirmationDialog } from "@/common/inputDialog";
import { showInputDialog } from "@/common/inputDialog";
import AssessRealitiesModal from "./AssessRealitiesModal";
import GoalsSectionList from "./GoalsSectionList";
import LearningIntentionsModal from "./LearningIntentionsModal";

export default function GoalDetails() {
  const route = useRoute();
  const { goalId } = route.params as { goalId: string };
  const { updateCompanionProfile, apiPostAI } = useUserProfile();
  const goal = useGoal(goalId)!;

  const [showAssessModal, setShowAssessModal] = useState(false);
  const [isRefiningRealityId, setIsRefiningRealityId] = useState<string | null>(
    null
  );
  const [isRemovingRealityId, setIsRemovingRealityId] = useState<string | null>(
    null
  );
  const [showLearningIntentionsModal, setShowLearningIntentionsModal] =
    useState(false);

  const handleRemoveReality = async (realityId: string) => {
    const realityToRemove = goal?.realities.find((r) => r.id === realityId);
    if (!realityToRemove) return;

    const confirmation = await showConfirmationDialog(
      realityToRemove.reality,
      t("learn.goalDetails.realities.removeReality")
    );

    if (confirmation) {
      try {
        setIsRemovingRealityId(realityId);
        const newRealities = goal!.realities.filter((r) => r.id !== realityId);
        await apiPost(`/companion/goal/${goalId}/realities`, {
          newRealities,
        });
        updateCompanionProfile((p) => {
          p.goals.find((g) => g.id === goalId)!.realities = newRealities;
        });
      } finally {
        setIsRemovingRealityId(null);
      }
    }
  };

  const handleRefineReality = async (realityId: string) => {
    const realityToRefineIndex = goal.realities.findIndex(
      (r) => r.id === realityId
    );
    if (realityToRefineIndex === -1) return;
    const realityToRefine = goal.realities[realityToRefineIndex];

    const feedback = await showInputDialog(
      realityToRefine.reality,
      t("learn.goalDetails.realities.refineReality")
    );

    if (feedback) {
      try {
        setIsRefiningRealityId(realityId);
        const updatedReality = await apiPostAI(
          `/companion/goal/${goalId}/reality/${realityId}/refine`,
          [],
          { feedback }
        );
        updateCompanionProfile((p) => {
          p.goals.find((g) => g.id === goalId)!.realities[
            realityToRefineIndex
          ] = updatedReality;
        });
      } finally {
        setIsRefiningRealityId(null);
      }
    }
  };

  if (!goal) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text h3 style={styles.title}>
          {goal?.description}
        </Text>

        <SectionList
          title={t("learn.goalDetails.learningIntentions.title")}
          items={[
            /*...goal.learningIntentions.map((intention) => ({
              title: intention,
            })),*/
            {
              title: t("learn.goalDetails.learningIntentions.add"),
              onPress: () => setShowLearningIntentionsModal(true),
              leftIcon: { name: "add", type: "material" },
            },
          ]}
          bottomText={t("learn.goalDetails.learningIntentions.explanation")}
          containerStyle={styles.sectionContainer}
        />

        <SectionList
          title={t("learn.goalDetails.realities.title")}
          items={[
            ...goal.realities.map((reality) => ({
              title:
                isRefiningRealityId === reality.id
                  ? `${reality.reality} (${t("common.refining")})`
                  : isRemovingRealityId === reality.id
                  ? `${reality.reality} (${t("common.removing")})`
                  : reality.reality,
              disabled:
                isRefiningRealityId === reality.id ||
                isRemovingRealityId === reality.id,
              removable: true,
              onPress: () => handleRefineReality(reality.id),
              onRemove: () => handleRemoveReality(reality.id),
            })),
            {
              title: t("learn.goalDetails.realities.assess.cta"),
              onPress: () => setShowAssessModal(true),
              leftIcon: { name: "add", type: "material" },
            },
          ]}
          bottomText={t("learn.goalDetails.realities.explanation")}
          containerStyle={styles.sectionContainer}
        />

        <GoalsSectionList parentGoalId={goalId} allowRedetermine />

        <AssessRealitiesModal
          visible={showAssessModal}
          onClose={() => setShowAssessModal(false)}
          goalId={goalId}
        />

        <LearningIntentionsModal
          visible={showLearningIntentionsModal}
          onClose={() => setShowLearningIntentionsModal(false)}
          goalId={goalId}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  scrollViewContent: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 20,
    marginHorizontal: 5,
  },
  sectionContainer: {
    marginBottom: 40,
  },
});

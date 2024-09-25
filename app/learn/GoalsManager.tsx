import React, { useState } from "react";
import { StyleSheet, Alert } from "react-native";
import { t } from "@/i18n";
import SectionList from "@/components/SectionList";
import { useUserProfile, CompanionProfileGoal } from "@/common/profile";
import { showInputDialog } from "@/common/inputDialog";
import { apiDelete } from "@/common/api";
import StyledButton, { StyledButtonProps } from "@/components/StyledButton";

interface GoalsManagerProps {
  confirmButtonProps?: StyledButtonProps;
  allowRedetermine?: boolean;
  parentGoalId: string | null;
}

export default function GoalsManager({
  confirmButtonProps,
  allowRedetermine,
  parentGoalId,
}: GoalsManagerProps) {
  const { profile, updateCompanionProfile, apiPostAI } = useUserProfile({
    moduleDescription: t("learn.vision"),
    viewTitle: t("learn.goals.title"),
    viewExplanation: t("learn.goals.explanation"),
  });
  const [generatingLoading, setGeneratingLoading] = useState<boolean>(false);
  const [addingManualGoal, setAddingManualGoal] = useState<boolean>(false);
  const [refiningGoalId, setRefiningGoalId] = useState<string | null>(null);
  const [removingGoalId, setRemovingGoalId] = useState<string | null>(null);

  const variant = parentGoalId ? "secondary" : "primary";
  const relevantGoals = profile.companionProfile.goals.filter(
    (g) => g.parentGoalId === parentGoalId
  );

  const generateInitialGoals = async () => {
    const generateGoals = async () => {
      setGeneratingLoading(true);
      try {
        const goals: CompanionProfileGoal[] = await apiPostAI(
          parentGoalId
            ? `/companion/goal/${parentGoalId}/initialize-subgoals`
            : "/companion/learn/generate-initial-goals"
        );
        updateCompanionProfile((p) => {
          p.goals = [
            ...p.goals.filter((g) => g.parentGoalId !== parentGoalId),
            ...goals,
          ];
        });
      } finally {
        setGeneratingLoading(false);
      }
    };

    if (relevantGoals.length > 0) {
      Alert.alert(
        t(`learn.goalsManager.${variant}.replaceGoalsAlert.title`),
        t(`learn.goalsManager.${variant}.replaceGoalsAlert.message`),
        [
          {
            text: t("common.cancel"),
            style: "cancel",
          },
          {
            text: t("common.ok"),
            onPress: generateGoals,
          },
        ]
      );
    } else {
      await generateGoals();
    }
  };

  const removeGoal = async (goalId: string) => {
    Alert.alert(
      profile.companionProfile.goals.find((g) => g.id === goalId)?.description!,
      t(`learn.goalsManager.${variant}.removeGoalAlert.message`),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.remove"),
          onPress: async () => {
            try {
              setRemovingGoalId(goalId);
              await apiDelete(`/companion/goal/${goalId}`);
              updateCompanionProfile((p) => {
                p.goals = p.goals.filter((g) => g.id !== goalId);
              });
            } finally {
              setRemovingGoalId(null);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const addManualGoal = async () => {
    try {
      const newGoal = await showInputDialog(
        t(`learn.goalsManager.${variant}.furtherActions.addManualGoal.title`),
        t(
          `learn.goalsManager.${variant}.furtherActions.addManualGoal.placeholder`
        )
      );
      if (newGoal) {
        setAddingManualGoal(true);
        const reformulatedGoal: CompanionProfileGoal = await apiPostAI(
          "/companion/goal/reformulate",
          [],
          { goal: newGoal, parentGoalId }
        );
        updateCompanionProfile((p) => {
          p.goals.push(reformulatedGoal);
        });
      }
    } finally {
      setAddingManualGoal(false);
    }
  };

  const handleGoalClick = async (goal: CompanionProfileGoal) => {
    try {
      const feedback = await showInputDialog(
        goal.description,
        t(`learn.goalsManager.${variant}.refineGoal.placeholder`)
      );
      if (feedback) {
        setRefiningGoalId(goal.id);
        const refinedGoal = await apiPostAI(
          `/companion/goal/${goal.id}/refine`,
          [],
          { feedback }
        );
        updateCompanionProfile((p) => {
          const index = p.goals.findIndex((g) => g.id === goal.id);
          if (index !== -1) {
            p.goals[index] = refinedGoal;
          }
        });
      }
    } finally {
      setRefiningGoalId(null);
    }
  };

  return (
    <>
      <SectionList
        items={[
          allowRedetermine && {
            title: generatingLoading
              ? t(`learn.goalsManager.${variant}.generateButton.loading`)
              : relevantGoals.length > 0
              ? t(`learn.goalsManager.${variant}.generateButton.titleRecreate`)
              : t(`learn.goalsManager.${variant}.generateButton.title`),
            onPress: () => generateInitialGoals(),
            containerStyle: styles.generateButtonContainer,
            disabled: generatingLoading,
            leftIcon: {
              name: generatingLoading
                ? "hourglass-empty"
                : parentGoalId && relevantGoals.length === 0
                ? "call-split"
                : "refresh",
              type: "material",
            },
          },
          ...(generatingLoading ? [] : relevantGoals).map((goal) => ({
            title:
              refiningGoalId === goal.id
                ? `${goal.description} (${t("common.refining")})`
                : removingGoalId === goal.id
                ? `${goal.description} (${t("common.removing")})`
                : goal.description,
            onPress: () => handleGoalClick(goal),
            onRemove: () => removeGoal(goal.id),
            containerStyle:
              refiningGoalId === goal.id
                ? styles.refiningGoalContainer
                : undefined,
            disabled: removingGoalId === goal.id,
          })),
        ].filter((x) => !!x)}
        containerStyle={styles.sectionContainer}
      />
      <SectionList
        title={t(`learn.goalsManager.${variant}.furtherActions.sectionTitle`)}
        items={[
          {
            title: addingManualGoal
              ? t(
                  `learn.goalsManager.${variant}.furtherActions.addManualGoal.loading`
                )
              : t(
                  `learn.goalsManager.${variant}.furtherActions.addManualGoal.buttonTitle`
                ),
            onPress: addManualGoal,
            disabled: addingManualGoal,
            leftIcon: { name: "add", type: "material" },
          },
        ]}
        containerStyle={styles.addManualGoalContainer}
      />
      {relevantGoals.length > 0 && confirmButtonProps && (
        <StyledButton
          containerStyle={styles.confirmGoalsButton}
          {...confirmButtonProps}
        />
      )}
    </>
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
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    marginHorizontal: 5,
  },
  confirmButton: {
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  backLink: {
    color: "grey",
    marginHorizontal: 5,
    marginBottom: 10,
  },
  explanationText: {
    fontSize: 16,
    marginHorizontal: 5,
    marginBottom: 30,
  },
  sectionContainer: {
    marginBottom: 40,
  },
  generateButtonContainer: {
    backgroundColor: "#E6F3FF",
  },
  addManualGoalContainer: {
    marginTop: 0,
  },
  refiningGoalContainer: {
    opacity: 0.5,
  },
  confirmGoalsButton: {
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 20,
  },
});

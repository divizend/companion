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
}

export default function GoalsManager({
  confirmButtonProps,
  allowRedetermine = false,
}: GoalsManagerProps) {
  const { profile, updateCompanionProfile, apiPostAI } = useUserProfile({
    moduleDescription: t("learn.vision"),
    viewTitle: t("learn.goals.title"),
    viewExplanation: t("learn.goals.explanation"),
  });
  const [generatingLoading, setGeneratingLoading] = useState<boolean>(false);
  const [addingManualGoal, setAddingManualGoal] = useState<boolean>(false);
  const [refiningGoalId, setRefiningGoalId] = useState<string | null>(null);

  const generateInitialGoals = async () => {
    const generateGoals = async () => {
      setGeneratingLoading(true);
      try {
        const goals: CompanionProfileGoal[] = await apiPostAI(
          "/companion/learn/generate-initial-goals"
        );
        updateCompanionProfile({ goals });
      } finally {
        setGeneratingLoading(false);
      }
    };

    if (profile.companionProfile.goals.length > 0) {
      Alert.alert(
        t("learn.goals.replaceGoalsAlert.title"),
        t("learn.goals.replaceGoalsAlert.message"),
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
      t("learn.goals.removeGoalAlert.message"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.remove"),
          onPress: async () => {
            await apiDelete(`/companion/goal/${goalId}`);
            updateCompanionProfile((p) => {
              p.goals = p.goals.filter((g) => g.id !== goalId);
            });
          },
          style: "destructive",
        },
      ]
    );
  };

  const addManualGoal = async () => {
    try {
      const newGoal = await showInputDialog(
        t("learn.goals.addManualGoal.title"),
        t("learn.goals.addManualGoal.placeholder")
      );
      if (newGoal) {
        setAddingManualGoal(true);
        const reformulatedGoal: CompanionProfileGoal = await apiPostAI(
          "/companion/goal/reformulate",
          [],
          { goal: newGoal }
        );
        updateCompanionProfile((p) => {
          p.goals.push(reformulatedGoal);
        });
      }
    } catch (error) {
      // ignore any errors
    } finally {
      setAddingManualGoal(false);
    }
  };

  const handleGoalClick = async (goal: CompanionProfileGoal) => {
    try {
      const feedback = await showInputDialog(
        goal.description,
        t("learn.goals.refineGoal.placeholder")
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
    } catch (error) {
      // ignore any errors
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
              ? t("learn.goals.generateButton.loading")
              : profile.companionProfile.goals.length > 0
              ? t("learn.goals.generateButton.titleRecreate")
              : t("learn.goals.generateButton.title"),
            onPress: () => generateInitialGoals(),
            containerStyle: styles.generateButtonContainer,
            disabled: generatingLoading,
          },
          ...profile.companionProfile.goals.map((goal) => ({
            title:
              refiningGoalId === goal.id
                ? `${goal.description} (${t("common:refining")})`
                : goal.description,
            onPress: () => handleGoalClick(goal),
            removable: true,
            onRemove: () => removeGoal(goal.id),
            containerStyle:
              refiningGoalId === goal.id
                ? styles.refiningGoalContainer
                : undefined,
          })),
        ].filter((x) => !!x)}
        containerStyle={styles.sectionContainer}
      />
      {profile.companionProfile.goals.length > 0 && (
        <>
          <SectionList
            title={t("learn.goals.addManualGoal.sectionTitle")}
            items={[
              {
                title: addingManualGoal
                  ? t("learn.goals.addManualGoal.loading")
                  : t("learn.goals.addManualGoal.buttonTitle"),
                onPress: addManualGoal,
                disabled: addingManualGoal,
                leftIcon: { name: "add", type: "material" },
              },
            ]}
            containerStyle={styles.addManualGoalContainer}
          />
          {confirmButtonProps && (
            <StyledButton
              containerStyle={styles.confirmGoalsButton}
              {...confirmButtonProps}
            />
          )}
        </>
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

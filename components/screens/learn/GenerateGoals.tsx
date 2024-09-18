import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "@rneui/themed";
import { t } from "@/i18n";
import StyledButton from "@/components/StyledButton";
import SectionList from "@/components/SectionList";
import { apiPost } from "@/common/api";

interface Goal {
  id: string;
  text: string;
}

interface InsightSection {
  insight: string;
  goals: Goal[];
}

interface GenerateGoalsProps {
  insights: string[];
  onGoBack: () => void;
}

export default function GenerateGoals({
  insights,
  onGoBack,
}: GenerateGoalsProps) {
  const [sections, setSections] = useState<InsightSection[]>(
    insights.map((insight) => ({ insight, goals: [] }))
  );

  const generateGoals = async (insightIndex: number) => {
    const updatedSections = [...sections];
    updatedSections[insightIndex].goals = [
      { id: "loading", text: t("learn.goals.generating") },
    ];
    setSections(updatedSections);

    try {
      const response = await apiPost("/companion/learn/generate-goals", {
        insight: sections[insightIndex].insight,
      });
      const newGoals: Goal[] = response.goals.map((goal: string) => ({
        id: Math.random().toString(),
        text: goal,
      }));
      updatedSections[insightIndex].goals = newGoals;
      setSections(updatedSections);
    } catch (error) {
      console.error("Failed to generate goals:", error);
      updatedSections[insightIndex].goals = [];
      setSections(updatedSections);
    }
  };

  const expandGoal = async (sectionIndex: number, goalIndex: number) => {
    try {
      const goal = sections[sectionIndex].goals[goalIndex];
      const response = await apiPost("/companion/learn/expand-goal", {
        goal: goal.text,
      });
      const updatedSections = [...sections];
      updatedSections[sectionIndex].goals[goalIndex] = {
        ...goal,
        text: response.expandedGoal,
      };
      setSections(updatedSections);
    } catch (error) {
      console.error("Failed to expand goal:", error);
    }
  };

  const removeGoal = (sectionIndex: number, goalIndex: number) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].goals.splice(goalIndex, 1);
    setSections(updatedSections);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onGoBack}>
        <Text style={styles.backLink}>{t("learn.goals.backLink")}</Text>
      </TouchableOpacity>
      <Text style={styles.explanationText}>{t("learn.goals.explainer")}</Text>
      {sections.map((section, sectionIndex) => (
        <SectionList
          key={section.insight}
          title={section.insight}
          items={[
            {
              title: t("learn.goals.generateButton"),
              onPress: () => generateGoals(sectionIndex),
              containerStyle: styles.generateButtonContainer,
            },
            ...section.goals.map((goal, goalIndex) => ({
              title: goal.text,
              onPress: () => expandGoal(sectionIndex, goalIndex),
              removable: true,
              onRemove: () => removeGoal(sectionIndex, goalIndex),
            })),
          ]}
          containerStyle={styles.sectionContainer}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});

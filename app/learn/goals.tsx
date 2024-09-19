import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Text } from "@rneui/themed";
import { t } from "@/i18n";
import SectionList from "@/components/SectionList";
import { apiPost } from "@/common/api";
import {
  useUserProfile,
  CompanionProfile,
  CompanionProfileLearnGoal,
} from "@/common/profile";
import { useNavigation } from "@react-navigation/native";

export default function GenerateGoals() {
  const navigation = useNavigation();
  const { profile, updateCompanionProfile } = useUserProfile();
  const [generatingInsightId, setGeneratingInsightId] = useState<string | null>(
    null
  );

  const generateGoals = async (insightId: string) => {
    setGeneratingInsightId(insightId);
    try {
      let context = [AI_CONTEXT_VIEW, AI_CONTEXT_INSIGHTS];
      const goals =
        profile.companionProfile?.learnInsights!.find(
          (i) => i.id === insightId
        )!.goals ?? [];
      if (goals.length) {
        context.push(
          t("learn.goals.aiContext.goals", {
            goals: goals.map((goal) => goal.goal).join("\n"),
          })
        );
      }

      const response: CompanionProfileLearnGoal[] = await apiPost(
        "/companion/learn/generate-goals",
        { context, insightId }
      );
      updateCompanionProfile((draft: CompanionProfile) => {
        draft.learnInsights!.find((i) => i.id === insightId)!.goals = response;
      });
    } finally {
      setGeneratingInsightId(null);
    }
  };

  const AI_CONTEXT_VIEW = t("aiContext.view", {
    title: t("learn.goals.title"),
    explanation: t("learn.goals.explanation"),
  });
  const AI_CONTEXT_INSIGHTS = t("learn.goals.aiContext.insights", {
    insights: (profile.companionProfile?.learnInsights ?? [])
      .map((insight) => insight.insight)
      .join("\n"),
  });

  const removeGoal = async (insightId: string, goalId: string) => {
    const newCompanionProfile = updateCompanionProfile((p) => {
      const insight = p.learnInsights!.find((i) => i.id === insightId)!;
      insight.goals = insight.goals.filter((g) => g.id !== goalId);
    });
    await apiPost("/companion/learn/insights", {
      newLearnInsights: newCompanionProfile.learnInsights,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text h1 style={styles.title}>
          {t("learn.goals.title")}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Insights" as never)}
        >
          <Text style={styles.backLink}>{t("learn.goals.backLink")}</Text>
        </TouchableOpacity>
        <Text style={styles.explanationText}>
          {t("learn.goals.explanation")}
        </Text>
        {(profile.companionProfile?.learnInsights ?? []).map((insight) => (
          <SectionList
            key={insight.insight}
            title={insight.insight}
            items={[
              {
                title:
                  generatingInsightId === insight.id
                    ? t("learn.goals.generateButton.loading")
                    : insight.goals?.length
                    ? t("learn.goals.generateButton.titleMore")
                    : t("learn.goals.generateButton.title"),
                onPress: () => generateGoals(insight.id),
                containerStyle: styles.generateButtonContainer,
                disabled: generatingInsightId === insight.id,
              },
              ...(insight.goals ?? []).map((goal) => ({
                title: goal.goal,
                removable: true,
                onRemove: () => removeGoal(insight.id, goal.id),
              })),
            ]}
            containerStyle={styles.sectionContainer}
          />
        ))}
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
});

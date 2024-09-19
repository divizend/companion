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
import { useUserProfile, CompanionProfileGoal } from "@/common/profile";
import { useNavigation } from "@react-navigation/native";

export default function GenerateGoals() {
  const navigation = useNavigation();
  const { profile, updateCompanionProfile, apiPostAI } = useUserProfile({
    moduleDescription: t("learn.vision"),
    viewTitle: t("learn.goals.title"),
    viewExplanation: t("learn.goals.explanation"),
  });
  const [generatingLoading, setGeneratingLoading] = useState<boolean>(false);

  const generateInitialGoals = async () => {
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

  const removeGoal = async (goalId: string) => {
    updateCompanionProfile((p) => {
      p.goals = p.goals.filter((g) => g.id !== goalId);
    });
    /*await apiPostAI("/companion/insights", [], {
      newUserInsights: newCompanionProfile.userInsights,
    });*/
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
        <SectionList
          items={[
            {
              title: generatingLoading
                ? t("learn.goals.generateButton.loading")
                : t("learn.goals.generateButton.title"),
              onPress: () => generateInitialGoals(),
              containerStyle: styles.generateButtonContainer,
              disabled: generatingLoading,
            },
            ...profile.companionProfile.goals.map((goal) => ({
              title: goal.description,
              removable: true,
              onRemove: () => removeGoal(goal.id),
            })),
          ]}
          containerStyle={styles.sectionContainer}
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

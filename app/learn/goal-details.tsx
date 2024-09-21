import React, { useState } from "react";
import { StyleSheet, SafeAreaView, ScrollView, Alert } from "react-native";
import { Text } from "@rneui/themed";
import { useRoute } from "@react-navigation/native";
import { t } from "@/i18n";
import { useUserProfile } from "@/common/profile";
import SectionList from "@/components/SectionList";
import { apiPost } from "@/common/api";

export default function GoalDetails() {
  const route = useRoute();
  const { goalId } = route.params as { goalId: string };
  const { companionProfile, updateCompanionProfile, apiPostAI } =
    useUserProfile();
  const goal = companionProfile.goals.find((goal) => goal.id === goalId);

  const [isAddingReality, setIsAddingReality] = useState(false);

  const handleAddReality = () => {
    Alert.prompt(
      t("learn.goalDetails.realities.addRealityTitle"),
      t("learn.goalDetails.realities.addRealityPrompt"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.add"),
          onPress: async (text) => {
            if (text) {
              try {
                setIsAddingReality(true);
                const newReality = await apiPostAI(
                  `/companion/goal/${goalId}/realities`,
                  [],
                  { reality: text }
                );
                updateCompanionProfile((p) => {
                  p.goals
                    .find((g) => g.id === goalId)
                    ?.realities.push(newReality);
                });
              } finally {
                setIsAddingReality(false);
              }
            }
          },
        },
      ],
      "plain-text"
    );
  };

  const handleRemoveReality = (realityId: string) => {
    const realityToRemove = goal?.realities.find((r) => r.id === realityId);
    if (!realityToRemove) return;

    Alert.alert(
      realityToRemove.reality,
      t("learn.goalDetails.realities.removeReality"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.remove"),
          onPress: async () => {
            try {
              const newRealities = goal!.realities.filter(
                (r) => r.id !== realityId
              );
              await apiPost(`/companion/goal/${goalId}/realities`, {
                newRealities,
              });
              updateCompanionProfile((p) => {
                p.goals.find((g) => g.id === goalId)!.realities = newRealities;
              });
            } catch (error) {
              console.error("Failed to remove reality:", error);
            }
          },
          style: "destructive",
        },
      ]
    );
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
        <Text style={styles.explanationText}>
          {t("learn.goalDetails.explanation")}
        </Text>

        <SectionList
          title={t("learn.goalDetails.realities.title")}
          items={[
            {
              title: isAddingReality
                ? t("learn.goalDetails.realities.addingReality")
                : t("learn.goalDetails.realities.addReality"),
              onPress: isAddingReality ? undefined : handleAddReality,
              disabled: isAddingReality,
              leftIcon: { name: "add", type: "material" },
            },
            ...goal.realities.map((reality) => ({
              title: reality.reality,
              removable: true,
              onRemove: () => handleRemoveReality(reality.id),
            })),
          ]}
          bottomText={t("learn.goalDetails.realities.explanation")}
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
    fontWeight: "bold",
    marginBottom: 20,
    marginHorizontal: 5,
  },
  explanationText: {
    fontSize: 16,
    marginHorizontal: 5,
    marginBottom: 30,
  },
  sectionContainer: {
    marginTop: 0,
    marginBottom: 20,
  },
});

import React from "react";
import { StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { Text } from "@rneui/themed";
import { useRoute } from "@react-navigation/native";
import { t } from "@/i18n";
import { useUserProfile } from "@/common/profile";

export default function GoalDetails() {
  const route = useRoute();
  const { goalId } = route.params as { goalId: string };
  const { companionProfile } = useUserProfile();
  const goal = companionProfile.goals.find((goal) => goal.id === goalId);

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
        {/* Add more content related to the specific goal here */}
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
});

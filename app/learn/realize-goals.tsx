import React from "react";
import { StyleSheet, ScrollView, SafeAreaView } from "react-native";
import { Text } from "@rneui/themed";
import { t } from "@/i18n";
import GoalsSectionList from "./GoalsSectionList";
import UserInsightsSectionList from "./UserInsightsSectionList";
export default function RealizeGoals() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text h1 style={styles.title}>
          {t("learn.realizeGoals.title")}
        </Text>
        <Text style={styles.explanationText}>
          {t("learn.realizeGoals.explanation")}
        </Text>
        <GoalsSectionList parentGoalId={null} />
        <UserInsightsSectionList />
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
  explanationText: {
    fontSize: 16,
    marginHorizontal: 5,
    marginBottom: 30,
  },
  UserInsightsSectionList: {
    marginTop: 30,
  },
});

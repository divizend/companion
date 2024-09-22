import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import { Text } from "@rneui/themed";
import { t } from "@/i18n";
import { useNavigation } from "@react-navigation/native";
import { apiPost } from "@/common/api";
import GoalsManager from "./GoalsManager";

export default function GenerateGoals() {
  const navigation = useNavigation();
  const [confirmingGoals, setConfirmingGoals] = useState<boolean>(false);

  const handleConfirmGoals = async () => {
    setConfirmingGoals(true);
    try {
      await apiPost("/companion/goals-done", {});
      navigation.navigate("RealizeGoals" as never);
    } finally {
      setConfirmingGoals(false);
    }
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
        <GoalsManager
          confirmButtonProps={{
            title: t("learn.goals.confirmGoals"),
            onPress: handleConfirmGoals,
            disabled: confirmingGoals,
            loading: confirmingGoals,
          }}
          allowRedetermine
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
});

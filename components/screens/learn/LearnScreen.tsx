import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { Text } from "@rneui/themed";
import { t } from "@/i18n";
import { useUserProfile } from "@/common/profile";
import { CompanionProfileLearnStep } from "@/common/profile";
import GenerateInsights from "./GenerateInsights";
import StyledButton from "@/components/StyledButton";
import { apiPost } from "@/common/api";

export default function LearnScreen() {
  const { profile, updateCompanionProfile } = useUserProfile();
  const [nextStepLoading, setNextStepLoading] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text h1 style={styles.title}>
          {t("learn.title")}
        </Text>

        {!profile.companionProfile.learnStep ||
        profile.companionProfile.learnStep ===
          CompanionProfileLearnStep.INSIGHTS ? (
          <>
            <GenerateInsights />
            {profile.companionProfile.learnInsights?.length ? (
              <StyledButton
                title={t(`learn.insights.confirmButton`)}
                onPress={async () => {
                  setNextStepLoading(true);
                  await apiPost("/companion/learn/step", {
                    newLearnStep: CompanionProfileLearnStep.GOALS,
                  });
                  updateCompanionProfile({
                    learnStep: CompanionProfileLearnStep.GOALS,
                  });
                  setNextStepLoading(false);
                }}
                containerStyle={styles.confirmButton}
                loading={nextStepLoading}
              />
            ) : null}
          </>
        ) : null}
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
});

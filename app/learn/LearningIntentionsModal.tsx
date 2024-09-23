import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button } from "@rneui/themed";
import { t } from "@/i18n";
import ModalView from "@/components/ModalView";
import { useGoal, useUserProfile } from "@/common/profile";

interface LearningIntentionsModalProps {
  visible: boolean;
  onClose: () => void;
  goalId: string;
}

export default function LearningIntentionsModal({
  visible,
  onClose,
  goalId,
}: LearningIntentionsModalProps) {
  const { apiPostAI, updateCompanionProfile } = useUserProfile();
  const goal = useGoal(goalId);

  return (
    <ModalView
      visible={visible}
      onClose={onClose}
      title={t("learn.goalDetails.learningIntentions.title")}
    >
      <View style={styles.container}>
        <Text style={styles.explanation}>
          {t("learn.goalDetails.learningIntentions.explanation", {
            goal: goal?.description,
          })}
        </Text>
        <Button
          title={t("learn.goalDetails.learningIntentions.add")}
          onPress={async () => {
            await apiPostAI(
              `/companion/goal/${goalId}/suggest-learning-intentions`
            );
          }}
        />
      </View>
    </ModalView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  explanation: {
    marginBottom: 30,
    fontSize: 16,
  },
});

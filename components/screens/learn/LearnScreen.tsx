import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Animated,
  Alert,
} from "react-native";
import { Text, Button, Icon } from "@rneui/themed";
import { t } from "@/i18n";
import StyledButton from "@/components/StyledButton";
import SectionList from "@/components/SectionList";
import CustomDialog from "@/components/CustomDialog";
import { showInputDialog } from "./inputDialog";
import { apiPost, useFetch } from "@/common/api";
import { useQueryClient } from "@tanstack/react-query";

export interface Question {
  category: string;
  question: string;
  isNew?: boolean;
}

export default function LearnScreen() {
  const queryClient = useQueryClient();
  const [questions, setQuestions] = useState<Question[]>(
    t("learn.defaultQuestions") as unknown as Question[]
  );
  const { data: userProfile } = useFetch("userProfile");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [removeInsightDialogVisible, setRemoveInsightDialogVisible] =
    useState(false);
  const [insightToRemoveIndex, setInsightToRemoveIndex] = useState<
    number | null
  >(null);

  const AI_CONTEXT_VIEW = t("learn.aiContext.view", {
    title: t("learn.title"),
    explanation: t("learn.explanationIntro"),
  });
  const AI_CONTEXT_QUESTIONS = t("learn.aiContext.questions", {
    questions: questions.map((q) => q.question).join("\n"),
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [questions]);

  const handleQuestionPress = (question: Question, index: number) => {
    setSelectedQuestion(question);
    setSelectedIndex(index);
    setDialogVisible(true);
  };

  const handleDialogOption = async (option: "answer" | "getSimilar") => {
    if (!selectedQuestion || selectedIndex === null) return;

    if (option === "answer") {
      try {
        const answer = await showInputDialog(selectedQuestion.question);
        const { insight } = await apiPost("/companion/learn/generate-insight", {
          context: [AI_CONTEXT_VIEW],
          question: selectedQuestion.question,
          answer,
        });
        queryClient.setQueryData(["userProfile"], (oldData: any) => ({
          ...oldData,
          companionProfile: {
            ...oldData.companionProfile,
            learnInsights: [...oldData.companionProfile.learnInsights, insight],
          },
        }));
        setDialogVisible(false);
      } catch {
        // Do nothing if the user cancels the input
      }
    } else if (option === "getSimilar") {
      const { newQuestions } = await apiPost(
        "/companion/learn/similar-questions",
        {
          context: [AI_CONTEXT_VIEW, AI_CONTEXT_QUESTIONS],
          question: selectedQuestion.question,
        }
      );

      setQuestions((prevQuestions) => [
        ...prevQuestions
          .slice(0, selectedIndex + 1)
          .map((q) => ({ ...q, isNew: false })),
        ...newQuestions.map((q: Question) => ({ ...q, isNew: true })),
        ...prevQuestions
          .slice(selectedIndex + 1)
          .map((q) => ({ ...q, isNew: false })),
      ]);

      fadeAnim.setValue(0);
      setDialogVisible(false);
    }
  };

  const handleConfirm = () => {
    // TODO: Implement confirmation logic
  };

  const handleDialogCancel = () => {
    setDialogVisible(false);
  };

  const handleRemoveInsight = (index: number) => {
    setInsightToRemoveIndex(index);
    setRemoveInsightDialogVisible(true);
  };

  const handleConfirmRemoveInsight = async () => {
    if (insightToRemoveIndex === null) return;

    const newInsights = userProfile.companionProfile.learnInsights.filter(
      (_: any, i: number) => i !== insightToRemoveIndex
    );

    try {
      await apiPost("/companion/learn/insights", {
        newLearnInsights: newInsights,
      });

      // Update local state
      // Note: You might want to refetch the userProfile here instead
      userProfile.companionProfile.learnInsights = newInsights;
    } catch (error) {
      console.error("Failed to remove insight:", error);
      // Handle error (e.g., show an error message to the user)
    }

    setRemoveInsightDialogVisible(false);
    setInsightToRemoveIndex(null);
  };

  const handleCancelRemoveInsight = () => {
    setRemoveInsightDialogVisible(false);
    setInsightToRemoveIndex(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text h1 style={styles.title}>
          {t("learn.title")}
        </Text>

        <View style={styles.explanationContainer}>
          <Text style={styles.explanationText}>
            {t("learn.explanationIntro")}
          </Text>
        </View>

        <SectionList
          title={t("learn.inspirationTitle")}
          items={questions.map((question, index) => ({
            title: `${question.category}: ${question.question}`,
            onPress: () => handleQuestionPress(question, index),
            containerStyle: question.isNew ? { opacity: fadeAnim } : undefined,
            itemStyle: question.isNew ? styles.newQuestionContainer : undefined,
          }))}
          containerStyle={styles.questionList}
          ItemComponent={Animated.View}
        />

        {userProfile.companionProfile.learnInsights.length > 0 && (
          <>
            <SectionList
              title={t("learn.financialInsightsTitle")}
              items={userProfile.companionProfile.learnInsights.map(
                (insight: string, index: number) => ({
                  title: insight,
                  removable: true,
                  onRemove: () => handleRemoveInsight(index),
                })
              )}
              bottomText={t("learn.insightsBottomText")}
            />

            <StyledButton
              title={t("learn.confirmButton")}
              onPress={handleConfirm}
              containerStyle={styles.confirmButton}
              disabled={userProfile.companionProfile.learnInsights.length === 0}
            />
          </>
        )}

        <CustomDialog
          isVisible={dialogVisible}
          onCancel={handleDialogCancel}
          title={selectedQuestion?.question || ""}
          items={[
            {
              text: t("learn.questionOptions.answer"),
              onPress: () => handleDialogOption("answer"),
            },
            {
              text: t("learn.questionOptions.getSimilar"),
              onPress: () => handleDialogOption("getSimilar"),
            },
          ]}
        />

        <CustomDialog
          isVisible={removeInsightDialogVisible}
          onCancel={handleCancelRemoveInsight}
          title={t("learn.removeInsight.title")}
          items={[
            {
              text: t("common.remove"),
              onPress: handleConfirmRemoveInsight,
              style: "destructive",
            },
          ]}
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
  explanationContainer: {
    marginHorizontal: 5,
    marginBottom: 35,
  },
  explanationText: {
    fontSize: 16,
    marginBottom: 10,
  },
  questionList: {
    marginBottom: 40,
  },
  confirmText: {
    fontSize: 16,
    marginBottom: 20,
  },
  confirmButton: {
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  newQuestionContainer: {
    backgroundColor: "#E6F3FF",
  },
});

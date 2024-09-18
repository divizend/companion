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
import { showInputDialog } from "../../../common/inputDialog";
import { apiPost } from "@/common/api";
import {
  useUserProfile,
  CompanionProfileLearnQuestion,
} from "@/common/profile";

export default function LearnScreen() {
  const { profile, updateCompanionProfile } = useUserProfile();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<
    number | null
  >(null);
  const [removeInsightDialogVisible, setRemoveInsightDialogVisible] =
    useState(false);
  const [insightToRemoveIndex, setInsightToRemoveIndex] = useState<
    number | null
  >(null);

  const defaultQuestions: CompanionProfileLearnQuestion[] = t(
    "learn.defaultQuestions"
  ) as unknown as CompanionProfileLearnQuestion[];
  const displayedQuestions: CompanionProfileLearnQuestion[] =
    (profile.companionProfile?.learnQuestions ?? []).length > 0
      ? profile.companionProfile!.learnQuestions!
      : defaultQuestions;
  const selectedQuestion: CompanionProfileLearnQuestion | null =
    selectedQuestionIndex !== null
      ? displayedQuestions[selectedQuestionIndex]
      : null;

  const displayedInsights: string[] =
    profile.companionProfile?.learnInsights ?? [];

  const AI_CONTEXT_VIEW = t("learn.aiContext.view", {
    title: t("learn.title"),
    explanation: t("learn.explanationIntro"),
  });
  const AI_CONTEXT_QUESTIONS = t("learn.aiContext.questions", {
    questions: displayedQuestions.map((q) => q.question).join("\n"),
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [displayedQuestions]);

  const handleDialogOption = async (
    option: "answer" | "getSimilar",
    setLoading?: (loading: boolean) => void
  ) => {
    if (!selectedQuestion || selectedQuestionIndex === null) return;

    if (option === "answer") {
      try {
        const answer = await showInputDialog(selectedQuestion.question);
        setLoading!(true);
        const { insight } = await apiPost("/companion/learn/generate-insight", {
          context: [AI_CONTEXT_VIEW],
          question: selectedQuestion.question,
          answer,
        });
        updateCompanionProfile((draft: any) => {
          draft.learnInsights.push(insight);
        });
        setDialogVisible(false);
      } catch {
        // Do nothing if the user cancels the input
      }
    } else if (option === "getSimilar") {
      const allQuestions = await apiPost("/companion/learn/similar-questions", {
        context: [AI_CONTEXT_VIEW, AI_CONTEXT_QUESTIONS],
        currentQuestions: displayedQuestions,
        questionIndex: selectedQuestionIndex,
      });

      updateCompanionProfile((draft: any) => {
        draft.learnQuestions = allQuestions;
      });

      fadeAnim.setValue(0);
      setDialogVisible(false);
    }
  };

  const handleConfirm = () => {
    // TODO: Implement confirmation logic
  };

  const handleRemoveInsight = (index: number) => {
    setInsightToRemoveIndex(index);
    setRemoveInsightDialogVisible(true);
  };

  const handleConfirmRemoveInsight = async () => {
    if (insightToRemoveIndex === null) return;

    const filteredInsights = displayedInsights.filter(
      (_: any, i: number) => i !== insightToRemoveIndex
    );

    try {
      await apiPost("/companion/learn/insights", {
        newLearnInsights: filteredInsights,
      });
      updateCompanionProfile((draft: any) => {
        draft.learnInsights = filteredInsights;
      });
    } catch (error) {
      console.error("Failed to remove insight:", error);
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
          items={displayedQuestions.map((question, index) => ({
            title: `${question.category}: ${question.question}`,
            onPress: () => {
              setSelectedQuestionIndex(index);
              setDialogVisible(true);
            },
            containerStyle: question.isNew ? { opacity: fadeAnim } : undefined,
            itemStyle: question.isNew ? styles.newQuestionContainer : undefined,
          }))}
          containerStyle={styles.questionList}
          ItemComponent={Animated.View}
        />

        {displayedInsights.length > 0 && (
          <>
            <SectionList
              title={t("learn.financialInsightsTitle")}
              items={displayedInsights.map(
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
              disabled={displayedInsights.length === 0}
            />
          </>
        )}

        <CustomDialog
          isVisible={dialogVisible}
          onCancel={() => setDialogVisible(false)}
          title={selectedQuestion?.question || ""}
          items={[
            {
              text: t("learn.questionOptions.answer"),
              onPressWithControlledLoading: (setLoading) =>
                handleDialogOption("answer", setLoading),
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

import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, View, Animated } from "react-native";
import { Text } from "@rneui/themed";
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
    "learn.insights.defaultQuestions"
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

  const AI_CONTEXT_VIEW = t("aiContext.view", {
    title: t("learn.insights.title"),
    explanation: t("learn.insights.explanation"),
  });
  const AI_CONTEXT_QUESTIONS = t("learn.insights.aiContext.questions", {
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

      updateCompanionProfile({ learnQuestions: allQuestions });

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
    <>
      <View style={styles.explanationContainer}>
        <Text style={styles.explanationText}>
          {t("learn.insights.explanation")}
        </Text>
      </View>

      <SectionList
        title={t("learn.insights.questionsTitle")}
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
        <SectionList
          title={t("learn.insights.insights.title")}
          items={displayedInsights.map((insight: string, index: number) => ({
            title: insight,
            removable: true,
            onRemove: () => handleRemoveInsight(index),
          }))}
          bottomText={t("learn.insights.insights.bottomText")}
        />
      )}

      <CustomDialog
        isVisible={dialogVisible}
        onCancel={() => setDialogVisible(false)}
        title={selectedQuestion?.question || ""}
        items={[
          {
            text: t("learn.insights.questionOptions.answer"),
            onPressWithControlledLoading: (setLoading) =>
              handleDialogOption("answer", setLoading),
          },
          {
            text: t("learn.insights.questionOptions.getSimilar"),
            onPress: () => handleDialogOption("getSimilar"),
          },
        ]}
      />

      <CustomDialog
        isVisible={removeInsightDialogVisible}
        onCancel={handleCancelRemoveInsight}
        title={t("learn.insights.removeInsight.title")}
        items={[
          {
            text: t("common.remove"),
            onPress: handleConfirmRemoveInsight,
            style: "destructive",
          },
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
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
  newQuestionContainer: {
    backgroundColor: "#E6F3FF",
  },
});

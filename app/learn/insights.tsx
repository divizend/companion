import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Animated,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Text } from "@rneui/themed";
import uuid from "react-native-uuid";
import { t } from "@/i18n";
import StyledButton from "@/components/StyledButton";
import SectionList from "@/components/SectionList";
import CustomDialog from "@/components/CustomDialog";
import { showInputDialog } from "@/common/inputDialog";
import { apiPost } from "@/common/api";
import {
  useUserProfile,
  CompanionProfileLearnQuestion,
  CompanionProfileLearnInsight,
} from "@/common/profile";
import { useNavigation } from "@react-navigation/native";

export default function GenerateInsights() {
  const navigation = useNavigation();
  const { profile, updateCompanionProfile, apiPostAI } = useUserProfile({
    moduleDescription: t("learn.vision"),
    viewTitle: t("learn.insights.title"),
    viewExplanation: t("learn.insights.explanation"),
  });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null
  );
  const [removeInsightDialogVisible, setRemoveInsightDialogVisible] =
    useState(false);
  const [insightToRemoveId, setInsightToRemoveId] = useState<string | null>(
    null
  );

  const [defaultQuestions] = useState<CompanionProfileLearnQuestion[]>(
    (t("learn.insights.defaultQuestions") as any).map((q: any) => ({
      ...q,
      id: uuid.v4(),
    })) as CompanionProfileLearnQuestion[]
  );
  const displayedQuestions: CompanionProfileLearnQuestion[] =
    (profile.companionProfile?.learnQuestions ?? []).length > 0
      ? profile.companionProfile!.learnQuestions!
      : defaultQuestions;
  const selectedQuestion: CompanionProfileLearnQuestion | null =
    selectedQuestionId !== null
      ? displayedQuestions.find((q) => q.id === selectedQuestionId)!
      : null;

  const displayedInsights: CompanionProfileLearnInsight[] =
    profile.companionProfile?.userInsights ?? [];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [displayedQuestions]);

  const AI_CONTEXT_LOCAL = {
    questions: t("learn.insights.aiContext.displayedQuestions", {
      questions: displayedQuestions.map((q) => q.question).join("\n"),
    }),
  };

  const handleDialogOption = async (
    option: "answer" | "getSimilar",
    setLoading?: (loading: boolean) => void
  ) => {
    if (!selectedQuestion || selectedQuestionId === null) return;

    if (option === "answer") {
      try {
        const answer = await showInputDialog(selectedQuestion.question);
        setLoading!(true);
        const insight = await apiPostAI(
          "/companion/learn/generate-insight",
          [AI_CONTEXT_LOCAL.questions],
          {
            question: selectedQuestion.question,
            answer,
          }
        );
        updateCompanionProfile((p) => {
          p.userInsights?.push(insight);
        });
        setDialogVisible(false);
      } catch {
        // Do nothing if the user cancels the input
      }
    } else if (option === "getSimilar") {
      const allQuestions = await apiPostAI(
        "/companion/learn/similar-questions",
        [AI_CONTEXT_LOCAL.questions],
        {
          currentQuestions: displayedQuestions,
          questionId: selectedQuestionId,
        }
      );

      updateCompanionProfile({ learnQuestions: allQuestions });

      fadeAnim.setValue(0);
      setDialogVisible(false);
    }
  };

  const handleRemoveInsight = (insightId: string) => {
    setInsightToRemoveId(insightId);
    setRemoveInsightDialogVisible(true);
  };

  const handleConfirmRemoveInsight = async () => {
    if (insightToRemoveId === null) return;

    const filteredInsights = displayedInsights.filter(
      (i: CompanionProfileLearnInsight) => i.id !== insightToRemoveId
    );

    try {
      await apiPost("/companion/insights", {
        newUserInsights: filteredInsights,
      });
      updateCompanionProfile({
        userInsights: filteredInsights,
      });
    } catch (error) {
      console.error("Failed to remove insight:", error);
    }

    setRemoveInsightDialogVisible(false);
    setInsightToRemoveId(null);
  };

  const handleCancelRemoveInsight = () => {
    setRemoveInsightDialogVisible(false);
    setInsightToRemoveId(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text h1 style={styles.title}>
          {t("learn.insights.title")}
        </Text>
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationText}>{t("learn.vision")}</Text>
          <Text style={styles.explanationText}>
            {t("learn.insights.explanation")}
          </Text>
          <Text style={styles.explanationText}>
            {t("learn.insights.explanation2")}
          </Text>
        </View>

        <SectionList
          title={t("learn.insights.questionsTitle")}
          items={displayedQuestions.map((question) => ({
            title: `${question.category}: ${question.question}`,
            onPress: () => {
              setSelectedQuestionId(question.id);
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
              title={t("learn.insights.insights.title")}
              items={displayedInsights.map(
                (insight: CompanionProfileLearnInsight) => ({
                  title: insight.insight,
                  removable: true,
                  onRemove: () => handleRemoveInsight(insight.id),
                })
              )}
              bottomText={t("learn.insights.insights.bottomText")}
            />
            <StyledButton
              title={t(`learn.insights.confirmButton`)}
              onPress={() => navigation.navigate("Goals" as never)}
              containerStyle={styles.confirmButton}
            />
          </>
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

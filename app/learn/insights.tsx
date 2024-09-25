import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Animated,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { Text } from "@rneui/themed";
import uuid from "react-native-uuid";
import { t } from "@/i18n";
import StyledButton from "@/components/StyledButton";
import SectionList from "@/components/SectionList";
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
  const [
    similarQuestionsLoadingQuestionId,
    setSimilarQuestionsLoadingQuestionId,
  ] = useState<string | null>(null);
  const [
    generateInsightLoadingQuestionId,
    setGenerateInsightLoadingQuestionId,
  ] = useState<string | null>(null);
  const [removingInsightId, setRemovingInsightId] = useState<string | null>(
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

  const getSimilarQuestions = async (questionId: string) => {
    setSimilarQuestionsLoadingQuestionId(questionId);
    try {
      const allQuestions = await apiPostAI(
        "/companion/learn/similar-questions",
        [AI_CONTEXT_LOCAL.questions],
        {
          currentQuestions: displayedQuestions,
          questionId,
        }
      );
      updateCompanionProfile({ learnQuestions: allQuestions });
    } finally {
      setSimilarQuestionsLoadingQuestionId(null);
      fadeAnim.setValue(0);
    }
  };

  const generateInsight = async (questionId: string) => {
    const question = displayedQuestions.find((q) => q.id === questionId)!;

    const answer = await showInputDialog(question.question);

    if (answer) {
      try {
        setGenerateInsightLoadingQuestionId(questionId);
        const insight = await apiPostAI(
          "/companion/learn/generate-insight",
          [AI_CONTEXT_LOCAL.questions],
          {
            question: question.question,
            answer,
          }
        );
        updateCompanionProfile((p) => {
          p.userInsights.push(insight);
        });
      } finally {
        setGenerateInsightLoadingQuestionId(null);
      }
    }
  };

  const handleRemoveInsight = (insightId: string) => {
    Alert.alert(
      profile.companionProfile?.userInsights.find((i) => i.id === insightId)
        ?.insight!,
      t("learn.insights.removeInsight.message"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.remove"),
          onPress: async () => {
            const filteredInsights =
              profile.companionProfile.userInsights.filter(
                (i: CompanionProfileLearnInsight) => i.id !== insightId
              );
            try {
              setRemovingInsightId(insightId);
              await apiPost("/companion/insights", {
                newUserInsights: filteredInsights,
              });
              updateCompanionProfile({
                userInsights: filteredInsights,
              });
            } finally {
              setRemovingInsightId(null);
            }
          },
          style: "destructive",
        },
      ]
    );
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
            title: `${question.category}: ${question.question}${
              question.id === similarQuestionsLoadingQuestionId ||
              question.id === generateInsightLoadingQuestionId
                ? ` (${t("common.loading")})`
                : ""
            }`,
            onPress: () => {
              Alert.alert(question.question, undefined, [
                {
                  text: t("learn.insights.questionOptions.getSimilar"),
                  onPress: () => getSimilarQuestions(question.id),
                },
                {
                  text: t("learn.insights.questionOptions.answer"),
                  onPress: () => generateInsight(question.id),
                },
                {
                  text: t("common.cancel"),
                  style: "cancel",
                },
              ]);
            },
            disabled:
              question.id === similarQuestionsLoadingQuestionId ||
              question.id === generateInsightLoadingQuestionId,
            containerStyle: question.isNew ? { opacity: fadeAnim } : undefined,
            itemStyle: question.isNew ? styles.newQuestionContainer : undefined,
          }))}
          containerStyle={styles.questionList}
          ItemComponent={Animated.View}
        />

        {profile.companionProfile.userInsights.length > 0 && (
          <>
            <SectionList
              title={t("learn.insights.insights.title")}
              items={profile.companionProfile.userInsights.map(
                (insight: CompanionProfileLearnInsight) => ({
                  title:
                    insight.insight +
                    (removingInsightId === insight.id
                      ? ` (${t("common.removing")})`
                      : ""),
                  disabled: removingInsightId === insight.id,
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

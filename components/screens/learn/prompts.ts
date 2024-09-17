import { t } from "@/i18n";
import { askForStringArray, askForString } from "@/common/ai";
import { Question } from "./LearnScreen";
import {
  applyStringFixes,
  trimPunctuation,
  splitPascalCase,
  capitalize,
} from "@/common/ai";

const CONTEXT = `The user is currently in an app on a screen titled "${t(
  "learn.title"
)}" with the explanation "${t("learn.explanationIntro")}".`;

export async function getSimilarQuestions(
  question: Question,
  questions: Question[]
) {
  const newQuestions = await askForStringArray(
    `${CONTEXT}\n\nThe user sees the following questions:\n${questions
      .map((q) => q.question)
      .join(
        "\n"
      )}\n\nGenerate two new questions that are in a similar semantical dimension like "${
      question.question
    }".`
  );

  const newQuestionsWithCategory: Question[] = [];
  for (const question of newQuestions) {
    const category = await askForString(
      `Summarize the question "${question}" in a single term. Output nothing but that term, without any punctuation, capitalized in the beginning, not in PascalCase.`
    );

    const categoryFixed = applyStringFixes(category, [
      trimPunctuation,
      splitPascalCase,
      capitalize,
    ]);

    newQuestionsWithCategory.push({
      category: categoryFixed,
      question: question,
    });
  }
  return newQuestionsWithCategory;
}

export async function generateInsight(
  question: string,
  answer: string
): Promise<string> {
  const insight = await askForString(
    `${CONTEXT}\n\nThe user has chosen to respond to the following question:\n${question}\n\nThe user answered:\n${answer}\n\nGenerate a clear and concise insight from this that summarizes the user's answer. Output nothing but the insight, without any additional text. Formulate the insight in first person singular.`
  );

  return insight;
}

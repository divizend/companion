import { useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import { useFetch } from "./api";

export type CompanionProfileLearnQuestion = {
  category: string;
  question: string;
  isNew?: boolean;
};

export enum CompanionProfileLearnStep {
  INSIGHTS = "insights",
  GOALS = "goals",
}

export type CompanionProfile = {
  learnQuestions?: CompanionProfileLearnQuestion[];
  learnInsights?: string[];
  learnStep?: CompanionProfileLearnStep;
};

export type UserProfile = {
  email: string;
  companionProfile: CompanionProfile;
  // actually also many other properties, but those are not relevant for now
};

function getEmptyCompanionProfile(): CompanionProfile {
  return {
    learnQuestions: [],
    learnInsights: [],
  };
}

export function useUserProfile() {
  const queryClient = useQueryClient();
  const profile = useFetch("userProfile").data as UserProfile;

  const updateProfile = (fn: (draft: UserProfile) => void) => {
    queryClient.setQueryData(["userProfile"], produce(profile, fn));
  };

  const updateCompanionProfile = (
    fnOrObject: ((draft: CompanionProfile) => void) | Partial<CompanionProfile>
  ) => {
    updateProfile((draft) => {
      if (!draft.companionProfile) {
        draft.companionProfile = getEmptyCompanionProfile();
      }
      if (typeof fnOrObject === "function") {
        draft.companionProfile = produce(draft.companionProfile, fnOrObject);
      } else {
        Object.assign(draft.companionProfile, fnOrObject);
      }
    });
  };

  return {
    profile,
    updateProfile,
    updateCompanionProfile,
  };
}

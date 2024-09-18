import { useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import { useFetch } from "./api";

export type CompanionProfileLearnQuestion = {
  category: string;
  question: string;
  isNew?: boolean;
};

export type CompanionProfileLearnGoal = {
  goal: string;
};

export type CompanionProfileLearnInsight = {
  insight: string;
  goals?: CompanionProfileLearnGoal[];
};

export type CompanionProfile = {
  learnQuestions?: CompanionProfileLearnQuestion[];
  learnInsights?: CompanionProfileLearnInsight[];
};

export type UserProfile = {
  email: string;
  flags?: {
    allowedCompanionAI?: boolean;
  };
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
  const profileRaw = useFetch("userProfile");
  const profile = profileRaw.data as UserProfile;

  const updateProfile = (fn: (draft: UserProfile) => void) => {
    const newProfile = produce(profile, fn);
    queryClient.setQueryData(["userProfile"], newProfile);
    return newProfile;
  };

  const updateCompanionProfile = (
    fnOrObject: ((draft: CompanionProfile) => void) | Partial<CompanionProfile>
  ): CompanionProfile => {
    return updateProfile((draft) => {
      if (!draft.companionProfile) {
        draft.companionProfile = getEmptyCompanionProfile();
      }
      if (typeof fnOrObject === "function") {
        fnOrObject(draft.companionProfile);
      } else {
        Object.assign(draft.companionProfile, fnOrObject);
      }
    }).companionProfile;
  };

  return {
    profile,
    isLoading: profileRaw.isLoading,
    updateProfile,
    updateCompanionProfile,
  };
}

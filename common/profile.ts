import { useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import { useFetch } from "./api";

export type CompanionProfileLearnQuestion = {
  category: string;
  question: string;
  isNew?: boolean;
};

export type CompanionProfile = {
  learnQuestions?: CompanionProfileLearnQuestion[];
  learnInsights?: string[];
};

export type UserProfile = {
  email: string;
  companionProfile?: CompanionProfile;
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

  const updateCompanionProfile = (fn: (draft: CompanionProfile) => void) => {
    updateProfile((draft) => {
      if (!draft.companionProfile) {
        draft.companionProfile = getEmptyCompanionProfile();
      }
      draft.companionProfile = produce(draft.companionProfile, fn);
    });
  };

  return {
    profile,
    updateProfile,
    updateCompanionProfile,
  };
}

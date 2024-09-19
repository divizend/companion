import { useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import { useFetch } from "./api";

export type CompanionProfileLearnQuestion = {
  id: string;
  category: string;
  question: string;
  isNew?: boolean;
};

export type CompanionProfileLearnGoal = {
  id: string;
  goal: string;
};

export type CompanionProfileLearnInsight = {
  id: string;
  insight: string;
  goals: CompanionProfileLearnGoal[];
};

export type CompanionProfile = {
  learnQuestions?: CompanionProfileLearnQuestion[];
  learnInsights?: CompanionProfileLearnInsight[];
};

export type LegalEntity = {
  id: string;
  isPrincipal: boolean;
  data: {
    info: {
      nationality: string;
    };
  };
};

export type UserProfile = {
  email: string;
  legalEntities: LegalEntity[];
  flags: {
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

export function usePrincipalLegalEntity() {
  const { profile } = useUserProfile();
  return profile.legalEntities.find((entity) => entity.isPrincipal);
}

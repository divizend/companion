import { useQueryClient } from "@tanstack/react-query";
import { produce } from "immer";
import { useFetch, apiPost } from "./api";
import { t } from "@/i18n";

export type CompanionProfileLearnQuestion = {
  id: string;
  category: string;
  question: string;
  isNew?: boolean;
};

export type CompanionProfileLearnInsight = {
  id: string;
  insight: string;
};

export type CompanionProfileGoalReality = {
  id: string;
  reality: string;
};

export type CompanionProfileGoal = {
  id: string;
  description: string;
  realities: CompanionProfileGoalReality[];
  parentGoalId: string | null;
};

export type CompanionProfile = {
  learnQuestions: CompanionProfileLearnQuestion[];
  userInsights: CompanionProfileLearnInsight[];
  goals: CompanionProfileGoal[];
  goalSetupDone: boolean;
};

export type LegalEntity = {
  id: string;
  isPrincipal: boolean;
  data: {
    info: {
      givenName: string;
      surname: string;
      birthday?: string; // ISO format
      nationality?: string;
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
    userInsights: [],
    goals: [],
    goalSetupDone: false,
  };
}

export interface AIContextView {
  moduleDescription: string;
  viewTitle: string;
  viewExplanation: string;
}

// can later also be used for product announcements etc., i.e. the announcement will not only happen
// in a centralized way (e.g. with email newsletters or so), but also as a context for the AI which
// is used in all chats, goal definitions etc., so that users for whom it's actually relevant will
// simply "stumble" over it in a fully personalized way
export function getGlobalAIContext(profile: UserProfile): string[] {
  const principalLegalEntity = getPrincipalLegalEntity(profile);

  // Calculate user's current age
  let age = 0;
  if (principalLegalEntity?.data.info.birthday) {
    const birthDate = new Date(principalLegalEntity.data.info.birthday);
    const today = new Date();
    age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  }

  const userContext = t("aiContext.user", {
    country: t("country." + principalLegalEntity?.data.info.nationality),
    age,
  });

  return [t("aiContext.app"), userContext];
}

export function useUserProfile(aiContextView?: AIContextView) {
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

  const updatePrincipalLegalEntity = (fn: (draft: LegalEntity) => void) => {
    updateProfile((draft) => {
      const principalEntity = draft.legalEntities.find(
        (entity) => entity.isPrincipal
      );
      if (principalEntity) {
        fn(principalEntity);
      }
    });
  };

  const aiContextGlobal = getGlobalAIContext(profile);

  const apiPostAI = (path: string, aiContextLocal?: string[], body?: any) => {
    return apiPost(path, {
      ...body,
      context: [
        ...aiContextGlobal,
        aiContextView ? t("aiContext.view", aiContextView) : undefined,
        ...(aiContextLocal ?? []),
      ].filter((x) => x),
    });
  };

  return {
    profile,
    companionProfile: profile.companionProfile,
    isLoading: profileRaw.isLoading,
    updateProfile,
    updateCompanionProfile,
    updatePrincipalLegalEntity,
    aiContextGlobal,
    apiPostAI,
  };
}

export function getPrincipalLegalEntity(
  profile: UserProfile
): LegalEntity | undefined {
  return profile.legalEntities.find((entity) => entity.isPrincipal);
}

export function getGoal(
  profile: UserProfile,
  goalId: string
): CompanionProfileGoal | undefined {
  return profile.companionProfile.goals.find((goal) => goal.id === goalId);
}

export function usePrincipalLegalEntity() {
  const { profile } = useUserProfile();
  return getPrincipalLegalEntity(profile);
}

export function useGoal(goalId: string) {
  const { profile } = useUserProfile();
  return getGoal(profile, goalId);
}

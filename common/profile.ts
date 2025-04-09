import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import i18next from 'i18next';
import { produce } from 'immer';
import RNRestart from 'react-native-restart';

import { UserProfileDepot } from '@/types/depot.types';

import { apiGet } from './api';
import { useUserProfileQuery } from './queries';
import { setSessionToken } from './sessionToken';

export type CompanionProfileLearnQuestion = {
  id: string;
  category: string;
  question: string;
  isNew?: boolean;
};

export type CompanionProfileUserInsight = {
  id: string;
  insight: string;
};

export type CompanionProfileGoalReality = {
  id: string;
  reality: string;
};

export type CompanionProfileGoalLearningIntention = {
  id: string;
  question: string;
  summary: string;
  emoji: string;
};

export type CompanionProfileGoal = {
  id: string;
  description: string;
  emoji: string;
  realities: CompanionProfileGoalReality[];
  parentGoalId: string | null;
  learningIntentions: CompanionProfileGoalLearningIntention[];
};

export type CompanionProfile = {
  learnQuestions: CompanionProfileLearnQuestion[];
  userInsights: CompanionProfileUserInsight[];
  goals: CompanionProfileGoal[];
  goalSetupDone: boolean;
};

export type LegalEntity = {
  id: string;
  isPrincipal: boolean;
  isActive: boolean;
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
  id: string;
  email: string;
  legalEntities: LegalEntity[];
  flags: {
    language: string;
    canImpersonateUsers?: boolean;
    canModifyOwnInternalFlags?: boolean;
    allowedCompanionAI?: boolean;
    usedCompanionTrial?: boolean;
    canAccessCompanionFeaturesWithoutSubscription?: boolean;
    canAccessDemoBanks?: boolean;
    useLocalSecapi?: boolean;
    currency?: string;
  };
  impersonation?: {
    fromEmail: string;
    fromUserIdentityId: string;
    flags: {
      canModifyImpersonatedInternalFlags?: boolean;
    };
  };
  companionProfile: CompanionProfile;
  depots: UserProfileDepot[];
  // actually also many other properties, but those are not relevant for now
};

export function getEmptyCompanionProfile(): CompanionProfile {
  return {
    learnQuestions: [],
    userInsights: [],
    goals: [],
    goalSetupDone: false,
  };
}

export function useUserProfile() {
  const queryClient = useQueryClient();
  const profileRaw = useUserProfileQuery();
  const profile = profileRaw.data!;

  useEffect(() => {
    if (profile.flags.language?.split('-')?.[0]) i18next.changeLanguage(profile.flags.language.split('-')[0]);
  }, [profile.flags.language?.split('-')?.[0]]);

  const updateProfile = (fn: (draft: UserProfile) => void) => {
    const newProfile = produce(profile, fn);
    queryClient.setQueryData(['userProfile'], newProfile);
    return newProfile;
  };

  const updateCompanionProfile = (
    fnOrObject: ((draft: CompanionProfile) => void) | Partial<CompanionProfile>,
  ): CompanionProfile => {
    return updateProfile(draft => {
      if (!draft.companionProfile) {
        draft.companionProfile = getEmptyCompanionProfile();
      }
      if (typeof fnOrObject === 'function') {
        fnOrObject(draft.companionProfile);
      } else {
        Object.assign(draft.companionProfile, fnOrObject);
      }
    }).companionProfile;
  };

  const updatePrincipalLegalEntity = (fn: (draft: LegalEntity) => void) => {
    updateProfile(draft => {
      const principalEntity = draft.legalEntities.find(entity => entity.isPrincipal);
      if (principalEntity) {
        fn(principalEntity);
      }
    });
  };

  const isPrivileged =
    profile.flags.canImpersonateUsers ||
    profile.flags.canModifyOwnInternalFlags ||
    profile.impersonation?.flags.canModifyImpersonatedInternalFlags;

  return {
    profile,
    companionProfile: profile.companionProfile,
    isLoading: profileRaw.isLoading,
    updateProfile,
    updateCompanionProfile,
    updatePrincipalLegalEntity,
    isPrivileged,
    refetch: profileRaw.refetch,
  };
}

export async function impersonateUser(userIdentityId: string) {
  const { publicTokenGetterCode } = await apiGet(`/auth/impersonate`, {
    userIdentityId,
  });
  const { sessionToken } = await apiGet('/auth/sessionToken/' + publicTokenGetterCode);
  await setSessionToken(sessionToken);
  RNRestart.restart();
}

export function getPrincipalLegalEntity(profile: UserProfile): LegalEntity | undefined {
  return profile.legalEntities.find(entity => entity.isPrincipal);
}

export function getGoal(profile: UserProfile, goalId: string): CompanionProfileGoal | undefined {
  return profile.companionProfile.goals.find(goal => goal.id === goalId);
}

export function getLearningIntention(
  profile: UserProfile,
  goalId: string,
  learningIntentionId: string,
): CompanionProfileGoalLearningIntention | undefined {
  return getGoal(profile, goalId)?.learningIntentions.find(intention => intention.id === learningIntentionId);
}

export function usePrincipalLegalEntity() {
  const { profile } = useUserProfile();
  return getPrincipalLegalEntity(profile);
}

export function useGoal(goalId: string) {
  const { profile } = useUserProfile();
  return getGoal(profile, goalId);
}

export function useLearningIntention(goalId: string, learningIntentionId: string) {
  const { profile } = useUserProfile();
  return getLearningIntention(profile, goalId, learningIntentionId);
}

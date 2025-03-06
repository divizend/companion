import { apiGet } from '@/common/api';
import { useUserProfile } from '@/common/profile';
import { ActorService } from '@/services/actor.service';
import { SecurityAccount } from '@/types/secapi.types';

import { ActorState, LoadingState, actor } from '../actor';

export const setActorLoadingState = (loadingState: LoadingState) => {
  actor.value = { ...actor.value, loadingState };
};

export const loadDepotSuccess = (data: ActorState['depot']) => {
  actor.value = { ...actor.value, depot: data };
};

export const loadDepotReset = () => {
  const { depot, ...rest } = actor.value;
  actor.value = rest;
};

export const setDepotIds = (depotIds: string[] | 'all') => {
  actor.value = { ...actor.value, depotIds };
};

export const loadDepot = async (depotIds: string[] | undefined, signal: AbortSignal) => {
  const endpoint = depotIds ? `/actor/depot?ids=${depotIds.join(',')}` : '/actor/depot';
  return apiGet(endpoint, undefined, { signal })
    .then(response => {
      loadDepotSuccess(response);
    })
    .catch(error => {
      if (error?.includes('CanceledError')) return;
      throw error;
    });
};

export const initializeActor = async (depot: SecurityAccount & { currency?: string }) => {
  return ActorService.initializeRequest(depot).then(res => {
    if (!res.success) {
      throw new Error('Unable to initialize actor');
    }
    return res;
  });
};

export const easyInitializeActor = () => {
  const depot = actor.value.depot;
  const currency = useUserProfile().profile?.flags.currency;
  if (!depot) return;
  return initializeActor({ ...depot, currency });
};

export const handleActorInitializationRequired = (error: string) => {
  if (error === 'actor-initialization-required') {
    easyInitializeActor();
  } else {
    throw error;
  }
};

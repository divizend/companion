import { apiGet, apiPatch } from '@/common/api';
import { ActorService } from '@/services/actor.service';
import { ActorSettings } from '@/types/actor-api.types';
import { SecurityAccount } from '@/types/secapi.types';

import { ActorState, LoadingState, actor, initialState } from '../actor';

export const resetActorState = () => {
  actor.value = initialState;
};

export const setActorLoadingState = (loadingState: LoadingState) => {
  actor.value = { ...actor.value, loadingState };
};

export const loadDepotSuccess = (data: ActorState['depot']) => {
  actor.value = { ...actor.value, depot: data };

  return data;
};

export const loadDepotReset = () => {
  const { depot, ...rest } = actor.value;
  actor.value = rest;
};

export const setDepotIds = (depotIds: string[] | 'all') => {
  actor.value = { ...actor.value, depotIds };
};

const getActorSettingsSuccess = (settings: ActorSettings) => {
  actor.value = { ...actor.value, settings };
  return settings;
};

export const getActorSettings = async () => {
  return apiGet<ActorSettings>('/actor/settings')
    .then(getActorSettingsSuccess)
    .catch(error => {
      if (error?.includes('CanceledError')) return null;
      throw error;
    });
};

export const updateActorSettings = async (settings: Partial<ActorSettings>) => {
  return apiPatch<ActorSettings>('/actor/settings', { method: 'POST', body: JSON.stringify(settings) })
    .then(() => {
      actor.value = { ...actor.value, settings: { ...actor.value.settings!, ...settings } };
      return actor.value.settings;
    })
    .catch(error => {
      if (error?.includes('CanceledError')) return null;
      throw error;
    });
};

export const loadDepot = async (
  depotIds: string[] | undefined,
  signal?: AbortSignal,
): Promise<ActorState['depot'] | null> => {
  const endpoint = depotIds ? `/actor/depot?ids=${depotIds.join(',')}` : '/actor/depot';
  return apiGet(endpoint, undefined, { signal }).catch(error => {
    if (error?.includes('CanceledError')) return null;
    throw error;
  });
};

export const initializeActor = async (depot: SecurityAccount & { currency?: string }) => {
  return ActorService.initializeRequest(depot).then(res => {
    if (!res.success) {
      throw new Error('Unable to initialize actor');
    }
    actor.value = { ...actor.value, lastInitialized: Date.now() };
    return res;
  });
};

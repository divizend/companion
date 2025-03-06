import { signal } from '@preact/signals-react';

import { ActorSettings } from '@/types/actor-api.types';
import { SecurityAccount } from '@/types/secapi.types';

export interface CurrencyAmount {
  amount: number;
  unit?: string;
}

export enum LoadingState {
  AWAITING = 'AWAITING',
  AGGREGATING = 'AGGREGATING',
  INITIALIZING = 'INITIALIZING',
  LOADING_WIDGETS = 'LOADING_WIDGETS',
  READY = 'READY',
}

export type ActorState = {
  depotIds: string[] | 'all';
  depot?: SecurityAccount & {
    totalRefundableAmount?: {
      amount: number;
      unit: string;
    };
    sortedTotalRefundableAmountByCountry?: {
      [country: string]: { totalRefundableAmount?: CurrencyAmount; totalRefundableAmountConverted?: CurrencyAmount };
    };
  };
  settings?: ActorSettings;
  loadingState: LoadingState;
};

export const initialState: ActorState = {
  depotIds: 'all',
  loadingState: LoadingState.AWAITING,
};

export const actor = signal<ActorState>(initialState);

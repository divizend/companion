import { signal } from '@preact/signals-react';

import { SecAPIAuthenticationSuccessfulMessage } from '@/components/features/portfolio-import/SecapiImport';

export const Step = {
  SecapiImportFrame: 0,
  BankDetails: 1,
  DepotLoading: 2,
  ChooseDepots: 3,
  PortfolioContents: 4,
  Finalize: 5,
  ChooseDepotToSync: 6,
};

type PortfolioConnect = {
  restartImport?: boolean;
  currentStep: (typeof Step)[keyof typeof Step];
  manualImport: {
    chosen: boolean;
    bank: { parent?: string; name?: string };
    depotNumber: string | null;
  };
  bank: {
    parent?: string;
    name?: string;
    bic?: string;
  };
  portfolioContents: { accounts?: any[]; keys?: string[] };
  secapiImport: {
    successMessage?: SecAPIAuthenticationSuccessfulMessage | null;
    id?: string | null;
    progressRequestTimestamp?: number | null;
    error?: string | null;
    progress: number;
    loading?: boolean;
    accounts: any[];
  };
  importDepots: { chosenDepotIds: string[]; loading: boolean };
  importedSomething: boolean;
  importedDepotDone?: boolean;
  importedDepotEmpty?: boolean;
  depotImportSessionId?: string | null;
  secapiAuthenticationFailedMessage?: string;
  depotNumberToSync?: string;
  importedSuccessData?: any;
};

export const portfolioConnect = signal<PortfolioConnect>({
  manualImport: {
    chosen: false,
    bank: {},
    depotNumber: null,
  },
  bank: {},
  portfolioContents: {},
  secapiImport: {
    successMessage: null,
    id: null,
    progressRequestTimestamp: null,
    progress: 0.0,
    error: null,
    accounts: [],
  },
  importDepots: {
    loading: false,
    chosenDepotIds: [],
  },
  importedSomething: false,
  currentStep: Step.SecapiImportFrame,
  restartImport: false,
  depotImportSessionId: null,
});

import { signal } from '@preact/signals-react';

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
  restartImport: boolean;
  currentStep: (typeof Step)[keyof typeof Step] | null;
  manualImport?: {
    chosen: boolean;
    bank: { parent: string; name: string };
    depotNumber: string;
  };
  bank?: {
    parent: string;
    name: string;
    bic: string;
  };
  portfolioContents: { accounts: any[] };
  secapiImport: {
    id: null | string;
    successMessage: string;
    error: string;
    progress: number;
    progressRequestTimestamp: number | null;
    loading: boolean;
    accounts: any[];
  };
  importDepots: { chosenDepotIds: string[]; loading: boolean };
  importedSomething: boolean;
  importedDepotDone?: boolean;
  importedDepotEmpty?: boolean;
  depotImportSessionId: null | string;
  secapiAuthenticationFailedMessage?: string;
  depotNumberToSync?: null | string;
  importedSuccessData?: any;
};

export const portfolioConnect = signal<PortfolioConnect>({
  restartImport: false,
  currentStep: Step.SecapiImportFrame,
  manualImport: {
    chosen: false,
    bank: {
      parent: '',
      name: '',
    },
    depotNumber: '',
  },
  bank: {
    parent: '',
    name: '',
    bic: '',
  },
  portfolioContents: {
    accounts: [
      { id: '1', description: 'Customer 1', depotNumber: '12345' },
      { id: '2', description: 'Customer 2', depotNumber: '67890' },
    ],
  },
  secapiImport: {
    id: null,
    successMessage: '',
    error: '',
    progress: 0,
    progressRequestTimestamp: null,
    loading: false,
    accounts: [],
  },
  importDepots: { chosenDepotIds: [], loading: false },
  importedSomething: false,
  depotImportSessionId: null,
});

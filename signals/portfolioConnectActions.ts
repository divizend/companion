import { Step, portfolioConnect } from './portfolioConnect';

const getInitialState = () => ({
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

export const reset = () => {
  portfolioConnect.value = getInitialState();
};

export const resetPortfolioConnect = () => {
  portfolioConnect.value = {
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
  };
};

export const setCurrentStep = (step: any) => {
  portfolioConnect.value = { ...portfolioConnect.value, currentStep: step };
};

export const chooseManualImport = (message: any) => {
  portfolioConnect.value = {
    ...portfolioConnect.value,
    manualImport: {
      chosen: true,
      bank: { ...message.bank, parent: message.bank.parent === 'XX_UNKNOWN' ? '' : message.bank.parent },
      depotNumber: message.depotNumber || '', // Default to an empty string or whatever you want
    },
    currentStep: Step.BankDetails,
  };
};

export const bankDepotDetailsSetField = (fieldName: any, value: any) => {
  const updatedState = { ...portfolioConnect.value };
  if (fieldName === 'parent') updatedState.manualImport.bank.parent = value;
  else if (fieldName === 'bankName') updatedState.manualImport.bank.name = value;
  else if (fieldName === 'depotNumber') updatedState.manualImport.depotNumber = value;
  portfolioConnect.value = updatedState;
};

export const chooseDepotsSubmit = () => {
  portfolioConnect.value = {
    ...portfolioConnect.value,
    currentStep: Step.PortfolioContents,
  };
};

export const restartImport = () => {
  portfolioConnect.value = {
    ...portfolioConnect.value,
    restartImport: true,
  };
};

export const chooseDepot = ({ depotId, checked, oneOnly }: { depotId: string; checked: boolean; oneOnly: boolean }) => {
  const chosenDepots = portfolioConnect.value.importDepots.chosenDepotIds;

  if (oneOnly) {
    // If only one depot can be selected, replace the chosen depots with the current depotId
    portfolioConnect.value = {
      ...portfolioConnect.value,
      importDepots: {
        ...portfolioConnect.value.importDepots,
        chosenDepotIds: [depotId],
      },
    };
    return;
  }

  // If checked is true and the depotId is not already in the list, add it to chosenDepotIds
  if (checked && !chosenDepots.includes(depotId)) {
    portfolioConnect.value = {
      ...portfolioConnect.value,
      importDepots: {
        ...portfolioConnect.value.importDepots,
        chosenDepotIds: [...chosenDepots, depotId],
      },
    };
  } else if (!checked) {
    // If unchecked, remove depotId from the list of chosen depots
    portfolioConnect.value = {
      ...portfolioConnect.value,
      importDepots: {
        ...portfolioConnect.value.importDepots,
        chosenDepotIds: chosenDepots.filter(d => d !== depotId),
      },
    };
  }
};

export const createDepotImportSessionSuccess = (sessionId: string) => {
  portfolioConnect.value = {
    ...portfolioConnect.value,
    depotImportSessionId: sessionId,
  };
};

export const resetDepotImportSessionId = () => {
  portfolioConnect.value = {
    ...portfolioConnect.value,
    depotImportSessionId: null,
  };
};

export const setSecapiImportProgressRequestTimestamp = (date: number) => {
  portfolioConnect.value = {
    ...portfolioConnect.value,
    secapiImport: {
      ...portfolioConnect.value.secapiImport,
      progressRequestTimestamp: date,
    },
  };
};

export const getSecapiImportProgressSuccess = ({ res, requestTimestamp }: any) => {
  if (portfolioConnect.value.secapiImport.progressRequestTimestamp !== requestTimestamp) return;

  portfolioConnect.value = {
    ...portfolioConnect.value,
    secapiImport: {
      ...portfolioConnect.value.secapiImport,
      progress: res.progress,
      error: res.error,
      accounts: res.progress >= 1.0 && res.accounts ? res.accounts : [],
    },
    depotNumberToSync:
      !portfolioConnect.value.depotNumberToSync && res.depotNumberToSync ? res.depotNumberToSync : undefined,
  };

  delete portfolioConnect.value.secapiImport.progressRequestTimestamp;
};

export const getSecapiImportProgressLoading = (loading: boolean) => {
  portfolioConnect.value = {
    ...portfolioConnect.value,
    secapiImport: {
      ...portfolioConnect.value.secapiImport,
      loading,
    },
  };
};

export const getSecapiImportProgressFailure = ({ error, requestTimestamp }: any) => {
  if (portfolioConnect.value.secapiImport.progressRequestTimestamp !== requestTimestamp) return;

  portfolioConnect.value = {
    ...portfolioConnect.value,
    secapiImport: {
      ...portfolioConnect.value.secapiImport,
      error,
    },
  };

  delete portfolioConnect.value.secapiImport.progressRequestTimestamp;
};

export const startSecapiImportSuccess = (data: any) => {
  portfolioConnect.value = {
    ...portfolioConnect.value,
    secapiImport: {
      ...portfolioConnect.value.secapiImport,
      id: data.secapiImportId,
    },
    currentStep: Step.DepotLoading,
    depotNumberToSync: data.depotNumberToSync,
  };
};

export const startSecapiImportFailure = (error: any) => {
  portfolioConnect.value = {
    ...portfolioConnect.value,
    secapiImport: {
      ...portfolioConnect.value.secapiImport,
      id: null,
      error,
    },
  };
};

export const setSecapiImportSuccessMessage = (message: any) => {
  portfolioConnect.value = {
    ...portfolioConnect.value,
    secapiImport: {
      ...portfolioConnect.value.secapiImport,
      successMessage: message,
    },
    bank: {
      parent: message.bank.parent,
      bic: message.bank.bic,
      name: message.bank.name,
    },
  };
};

export const setPortfolioContents = () => {
  const accounts = portfolioConnect.value.secapiImport.accounts;
  portfolioConnect.value = {
    ...portfolioConnect.value,
    secapiImport: {
      ...portfolioConnect.value.secapiImport,
      accounts: [],
    },
    portfolioContents: {
      ...portfolioConnect.value.portfolioContents,
      accounts,
    },
  };

  if (portfolioConnect.value.depotNumberToSync) {
    const account = accounts.find(acc => acc.depotNumber === portfolioConnect.value.depotNumberToSync);
    if (account) {
      portfolioConnect.value = {
        ...portfolioConnect.value,
        importDepots: {
          ...portfolioConnect.value.importDepots,
          chosenDepotIds: [account.id],
        },
        currentStep: Step.PortfolioContents,
      };
    } else {
      portfolioConnect.value = {
        ...portfolioConnect.value,
        currentStep: Step.ChooseDepotToSync,
      };
    }
  } else if (accounts.length === 1) {
    portfolioConnect.value = {
      ...portfolioConnect.value,
      importDepots: {
        ...portfolioConnect.value.importDepots,
        chosenDepotIds: [accounts[0].id],
      },
      currentStep: Step.PortfolioContents,
    };
  } else if (
    portfolioConnect.value.currentStep !== Step.PortfolioContents &&
    portfolioConnect.value.currentStep !== Step.Finalize &&
    accounts.length > 1
  ) {
    portfolioConnect.value = {
      ...portfolioConnect.value,
      currentStep: Step.ChooseDepots,
    };
  }
};

export const setSecapiAuthenticationFailedMessage = (message: any) => {
  portfolioConnect.value = {
    ...portfolioConnect.value,
    secapiAuthenticationFailedMessage: message ?? 'An error has occured.',
  };
};

export const portfolioContentsImportDepotsSetLoading = (loading: boolean) => {
  portfolioConnect.value = {
    ...portfolioConnect.value,
    importDepots: {
      ...portfolioConnect.value.importDepots,
      loading,
    },
  };
};

export const finalizeImport = ({ done, empty, data }: any) => {
  portfolioConnect.value = {
    ...portfolioConnect.value,
    importedDepotDone: done,
    importedDepotEmpty: empty,
    currentStep: Step.Finalize,
    importedSomething: true,
    importedSuccessData: data,
  };
};

export const importedSomething = () => {
  portfolioConnect.value = { ...portfolioConnect.value, importedSomething: true };
};

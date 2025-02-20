import { apiGet, apiPatch, apiPostJson } from '@/common/api';
import { generateTransientId } from '@/utils/uuid';

import { Step, portfolioConnect } from '../portfolio-connect';

// Initial State
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

// Reset Functions
export const resetPortfolioConnect = () => {
  portfolioConnect.value = getInitialState();
};

export const resetDepotImportSessionId = () => {
  portfolioConnect.value = {
    ...portfolioConnect.value,
    depotImportSessionId: null,
  };
};

// Step Management
export const setCurrentStep = (step: any) => {
  portfolioConnect.value = { ...portfolioConnect.value, currentStep: step };
};

export const restartImport = () => {
  portfolioConnect.value = {
    ...portfolioConnect.value,
    restartImport: true,
  };
};

// Manual Import
export const chooseManualImport = (message: any) => {
  portfolioConnect.value = {
    ...portfolioConnect.value,
    manualImport: {
      chosen: true,
      bank: { ...message.bank, parent: message.bank.parent === 'XX_UNKNOWN' ? '' : message.bank.parent },
      depotNumber: message.depotNumber || '',
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

export const bankDepotDetailsSubmit = () => {
  portfolioConnect.value = {
    ...portfolioConnect.value,
    bank: portfolioConnect.value.manualImport.bank,
    secapiImport: {
      ...portfolioConnect.value.secapiImport,
      accounts: [
        ...(portfolioConnect.value.secapiImport.accounts || []),
        {
          id: generateTransientId(),
          depotNumber: portfolioConnect.value.manualImport.depotNumber,
          securities: {},
          profile: {},
        },
      ],
    },
    importDepots: {
      ...portfolioConnect.value.importDepots,
      chosenDepotIds: [generateTransientId()],
    },
    currentStep: Step.PortfolioContents,
  };
};

// Depot Selection
export const chooseDepot = ({ depotId, checked, oneOnly }: { depotId: string; checked: boolean; oneOnly: boolean }) => {
  const chosenDepots = portfolioConnect.value.importDepots.chosenDepotIds;

  if (oneOnly) {
    portfolioConnect.value = {
      ...portfolioConnect.value,
      importDepots: {
        ...portfolioConnect.value.importDepots,
        chosenDepotIds: [depotId],
      },
    };
    return;
  }

  if (checked && !chosenDepots.includes(depotId)) {
    portfolioConnect.value = {
      ...portfolioConnect.value,
      importDepots: {
        ...portfolioConnect.value.importDepots,
        chosenDepotIds: [...chosenDepots, depotId],
      },
    };
  } else if (!checked) {
    portfolioConnect.value = {
      ...portfolioConnect.value,
      importDepots: {
        ...portfolioConnect.value.importDepots,
        chosenDepotIds: chosenDepots.filter(d => d !== depotId),
      },
    };
  }
};

export const chooseDepotsSubmit = () => {
  portfolioConnect.value = {
    ...portfolioConnect.value,
    currentStep: Step.PortfolioContents,
  };
};

// Secapi Import
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

export const setSecapiAuthenticationFailedMessage = (message: any) => {
  portfolioConnect.value = {
    ...portfolioConnect.value,
    secapiAuthenticationFailedMessage: message ?? 'An error has occured.',
  };
};

export const createDepotImportSessionSuccess = (sessionId: string) => {
  portfolioConnect.value = {
    ...portfolioConnect.value,
    depotImportSessionId: sessionId,
  };
};

// Portfolio Contents
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

// Requests
export async function portfolioContentsImportConnectDepots({
  multiAccountImport,
  ownerEntityId,
}: {
  multiAccountImport?: string;
  ownerEntityId: string;
}) {
  const chosenAccountIds = portfolioConnect.value.importDepots.chosenDepotIds;

  const accounts = JSON.parse(
    JSON.stringify(
      portfolioConnect.value.portfolioContents.accounts!.filter(acc => chosenAccountIds?.includes(acc.id)),
    ),
  );

  const secapiImportId = portfolioConnect.value.secapiImport.id;

  const payload = {
    ...(secapiImportId ? { secapiImportId } : {}),
    bankInfo: portfolioConnect.value.bank,
    ownerEntityId,
    accounts: accounts.map((acc: any) => {
      return {
        ...acc,
        depotNumber: portfolioConnect.value.depotNumberToSync ?? acc.depotNumber,
        newDepotNumber: acc.depotNumber,
      };
    }),
    unassignedOrganization: multiAccountImport,
  };

  portfolioContentsImportDepotsSetLoading(true);

  return apiPostJson('/depots/import', payload)
    .then((data: any) => {
      const securities = portfolioConnect.value.portfolioContents?.accounts?.[0]?.securities;
      finalizeImport({
        done: true,
        empty: !securities || Object.keys(securities).length === 0,
        data,
      });
    })
    .catch((error: any) => {
      resetPortfolioConnect();
      throw error;
    })
    .finally(() => {
      portfolioContentsImportDepotsSetLoading(false);
    });
}

export function sendDepotImportEvent(sessionId: string, data: any) {
  return apiPostJson(`/depot-import/${sessionId}/event`, data);
}

export const createDepotImportSession = async ({ depotNumberToSync }: { depotNumberToSync?: string } = {}) => {
  return apiPostJson('/depot-import/session', { depotNumberToSync }).then(createDepotImportSessionSuccess);
};

export const setDepotImportSessionReplayId = (sessionId: string, replayId: string) => {
  return apiPatch(`/depot-import/${sessionId}/replay/${replayId}`, {});
};

export const getSecapiImportProgress = () => {
  const portfolioConnectValue = portfolioConnect.value;
  if (!portfolioConnectValue.secapiImport.id) return;
  if (portfolioConnectValue.portfolioContents?.keys) return;
  if (portfolioConnectValue.secapiImport.loading) return;

  const requestTimestamp = +new Date();
  setSecapiImportProgressRequestTimestamp(requestTimestamp);

  getSecapiImportProgressLoading(true);

  return apiGet('/secapiImport', { secapiImportId: portfolioConnectValue.secapiImport.id })
    .then(res => {
      getSecapiImportProgressSuccess({ res, requestTimestamp });
    })
    .catch(error => {
      getSecapiImportProgressFailure({ error, requestTimestamp });
    })
    .finally(() => {
      getSecapiImportProgressLoading(false);
    });
};

export const watchImportProgress = async (depotNumberToSync?: string) => {
  const portfolioConnectValue = portfolioConnect.value;
  if (portfolioConnectValue.portfolioContents?.keys) return;
  if (portfolioConnectValue.secapiImport?.id) return;

  const message = portfolioConnectValue.secapiImport?.successMessage!;
  await new Promise(r => setTimeout(r, 1000));
  const payload = {
    token: message.token,
    interfaceType: message.interface.type,
    interfaceId: message.interface.id,
    bankId: message.bank.id,
    flags: message.flags,
    depotNumberToSync,
  };
  return apiPostJson('/secapiImport', payload)
    .then(res => {
      startSecapiImportSuccess({
        ...res,
        depotNumberToSync,
      });
    })
    .catch(error => {
      startSecapiImportFailure(error);
    });
};

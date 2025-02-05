import { Step, portfolioConnect } from './portfolioConnect';

export const resetPortfolioConnect = () => {
  portfolioConnect.value = {
    restartImport: false,
    currentStep: null,
    portfolioContents: { accounts: [] },
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
    importedDepotDone: false,
    importedDepotEmpty: false,
    depotImportSessionId: null,
    secapiAuthenticationFailedMessage: '',
    depotNumberToSync: null,
    importedSuccessData: null,
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
  // const updatedState = { ...portfolioConnect.value };
  // if (fieldName === 'parent') updatedState.manualImport.bank.parent = value;
  // else if (fieldName === 'bankName') updatedState.manualImport.bank.name = value;
  // else if (fieldName === 'depotNumber') updatedState.manualImport.depotNumber = value;
  // portfolioConnect.value = updatedState;
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

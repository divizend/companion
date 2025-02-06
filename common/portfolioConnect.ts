import { portfolioConnect } from '@/signals/portfolioConnect';
import {
  createDepotImportSessionSuccess,
  finalizeImport,
  getSecapiImportProgressFailure,
  getSecapiImportProgressLoading,
  getSecapiImportProgressSuccess,
  portfolioContentsImportDepotsSetLoading,
  resetPortfolioConnect,
  setSecapiImportProgressRequestTimestamp,
  startSecapiImportFailure,
  startSecapiImportSuccess,
} from '@/signals/portfolioConnectActions';

import { apiGet, apiPatch, apiPostJson } from './api';

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
      // use snackbar later
      console.error('portfolioContentsImportConnectDepots', error);
      resetPortfolioConnect();
    })
    .finally(() => {
      portfolioContentsImportDepotsSetLoading(false);
    });
}

export function sendDepotImportEvent(sessionId: string, data: any) {
  return apiPostJson(`/depot-import/${sessionId}/event`, data);
}

export const createDepotImportSession = async ({ depotNumberToSync }: { depotNumberToSync?: string } = {}) => {
  return apiPostJson('/depot-import/session', { depotNumberToSync }).then((sessionId: string) => {
    createDepotImportSessionSuccess(sessionId);
  });
};

export const setDepotImportSessionReplayId = (sessionId: string, replayId: string) => {
  return apiPatch(`/depot-import/${sessionId}/replay/${replayId}`, {});
};

export const getSecapiImportProgress = () => {
  const portfolioConnectValue = portfolioConnect.value;
  if (!portfolioConnectValue.secapiImport.id) return; // an import id must exist
  if (portfolioConnectValue.portfolioContents?.keys) return; // do not poll if portfolio contents are not empty
  if (portfolioConnectValue.secapiImport.loading) return; // do not poll if an ongoing request has not yet resolved

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
  if (portfolioConnectValue.portfolioContents?.keys) return; // do not load accounts if portfolio contents are not empty
  if (portfolioConnectValue.secapiImport?.id) return; // an import id already exists

  const message = portfolioConnectValue.secapiImport?.successMessage!;
  // This timeout is for avoiding creating 2 entities since the secapi import is also started from the backend
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

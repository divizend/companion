import { portfolioConnect } from '@/signals/portfolioConnect';

import { usePost } from './api';

export function portfolioContentsImportConnectDepots(multiAccountImport: any) {
  const chosenAccountIds = portfolioConnect.value.importDepots?.chosenDepotIds;
  const accounts = JSON.parse(
    JSON.stringify(
      portfolioConnect.value.portfolioContents?.accounts.filter(acc => chosenAccountIds?.includes(acc.id)),
    ),
  );

  const secapiImportId = portfolioConnect.value.secapiImport?.id;
  const payload = {
    ...(secapiImportId ? { secapiImportId } : {}), // not needed for manual imports
    bankInfo: portfolioConnect.value.bank,
    ownerEntityId: '',
    accounts: accounts.map((acc: any) => ({
      ...acc,
      depotNumber: portfolioConnect.value.depotNumberToSync ?? acc.depotNumber,
      newDepotNumber: acc.depotNumber,
    })),
    unassignedOrganization: multiAccountImport,
  };

  const mutation = usePost('importDepots', '/depots/import');

  return {
    importDepots: () => {
      mutation.mutate(payload, {
        onSuccess: data => {
          const securities = portfolioConnect.value.portfolioContents?.accounts?.[0]?.securities;
          // finalizeImport({
          //   done: portfolioConnectDoneSelector(),
          //   empty: !securities || Object.keys(securities).length === 0,
          //   data,
          // });
        },
        onError: error => {
          // snackbarError('portfolioConnect:portfolioContents.importError', { error });
          // reset();
        },
      });
    },
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

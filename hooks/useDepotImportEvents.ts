import { useCallback, useEffect, useState } from 'react';

import {
  sendDepotImportEvent as _sendDepotImportEvent,
  createDepotImportSession,
  setDepotImportSessionReplayId,
} from '@/signals/actions/portfolio-connect.actions';
import { resetDepotImportSessionId } from '@/signals/actions/portfolio-connect.actions';
import { portfolioConnect as portfolioConnectSignal } from '@/signals/portfolio-connect';
import { DepotImportEventType, DepotImportStep } from '@/types/secapi.types';

type ModalStep = {
  step: DepotImportStep;
  data?: any;
};

type DepotImportEventProps = {
  secapiStep: ModalStep;
  replayId?: string;
  importToken?: string;
  currentBank?: any;
  depotNumberToSync?: string;
  flags?: any;
  type?: number;
  organizationId?: string;
  backgroundSessionId?: string;
};

const DepotImportStepToEvent = {
  [DepotImportStep.COUNTRY]: DepotImportEventType.CONTINUE_INTRO,
  [DepotImportStep.BANK]: DepotImportEventType.SELECT_COUNTRY,
  [DepotImportStep.BANK_BRANCH]: DepotImportEventType.SELECT_BANK,
  [DepotImportStep.INTERFACE]: DepotImportEventType.SELECT_BANK_BRANCH,
  [DepotImportStep.AUTHENTICATE]: DepotImportEventType.SELECT_INTERFACE,
};

const dispatch = <T>(result: T) => result;

export default function useDepotImportEvents({
  secapiStep,
  replayId,
  importToken,
  currentBank,
  depotNumberToSync,
  flags,
  type,
  organizationId,
  backgroundSessionId,
}: DepotImportEventProps) {
  const [lastStep, setLastStep] = useState<ModalStep>();
  const portfolioConnect = portfolioConnectSignal.value;
  const sessionId = portfolioConnect.depotImportSessionId;
  const [sessionIdRecovery, setSessionIdRecovery] = useState<string>();
  const secapiImport = portfolioConnect.secapiImport;
  const importedSuccessData = portfolioConnect.importedSuccessData;
  const portfolioContents = portfolioConnect.portfolioContents;
  const manualImport = portfolioConnect.manualImport;
  const restartImport = portfolioConnect.restartImport;
  const [mostRecentSentEvent, setMostRecentSentEvent] = useState<any>();
  const secapiAuthenticationFailedMessage = portfolioConnect.secapiAuthenticationFailedMessage;

  const sendDepotImportEvent = useCallback(
    (importEvent: any, useRecovery = false) => {
      if ((useRecovery && !sessionIdRecovery) || (!useRecovery && !sessionId)) return;
      if (
        JSON.stringify(importEvent) === JSON.stringify(mostRecentSentEvent?.importEvent) &&
        Date.now() < (mostRecentSentEvent?.expiresAt ?? 0)
      )
        return;
      dispatch(_sendDepotImportEvent(useRecovery ? sessionIdRecovery! : sessionId!, importEvent) as any);
      setMostRecentSentEvent({
        importEvent,
        expiresAt: Date.now() + 250,
      });
    },
    [sessionId, sessionIdRecovery, mostRecentSentEvent],
  );

  useEffect(() => {
    if (sessionId) {
      setSessionIdRecovery(sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    if (lastStep?.step && secapiStep.step < lastStep.step) {
      sendDepotImportEvent({
        type: DepotImportEventType.GO_BACK,
      });
    } else {
      const type = (DepotImportStepToEvent as any)[secapiStep.step];
      if (type)
        sendDepotImportEvent({
          type: type,
          data: secapiStep.data,
        });
    }
    setLastStep(secapiStep);
  }, [secapiStep]);

  useEffect(() => {
    if (!restartImport) {
      // do not create a new ID if background import
      if (backgroundSessionId) return;
      dispatch(
        createDepotImportSession({
          depotNumberToSync,
        }) as any,
      );
    } else {
      sendDepotImportEvent(
        {
          type: DepotImportEventType.CLOSE_IMPORT_MODAL,
        },
        true,
      );
      setSessionIdRecovery(sessionId!);
      setLastStep(undefined);
      dispatch(resetDepotImportSessionId());
    }
  }, [restartImport, depotNumberToSync]);

  useEffect(() => {
    if (manualImport?.chosen) {
      sendDepotImportEvent({
        type: DepotImportEventType.MANUAL_IMPORT,
        data: {
          bank: manualImport.bank,
        },
      });
    }
  }, [manualImport?.chosen]);

  // Used as a "seen" acknowledgement to not show import in background imports
  useEffect(() => {
    if (secapiAuthenticationFailedMessage) {
      sendDepotImportEvent({
        type: DepotImportEventType.AUTHENTICATION_FAILED,
        data: {
          message: secapiAuthenticationFailedMessage,
        },
      });
    }
  }, [secapiAuthenticationFailedMessage]);

  useEffect(() => {
    if (importedSuccessData)
      sendDepotImportEvent({
        type: DepotImportEventType.SUCCESSFUL_IMPORT,
        data: {
          depotIds: importedSuccessData,
          numAvailableDepots: Object.keys(portfolioContents).length,
        },
      });
  }, [importedSuccessData]);

  useEffect(() => {
    const error = secapiImport.error;
    if (error) {
      sendDepotImportEvent({
        type: DepotImportEventType.SECAPI_IMPORT_ERROR,
        data: { error },
      });
    }
  }, [secapiImport.error]);

  useEffect(() => {
    if (replayId && sessionId) {
      dispatch(setDepotImportSessionReplayId(sessionId, replayId) as any);
    }
  }, [replayId, sessionId]);

  useEffect(() => {
    if (importToken && currentBank) {
      sendDepotImportEvent({
        type: DepotImportEventType.IMPORT_STARTED,
        data: {
          importToken,
          parent: currentBank.parent,
          bankName: currentBank.name,
          interfaceType: type,
          interfaceId: currentBank.interfaceId,
          bankId: currentBank.bankId,
          flags,
          depotNumberToSync,
          organizationId,
          ...currentBank,
        },
      });
    }
  }, [importToken, currentBank]);
}

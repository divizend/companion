import React, { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { usedConfig } from '@/common/config';
import { useUserProfile } from '@/common/profile';
import { Text } from '@/components/base';
import { useSnackbar } from '@/components/global/Snackbar';
import useDepotImportEvents from '@/hooks/useDepotImportEvents';
import { useInterval } from '@/hooks/useInterval';
import {
  chooseManualImport,
  createDepotImportSessionSuccess,
  getSecapiImportProgress,
  resetPortfolioConnect,
  setPortfolioContents,
  setSecapiAuthenticationFailedMessage,
  setSecapiImportSuccessMessage,
  startSecapiImportSuccess,
  watchImportProgress,
} from '@/signals/actions/portfolio-connect.actions';
import { Step, portfolioConnect as portfolioConnectSignal } from '@/signals/portfolio-connect';
import { BankParent, DepotImportStep } from '@/types/secapi.types';

import AutoImportPortfolioContents from './AutoImportPortfolioContents';
import BankDepotDetails from './BankDepotDetails';
import { ChooseDepots } from './ChooseDepots';
import { DepotLoading } from './DepotLoading';
import Finalize from './Finalize';
import { SecAPIImport, SecAPIMessageType } from './SecapiImport';

type PortfolioConnectDialogProps = {
  bankId?: string;
  bankInterface?: string;
  depotNumberToSync?: string;
  applyMultiAccountFilter?: string;
  sessionId?: string;
  finalizeOnSuccess?: boolean;
  onFinalizeImports?: (redirectUrl: string) => void;
  useSecapiImportId?: boolean;
  secapiImportId?: string;
};

const SECAPI_LOCAL_HOST = 'https://secapi-local.divizend.com';

function PortfolioConnectDialog(props: PortfolioConnectDialogProps) {
  const { t, i18n } = useTranslation();
  const { profile } = useUserProfile();
  const { showSnackbar } = useSnackbar();
  const portfolioConnect = portfolioConnectSignal.value;
  const userFlags = profile.flags;
  const secapiImportUrl = userFlags?.useLocalSecapi ? SECAPI_LOCAL_HOST : usedConfig.secapiImportUrl;
  const [secapiUrl, setSecapiUrl] = useState(secapiImportUrl);
  const [secapiStep, setSecapiStep] = useState({ step: DepotImportStep.INTRO });
  const [replayId, setReplayId] = useState<string>();
  const [importToken, setImportToken] = useState<string>();
  const [currentBank, setCurrentBank] = useState<{
    name?: string;
    parent: BankParent;
  }>();
  const [flags, setFlags] = useState();
  const [type, setType] = useState<SecAPIMessageType>();
  useDepotImportEvents({
    secapiStep,
    replayId,
    importToken,
    currentBank,
    depotNumberToSync: props.depotNumberToSync,
    flags,
    type,
    organizationId: props.applyMultiAccountFilter,
    backgroundSessionId: props.sessionId,
  });

  useEffect(() => {
    const error = portfolioConnect.secapiImport.error;
    if (error) {
      showSnackbar(error, { type: 'error' });
      resetPortfolioConnect();
    }
  }, [portfolioConnect.secapiImport.error]);

  useEffect(() => {
    if (portfolioConnect.restartImport) {
      resetPortfolioConnect();
    }
  }, [portfolioConnect.restartImport]);

  useInterval(
    () => {
      getSecapiImportProgress();
    },
    500,
    {
      cond: !!(
        portfolioConnect.secapiImport.id &&
        !portfolioConnect.secapiImport.accounts.length &&
        !Object.keys(portfolioConnect.portfolioContents).length
      ),
    },
  );

  useEffect(() => {
    // waiting for two seconds after accounts were loaded successfully to show 100% in the progress bar to user
    if (portfolioConnect.secapiImport.accounts.length && true) {
      setTimeout(() => {
        setPortfolioContents();
      }, 1500);
    }
  }, [portfolioConnect.secapiImport.accounts]);

  useEffect(() => {
    // This is used to reload the SecAPI frame when the dialog is closed and reopened
    setTimeout(() => setSecapiUrl(secapiImportUrl), 1);
    if (props.useSecapiImportId && props.secapiImportId) {
      if (props.sessionId) createDepotImportSessionSuccess(props.sessionId);
      startSecapiImportSuccess({ secapiImportId: props.secapiImportId });
    }
  }, []);

  // TODO: Support background import
  // useEffect(() => {
  //   if (allowBackground) setMinimizeToBackground(true);
  // }, [allowBackground]);

  return (
    <>
      {props.useSecapiImportId &&
      !props.secapiImportId &&
      portfolioConnect.currentStep === Step.SecapiImportFrame ? null : portfolioConnect.currentStep ===
        Step.SecapiImportFrame ? (
        <SecAPIImport
          host={secapiUrl}
          language={i18n.language}
          includeDemoBanks={!!profile?.flags?.canAccessDemoBanks}
          width={'100%'}
          height={'50rem'}
          bankId={props.bankId}
          bankInterface={props.bankInterface}
          user={profile?.email}
          applyMultiAccountFilter={props.applyMultiAccountFilter}
          skipToManualImport={message => {
            chooseManualImport(message);
          }}
          onExternalAuthentication={message => {
            // window.open(message.url, '_blank');
            console.log('External authentication message: NOT IMPLEMENTED');
          }}
          onAuthenticationSuccessful={message => {
            setSecapiImportSuccessMessage(message);
            watchImportProgress(props.depotNumberToSync);
          }}
          onAuthenticationFailed={message => {
            setSecapiAuthenticationFailedMessage(message.message ?? 'An error has occured.');
          }}
          setStep={setSecapiStep}
          setSentryReplayId={message => setReplayId(message.replayId)}
          onImportStarted={message => {
            setImportToken(message.importToken);
            setCurrentBank(message.bank);
            setFlags((message as any).flags);
            setType(message.type);
          }}
        />
      ) : portfolioConnect.currentStep === Step.BankDetails ? (
        <BankDepotDetails />
      ) : portfolioConnect.currentStep === Step.ChooseDepotToSync ? (
        <View>
          <Text>Not yet implemented!</Text>
        </View>
      ) : portfolioConnect.currentStep === Step.DepotLoading ? (
        <DepotLoading />
      ) : portfolioConnect.currentStep === Step.ChooseDepots ? (
        <ChooseDepots />
      ) : portfolioConnect.currentStep === Step.PortfolioContents ? (
        <AutoImportPortfolioContents multiAccountImport={props.applyMultiAccountFilter} />
      ) : (
        <Finalize
          finalizeOnSuccess={props.finalizeOnSuccess}
          onFinalizeImports={props.onFinalizeImports}
          applyMultiAccountFilter={props.applyMultiAccountFilter}
        />
      )}
    </>
  );
}
export default PortfolioConnectDialog;

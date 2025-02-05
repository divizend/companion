import { useCallback, useEffect, useState } from 'react';

import { useSignals } from '@preact/signals-react/runtime';
import i18next from 'i18next';
import { StyleSheet } from 'react-native';

import { usedConfig } from '@/common/config';
import { SafeAreaView } from '@/components/base';
import { ChooseDepots } from '@/components/features/portfolio-import/ChooseDepots';
import { DepotLoading } from '@/components/features/portfolio-import/DepotLoading';
import Finalize from '@/components/features/portfolio-import/Finalize';
import { SecAPIImport } from '@/components/features/portfolio-import/SecapiImport';
import { t } from '@/i18n';
import { portfolioConnect } from '@/signals/portfolioConnect';
import { setCurrentStep } from '@/signals/portfolioConnectActions';
import { DepotImportStep } from '@/types/secapi.types';

export default function Analyze(props: any) {
  const secapiImportUrl = usedConfig.secapiImportUrl;
  const [secapiUrl, setSecapiUrl] = useState(secapiImportUrl);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [secapiStep, setSecapiStep] = useState({ step: DepotImportStep.INTRO });
  const [replayId, setReplayId] = useState<string | undefined>(undefined);
  const [importToken, setImportToken] = useState<string | undefined>(undefined);
  const [currentBank, setCurrentBank] = useState<any>(undefined);
  const [flags, setFlags] = useState<any>(undefined);
  const [type, setType] = useState<any>(undefined);
  const [allowBackground, setAllowBackground] = useState(false);
  const [minimizeToBackground, setMinimizeToBackground] = useState(false);
  useSignals();

  // useEffect(() => {
  //   const error = portfolioConnect.value.secapiImport.error;
  //   if (error && props.open) {
  //     dispatch(snackbarError('portfolioConnect:bankLogin.error', { error: error }));
  //     reset();
  //   }
  // }, [t, portfolioConnect.value.secapiImport.error]);

  // useEffect(() => {
  //   if (portfolioConnect.value.restartImport) {
  //     setConfirmCancelOpen(true);
  //   }
  // }, [t, portfolioConnect.value.restartImport]);

  // useInterval(
  //   () => {
  //     getSecapiImportProgress();
  //   },
  //   500,
  //   {
  //     cond:
  //       portfolioConnect.value.secapiImport.id &&
  //       !portfolioConnect.value.secapiImport.accounts.length &&
  //       !Object.keys(portfolioConnect.value.portfolioContents).length &&
  //       props.open,
  //   },
  // );

  // useEffect(() => {
  //   if (allowBackground) setMinimizeToBackground(true);
  // }, [allowBackground]);

  // useEffect(() => {
  //   // waiting for two seconds after accounts were loaded successfully to show 100% in the progress bar to user
  //   if (portfolioConnect.value.secapiImport.accounts.length && props.open) {
  //     setTimeout(() => {
  //       setPortfolioContents();
  //     }, 1500);
  //   }
  // }, [t, portfolioConnect.value.secapiImport.accounts]);

  // const onClose = useCallback(
  //   redirectUrl => {
  //     toast.dismiss();
  //     if (portfolioConnect.value.importedSomething && props.onFinalizeImports) props.onFinalizeImports(redirectUrl);
  //     props.onClose();
  //   },
  //   [props, portfolioConnect.value.importedSomething],
  // );

  // // This is used to reload the SecAPI frame when the dialog is closed and reopened
  // useEffect(() => {
  //   if (props.open) {
  //     setTimeout(() => setSecapiUrl(secapiImportUrl), 1);
  //   } else {
  //     setSecapiUrl('');
  //     reset();
  //     setAllowBackground(false);
  //     setMinimizeToBackground(false);
  //   }
  // }, [props.open]);

  // useEffect(() => {
  //   if (!!props.open && props.useSecapiImportId && props.secapiImportId) {
  //     if (props.sessionId) createDepotImportSessionSuccess(props.sessionId);
  //     startSecapiImportSuccess({ secapiImportId: props.secapiImportId });
  //   }
  // }, [props.open]);

  // if (!props.open) return null;

  return (
    <SafeAreaView>
      {/* <SecAPIImport
        host={secapiUrl}
        language={i18next.language}
        width={'100%'}
        height={'50rem'}
        skipToManualImport={message => {
          // continue to manual import
          console.log('Skip to manual import', message);
          setCurrentStep(secapiStep);
          console.log('secapiStep', portfolioConnect.value.currentStep);
        }}
        onExternalAuthentication={message => {
          // open external authentication url in new tab
          window.open(message.url, '_blank');
        }}
        onAuthenticationSuccessful={message => {
          // get account information with token
          console.log('Authentication successful', message);
        }}
        onAuthenticationFailed={message => {
          // show error message
          console.error('Authentication failed', message);
        }}
        setStep={setSecapiStep}
        setSentryReplayId={message => setReplayId(message.replayId)}
        onImportStarted={message => {
          setImportToken(message.importToken);
          setCurrentBank(message.bank);
          // setFlags(message.flags);
          setType(message.type);
        }}
        onAllowBackground={() => setAllowBackground(true)}
        includeDemoBanks
      /> */}
      {/* <DepotLoading /> */}
      <ChooseDepots />
      {/* <Finalize applyMultiAccountFilter={''} finalizeOnSuccess={false} onFinalizeImports={() => {}} /> */}
    </SafeAreaView>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#555',
//   },
//   webView: {
//     flex: 1,
//   },
//   progressText: {
//     textAlign: 'center',
//     fontSize: 16,
//     marginVertical: 10,
//     color: '#007BFF',
//   },
//   successText: {
//     textAlign: 'center',
//     fontSize: 16,
//     marginVertical: 10,
//     color: 'green',
//   },
// });

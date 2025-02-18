import { useRef } from 'react';

import WebView from 'react-native-webview';

import { useThemeColor } from '@/hooks/useThemeColor';
import { BankParent, BankType, ConnectionFlags } from '@/types/secapi.types';

export interface SecAPIMessage {
  type: SecAPIMessageType;
}

export enum SecAPIMessageType {
  SKIP_TO_MANUAL_IMPORT,
  AUTHENTICATION_SUCCESSFUL,
  EXTERNAL_AUTHENTICATION,
  SET_STEP,
  AUTHENTICATION_FAILED,
  SENTRY_REPLAY_ID,
  IMPORT_STARTED,
  ALLOW_BACKGROUND,
}

export interface SecAPISkipToManualImportMessage extends SecAPIMessage {
  bank: {
    name?: string;
    parent: BankParent;
  };
}

export interface SecAPIAuthenticationSuccessfulMessage extends SecAPIMessage {
  bank: {
    id: string;
    name: string;
    bic: string;
    parent: BankParent;
  };
  interface: {
    id: string;
    type: BankType;
  };
  token: string;
  flags: ConnectionFlags;
}

export interface SecAPIExternalAuthenticationMessage extends SecAPIMessage {
  url: string;
}

export interface SecAPISetStepMessage extends SecAPIMessage {
  step: number;
  progress: number;
  data: any;
}

export interface SecAPIAuthenticationFailedMessage extends SecAPIMessage {
  message?: string;
}

export interface SecAPISentryReplayIdMessage extends SecAPIMessage {
  replayId: string;
}

export interface SecAPIDepotImportStartedMessage extends SecAPIMessage {
  importToken: string;
  bank: {
    name?: string;
    parent: BankParent;
  };
}

export function SecAPIImport(props: {
  host: string;
  language?: string;
  includeDemoBanks?: boolean;
  bankId?: string;
  bankInterface?: string;
  width: number | string;
  height: number | string;
  user?: string;
  applyMultiAccountFilter?: string;
  skipToManualImport?: (message: SecAPISkipToManualImportMessage) => void;
  onAuthenticationSuccessful?: (message: SecAPIAuthenticationSuccessfulMessage) => void;
  onExternalAuthentication?: (message: SecAPIExternalAuthenticationMessage) => void;
  setStep?: (message: SecAPISetStepMessage) => void;
  onAuthenticationFailed?: (message: SecAPIAuthenticationFailedMessage) => void;
  setSentryReplayId?: (message: SecAPISentryReplayIdMessage) => void;
  onImportStarted?: (message: SecAPIDepotImportStartedMessage) => void;
  onAllowBackground?: () => void;
}) {
  const webViewRef = useRef<WebView>(null);
  const theme = useThemeColor();

  function onMessage(event: any) {
    try {
      const rawData = event.nativeEvent.data;

      if (typeof event.nativeEvent.data !== 'string' || !event.nativeEvent.data.startsWith('divizend|')) {
        return;
      }

      const messageString = rawData.substring(9);
      const message = JSON.parse(messageString) as SecAPIMessage;

      switch (message.type) {
        case SecAPIMessageType.SKIP_TO_MANUAL_IMPORT: {
          props.skipToManualImport?.(message as SecAPISkipToManualImportMessage);
          break;
        }
        case SecAPIMessageType.AUTHENTICATION_SUCCESSFUL: {
          props.onAuthenticationSuccessful?.(message as SecAPIAuthenticationSuccessfulMessage);
          break;
        }
        case SecAPIMessageType.EXTERNAL_AUTHENTICATION: {
          props.onExternalAuthentication?.(message as SecAPIExternalAuthenticationMessage);
          break;
        }
        case SecAPIMessageType.SET_STEP: {
          props.setStep?.(message as SecAPISetStepMessage);
          break;
        }
        case SecAPIMessageType.AUTHENTICATION_FAILED: {
          props.onAuthenticationFailed?.(message as SecAPIAuthenticationFailedMessage);
          break;
        }
        case SecAPIMessageType.SENTRY_REPLAY_ID: {
          props.setSentryReplayId?.(message as SecAPISentryReplayIdMessage);
          break;
        }
        case SecAPIMessageType.IMPORT_STARTED: {
          props.onImportStarted?.(message as SecAPIDepotImportStartedMessage);
          break;
        }
        case SecAPIMessageType.ALLOW_BACKGROUND: {
          props.onAllowBackground?.();
        }
        default: {
          break;
        }
      }
    } catch (error) {
      console.error('Error parsing message from WebView:', error);
    }
  }

  const queryString = new URLSearchParams();
  if (props.language !== undefined) {
    queryString.set('language', props.language);
  }
  if (props.includeDemoBanks !== undefined) {
    queryString.set('demo', String(props.includeDemoBanks));
  }

  if (props.bankId !== undefined) {
    queryString.set('bankId', props.bankId);
  }

  if (props.bankInterface !== undefined) {
    queryString.set('bankInterface', props.bankInterface);
  }

  if (props.user !== undefined) {
    queryString.set('user', props.user);
  }

  if (props.applyMultiAccountFilter) {
    queryString.set('multiAccount', '' + props.applyMultiAccountFilter);
  }
  if (theme.style === 'light') queryString.set('theme', theme.backgroundPrimary);

  queryString.set('hideManual', 'true');

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: `${props.host}/connection/authenticate?${queryString.toString()}` }}
      domStorageEnabled
      javaScriptEnabled
      style={{ marginBottom: 5 }}
      scrollEnabled={false}
      onMessage={onMessage}
    />
  );
}

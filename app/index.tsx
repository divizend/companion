import React, { useEffect, useState } from 'react';

import { useAuthRequest, useAutoDiscovery } from 'expo-auth-session';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Alert, Image, StyleSheet, View } from 'react-native';

import { usedConfig } from '../common/config';
import { setSessionToken, useSessionToken } from '../common/sessionToken';
import StyledButton from '../components/StyledButton';
import { t } from '../i18n';

WebBrowser.maybeCompleteAuthSession();

export default function Index() {
  const discovery = useAutoDiscovery(usedConfig.auth.url);
  const [sessionToken, sessionTokenLoading] = useSessionToken();
  const [handleLoginInProgress, setHandleLoginInProgress] = useState(false);

  useEffect(() => {
    if (sessionToken && !sessionTokenLoading) {
      router.replace('/main');
    }
  }, [sessionToken, sessionTokenLoading]);

  const [request, _, promptAsync] = useAuthRequest(
    {
      clientId: usedConfig.auth.clientId,
      redirectUri: 'divizend://authcallback',
      scopes: ['offline_access'],
      responseType: 'code',
      extraParams: {
        tenantId: usedConfig.auth.tenantId,
      },
      state: JSON.stringify({ origin: 'mobile' }),
      usePKCE: false,
    },
    discovery,
  );

  const handleLogin = async () => {
    setHandleLoginInProgress(true);

    try {
      const response = await promptAsync();
      if (response?.type !== 'success') {
        throw new Error(response?.type);
      }

      const apiCallbackResp = await fetch(
        `${usedConfig.api.url}/${
          usedConfig.api.versionCode
        }/auth/callback?${new URLSearchParams(response.params).toString()}`,
      );
      if (!apiCallbackResp.ok) {
        throw new Error(`Failed to get public token getter code (HTTP ${apiCallbackResp.status})`);
      }

      const { publicTokenGetterCode } = await apiCallbackResp.json();

      const getSessionTokenResp = await fetch(
        `${usedConfig.api.url}/${usedConfig.api.versionCode}/auth/sessionToken/${publicTokenGetterCode}`,
      );
      if (!getSessionTokenResp.ok) {
        throw new Error(`Failed to get session token (HTTP ${getSessionTokenResp.status})`);
      }

      const sessionTokenResp = await getSessionTokenResp.text();
      const { sessionToken } = JSON.parse(sessionTokenResp);

      await setSessionToken(sessionToken);
      router.replace('/main');
    } catch (error: any) {
      if (error.message !== 'cancel') {
        Alert.alert(t('common.error'), error.message);
      }
    } finally {
      setHandleLoginInProgress(false);
    }
  };

  if (sessionTokenLoading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
      <StyledButton
        title={t('common.login')}
        disabled={!request}
        loading={handleLoginInProgress}
        onPress={handleLogin}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  logo: {
    width: '60%',
    height: 100,
    marginBottom: 0,
  },
});

import React, { useEffect, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import { useAuthRequest, useAutoDiscovery } from "expo-auth-session";
import { router } from "expo-router";
import { View, Alert, StyleSheet, Image } from "react-native";
import { Button } from "@rneui/themed";
import { usedConfig } from "../common/config";
import { useSessionToken, setSessionToken } from "../common/sessionToken";
import { t } from "../i18n";

WebBrowser.maybeCompleteAuthSession();

export default function Index() {
  const discovery = useAutoDiscovery(usedConfig.auth.url);
  const [sessionToken, sessionTokenLoading] = useSessionToken();
  const [handleLoginInProgress, setHandleLoginInProgress] = useState(false);

  useEffect(() => {
    if (sessionToken && !sessionTokenLoading) {
      router.replace("/main");
    }
  }, [sessionToken, sessionTokenLoading]);

  const [request, _, promptAsync] = useAuthRequest(
    {
      clientId: usedConfig.auth.clientId,
      redirectUri: "divizend://authcallback",
      scopes: ["offline_access"],
      responseType: "code",
      extraParams: {
        tenantId: usedConfig.auth.tenantId,
      },
      state: JSON.stringify({ origin: "mobile" }),
      usePKCE: false,
    },
    discovery
  );

  const handleLogin = async () => {
    setHandleLoginInProgress(true);

    try {
      const response = await promptAsync();
      if (response?.type !== "success") {
        throw new Error(response?.type);
      }

      const apiCallbackResp = await fetch(
        `${usedConfig.api.url}/${
          usedConfig.api.versionCode
        }/auth/callback?${new URLSearchParams(response.params).toString()}`
      );
      if (!apiCallbackResp.ok) {
        throw new Error(
          `Failed to get public token getter code (HTTP ${apiCallbackResp.status})`
        );
      }

      const { publicTokenGetterCode } = await apiCallbackResp.json();

      const getSessionTokenResp = await fetch(
        `${usedConfig.api.url}/${usedConfig.api.versionCode}/auth/sessionToken/${publicTokenGetterCode}`
      );
      if (!getSessionTokenResp.ok) {
        throw new Error(
          `Failed to get session token (HTTP ${getSessionTokenResp.status})`
        );
      }

      const sessionTokenResp = await getSessionTokenResp.text();
      const { sessionToken } = JSON.parse(sessionTokenResp);

      await setSessionToken(sessionToken);
      router.replace("/main");
    } catch (error: any) {
      if (error.message !== "cancel") {
        Alert.alert(t("common.error"), error.message);
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
      <Image
        source={require("../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Button
        title={t("common.login")}
        disabled={!request}
        loading={handleLoginInProgress}
        onPress={handleLogin}
        buttonStyle={styles.button}
        titleStyle={styles.buttonText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  logo: {
    width: "60%",
    height: 100,
    marginBottom: 0,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

import React, { useEffect, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import { useAuthRequest, useAutoDiscovery } from "expo-auth-session";
import { router } from "expo-router";
import { Button, View, Alert } from "react-native";
import { usedConfig } from "./common/config";
import { useSessionToken, setSessionToken } from "./common/sessionToken";

WebBrowser.maybeCompleteAuthSession();

export default function Index() {
  const discovery = useAutoDiscovery(usedConfig.auth.url);
  const [sessionToken, sessionTokenLoading] = useSessionToken();

  useEffect(() => {
    // when session token already exists, redirect to main immediately
    if (sessionToken && !sessionTokenLoading) {
      router.replace("/main");
    }
  }, [sessionToken, sessionTokenLoading]);

  const [request, result, promptAsync] = useAuthRequest(
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
    try {
      const response = await promptAsync();
      if (response?.type !== "success") {
        throw new Error(response?.type);
      }

      const { publicTokenGetterCode } = await (
        await fetch(
          usedConfig.api.url +
            "/" +
            usedConfig.api.versionCode +
            "/auth/callback?" +
            new URLSearchParams(response.params).toString()
        )
      ).json();

      const { sessionToken } = await (
        await fetch(
          usedConfig.api.url +
            "/" +
            usedConfig.api.versionCode +
            "/auth/sessionToken/" +
            publicTokenGetterCode
        )
      ).json();

      // save session token to secure store and redirect to main
      await setSessionToken(sessionToken);
      router.replace("/main");
    } catch (error: any) {
      if (error.message !== "cancel") {
        Alert.alert("Error", error.message);
      }
    }
  };

  if (sessionTokenLoading) {
    return null;
  }

  return (
    <View>
      <Button
        title="Login!"
        disabled={!request}
        onPress={() => handleLogin()}
      />
    </View>
  );
}

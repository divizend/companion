import React, { useEffect, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import { useAuthRequest, useAutoDiscovery } from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import router from "expo-router";
import { Button, Text, View } from "react-native";
import { CONFIG } from "./common/config";

const config = CONFIG.local;
WebBrowser.maybeCompleteAuthSession();

export default function App() {
  const discovery = useAutoDiscovery(config.auth.url);
  const [sessionToken, setSessionToken] = useState<string | null>("loading");

  useEffect(() => {
    SecureStore.getItemAsync("sessionToken").then(setSessionToken);
  }, []);

  useEffect(() => {
    if (sessionToken && sessionToken !== "loading") {
      router.replace("/main");
    }
  }, [sessionToken]);

  const [request, result, promptAsync] = useAuthRequest(
    {
      clientId: config.auth.clientId,
      redirectUri: "divizend://authcallback",
      scopes: ["offline_access"],
      responseType: "code",
      extraParams: {
        tenantId: config.auth.tenantId,
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
          config.api.url +
            "/" +
            config.api.versionCode +
            "/auth/callback?" +
            new URLSearchParams(response.params).toString()
        )
      ).json();

      const { sessionToken } = await (
        await fetch(
          config.api.url +
            "/" +
            config.api.versionCode +
            "/auth/sessionToken/" +
            publicTokenGetterCode
        )
      ).json();

      setUser(
        await (
          await fetch(
            config.api.url + "/" + config.api.versionCode + "/users/me",
            {
              headers: {
                "X-SessionToken": sessionToken,
              },
            }
          )
        ).json()
      );
    } catch (error: any) {
      console.error("Authorization error:", error.message);
    }
  };

  return (
    <View>
      <Button
        title="Login!"
        disabled={!request}
        onPress={() => handleLogin()}
      />
      {user && <Text>{JSON.stringify(user, null, 2)}</Text>}
    </View>
  );
}

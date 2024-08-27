import React from "react";
import { ActivityIndicator, View, Text } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { Button, Alert } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  withSessionToken,
  deleteSessionToken,
  getSessionToken,
} from "./common/sessionToken";
import { usedConfig } from "./common/config";
import { useFetch } from "./common/api";
import FullScreenActivityIndicator from "./components/FullScreenActivityIndicator";

const queryClient = new QueryClient();

function MainContent() {
  const { data, isLoading } = useFetch("userProfile", "/users/me");

  if (isLoading) {
    return <FullScreenActivityIndicator />;
  }

  return (
    <View>
      <Text>{isLoading ? "Loading..." : "Hello, " + data.email}</Text>
      <Button
        title="Logout"
        onPress={() => {
          Alert.alert("Logout", "Are you sure you want to log out?", [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Yes",
              onPress: async () => {
                const sessionToken = await getSessionToken();
                const resp = await WebBrowser.openAuthSessionAsync(
                  `${usedConfig.api.url}/${usedConfig.api.versionCode}/auth/logout/${sessionToken}?` +
                    new URLSearchParams({
                      postLogoutRedirectUri: "divizend://authcallback",
                    }).toString()
                );

                if (resp.type === "success") {
                  await deleteSessionToken();
                  router.replace("/");
                }
              },
            },
          ]);
        }}
      />
    </View>
  );
}

function Main() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainContent />
    </QueryClientProvider>
  );
}

export default withSessionToken(Main);

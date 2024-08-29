import React, { useEffect } from "react";
import { View, Text } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { Button, Alert } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { withSessionToken } from "./common/sessionToken";
import { useFetch, logout } from "./common/api";
import FullScreenActivityIndicator from "./components/FullScreenActivityIndicator";
import { t } from "./i18n";

const queryClient = new QueryClient();

function MainContent() {
  const { data, error, isLoading } = useFetch("userProfile", "/users/me");

  const doErrorAlert = () =>
    Alert.alert(t("common.error"), error?.message, [
      {
        text: t("common.retry"),
        onPress: () => {
          queryClient.invalidateQueries({ queryKey: ["userProfile"] });
        },
      },
      {
        text: t("common.logout"),
        onPress: async () => {
          try {
            await logout(true);
          } catch (error) {
            doErrorAlert();
          }
        },
      },
    ]);

  useEffect(() => {
    if (error) {
      doErrorAlert();
    }
  }, [error]);

  if (isLoading) {
    return <FullScreenActivityIndicator />;
  }

  if (!data) {
    return null;
  }

  return (
    <View>
      <Text>{data ? t("main.greeting", { name: data.email }) : null}</Text>
      <Button
        title={t("common.logout")}
        onPress={() => {
          Alert.alert(t("common.logout"), t("common.logoutConfirmation"), [
            {
              text: t("common.cancel"),
              style: "cancel",
            },
            {
              text: t("common.yes"),
              onPress: async () => logout(),
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

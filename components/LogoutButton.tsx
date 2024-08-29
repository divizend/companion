import React from "react";
import { Alert } from "react-native";
import { Button } from "@rneui/themed";

import { logout } from "../common/api";
import { t } from "../i18n";

export default function LogoutButton() {
  return (
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
  );
}

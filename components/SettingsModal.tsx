import React from "react";
import { Alert } from "react-native";
import { t } from "@/i18n";
import { useFetch, logout } from "@/common/api";
import SectionList from "@/components/SectionList";
import ModalView from "@/components/ModalView";

interface SettingsViewProps {
  visible: boolean;
  onClose: () => void;
}

export default function SettingsView({
  visible,
  onClose,
}: SettingsViewProps): JSX.Element | null {
  const { data } = useFetch("userProfile");

  if (!data) {
    return null;
  }

  const handleLogout = () => {
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
  };

  return (
    <ModalView visible={visible} onClose={onClose} title={t("settings.title")}>
      <SectionList
        title={t("settings.accountSection.title")}
        items={[
          {
            title: t("settings.accountSection.email"),
            leftIcon: { name: "mail-outline", type: "material" },
            rightElement: data.email,
          },
        ]}
        bottomText={t("settings.accountSection.bottomText")}
      />

      <SectionList
        items={[
          {
            title: t("common.logout"),
            leftIcon: { name: "logout", type: "material" },
            onPress: handleLogout,
          },
        ]}
      />
    </ModalView>
  );
}

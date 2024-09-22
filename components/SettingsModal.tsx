import React, { useState } from "react";
import { t } from "@/i18n";
import { apiDelete, logout } from "@/common/api";
import RNRestart from "react-native-restart";
import SectionList from "@/components/SectionList";
import ModalView from "@/components/ModalView";
import { useUserProfile, getEmptyCompanionProfile } from "@/common/profile";
import { showConfirmationDialog } from "@/common/inputDialog";

interface SettingsViewProps {
  visible: boolean;
  onClose: () => void;
}

export default function SettingsView({ visible, onClose }: SettingsViewProps) {
  const { profile, updateProfile } = useUserProfile();
  const [resettingProfileLoading, setResettingProfileLoading] = useState(false);

  if (!profile) {
    return null;
  }

  const handleLogout = async () => {
    if (
      await showConfirmationDialog(
        t("common.logout"),
        t("common.logoutConfirmation")
      )
    ) {
      await logout();
    }
  };

  const handleResetProfile = async () => {
    const confirmed = await showConfirmationDialog(
      t("settings.resetProfile.title"),
      t("settings.resetProfile.message")
    );
    if (confirmed) {
      setResettingProfileLoading(true);
      try {
        await apiDelete("/companion");
        RNRestart.Restart();
      } finally {
        setResettingProfileLoading(false);
      }
    }
  };

  return (
    <ModalView visible={visible} onClose={onClose} title={t("settings.title")}>
      <SectionList
        title={t("settings.accountSection.title")}
        items={[
          {
            title: t("settings.accountSection.email"),
            leftIcon: { name: "mail-outline", type: "material" },
            rightElement: profile.email,
          },
        ]}
        bottomText={t("settings.accountSection.bottomText")}
      />

      <SectionList
        items={[
          {
            title: t("settings.resetProfile.title"),
            leftIcon: { name: "delete-outline", type: "material" },
            onPress: handleResetProfile,
            disabled: resettingProfileLoading,
          },
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

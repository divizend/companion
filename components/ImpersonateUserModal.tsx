import React, { useState, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { Input } from "@rneui/themed";
import { debounce } from "lodash";
import { t } from "@/i18n";
import { apiGet } from "@/common/api";
import ModalView from "@/components/ModalView";
import SectionList from "@/components/SectionList";
import { impersonateUser } from "@/common/profile";

interface ImpersonateUserModalProps {
  visible: boolean;
  onClose: () => void;
}

interface UserIdentity {
  id: string;
  text: string;
}

export default function ImpersonateUserModal({
  visible,
  onClose,
}: ImpersonateUserModalProps) {
  const [email, setEmail] = useState("");
  const [userIdentities, setUserIdentities] = useState<UserIdentity[]>([]);

  const searchUserIdentities = useCallback(
    debounce(async (searchEmail: string) => {
      if (searchEmail.trim() === "") {
        setUserIdentities([]);
        return;
      }
      try {
        const response = await apiGet(`/users`, { query: searchEmail });
        setUserIdentities(response);
      } catch (error) {
        console.error("Error searching users:", error);
        setUserIdentities([]);
      }
    }, 300),
    []
  );

  const handleEmailChange = (text: string) => {
    setEmail(text);
    searchUserIdentities(text);
  };

  return (
    <ModalView
      visible={visible}
      onClose={() => {
        setEmail("");
        setUserIdentities([]);
        onClose();
      }}
      title={t("settings.impersonateUser.title")}
    >
      <View style={styles.container}>
        <Input
          value={email}
          onChangeText={handleEmailChange}
          placeholder={t("settings.impersonateUser.emailPlaceholder")}
          autoCapitalize="none"
          keyboardType="email-address"
          containerStyle={styles.inputContainer}
        />
        {userIdentities.length > 0 ? (
          <SectionList
            items={userIdentities.map((userIdentity) => ({
              title: userIdentity.text,
              onPress: () => impersonateUser(userIdentity.id),
            }))}
          />
        ) : null}
      </View>
    </ModalView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    paddingHorizontal: 0,
    marginBottom: 10,
  },
});

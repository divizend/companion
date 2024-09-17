import React from "react";
import {
  View,
  ScrollView,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Text, Icon, Header } from "@rneui/themed";
import { t } from "@/i18n";
import { useFetch, logout } from "@/common/api";
import SectionList from "@/components/SectionList";

interface SettingsViewProps {
  onClose: () => void;
}

export default function SettingsView({
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
    <View style={styles.container}>
      <Header
        centerComponent={
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{t("settings.title")}</Text>
          </View>
        }
        rightComponent={
          <TouchableOpacity onPress={onClose}>
            <View style={styles.closeButton}>
              <Icon name="close" size={16} color="#666" />
            </View>
          </TouchableOpacity>
        }
        containerStyle={styles.header}
      />
      <ScrollView>
        <View style={styles.content}>
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
            title=""
            items={[
              {
                title: t("common.logout"),
                leftIcon: { name: "logout", type: "material" },
                onPress: handleLogout,
              },
            ]}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  header: {
    backgroundColor: "#f2f2f2",
    borderBottomWidth: 0,
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontWeight: "bold",
    fontSize: 16,
    textAlignVertical: "center",
  },
  closeButton: {
    backgroundColor: "#e0e0e0",
    borderRadius: 15,
    padding: 4,
    margin: 5,
  },
  content: {
    padding: 20,
  },
  emailText: {
    color: "grey",
    fontSize: 16,
    textAlign: "right",
    flexShrink: 1,
    marginLeft: 10,
  },
});

import React from "react";
import { View, ScrollView, Alert } from "react-native";
import { Text, ListItem, Icon, Header } from "@rneui/themed";
import { t } from "@/i18n";
import { useFetch, logout } from "@/common/api";
import { colors } from "@/common/colors";

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
    <View style={{ flex: 1, backgroundColor: "#f2f2f2" }}>
      <Header
        centerComponent={
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 16,
                textAlignVertical: "center",
              }}
            >
              {t("settings.title")}
            </Text>
          </View>
        }
        rightComponent={
          <View
            style={{
              backgroundColor: "#e0e0e0",
              borderRadius: 15,
              padding: 4,
              margin: 5,
            }}
          >
            <Icon name="close" size={16} color="#666" onPress={onClose} />
          </View>
        }
        containerStyle={{
          backgroundColor: "#f2f2f2",
          borderBottomWidth: 0,
        }}
      />
      <ScrollView>
        <View style={{ padding: 20 }}>
          <Text
            style={{
              textTransform: "uppercase",
              marginBottom: 6,
              marginLeft: 20,
              fontSize: 12,
              color: "#666",
            }}
          >
            {t("settings.accountSection.title")}
          </Text>
          <ListItem
            containerStyle={{
              borderRadius: 10,
              paddingLeft: 20,
              paddingRight: 20,
            }}
          >
            <Icon name="mail-outline" type="material" color="black" size={20} />
            <ListItem.Content
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <ListItem.Title style={{ fontSize: 16 }}>
                {t("settings.accountSection.email")}
              </ListItem.Title>
              <Text
                style={{
                  color: "grey",
                  fontSize: 16,
                  textAlign: "right",
                  flexShrink: 1,
                  marginLeft: 10,
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {data.email}
              </Text>
            </ListItem.Content>
          </ListItem>
          <Text
            style={{
              marginTop: 6,
              marginLeft: 20,
              fontSize: 12,
              color: "#666",
            }}
          >
            {t("settings.accountSection.bottomText")}
          </Text>

          <View style={{ marginTop: 30 }}>
            <ListItem
              containerStyle={{
                borderRadius: 10,
                paddingLeft: 20,
                paddingRight: 20,
              }}
              onPress={handleLogout}
            >
              <Icon name="logout" type="material" color="black" size={20} />
              <ListItem.Content>
                <ListItem.Title style={{ fontSize: 16 }}>
                  {t("common.logout")}
                </ListItem.Title>
              </ListItem.Content>
            </ListItem>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

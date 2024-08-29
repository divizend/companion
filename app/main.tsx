import React from "react";
import { View, Text } from "react-native";
import { Button, Alert } from "react-native";

import { withUserProfile } from "@/common/withUserProfile";
import { useFetch } from "@/common/api";
import { t } from "@/i18n";
import LogoutButton from "@/components/LogoutButton";

function Main() {
  const { data } = useFetch("userProfile");

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {data && (
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          {t("main.greeting", { name: data.email })}
        </Text>
      )}
      <LogoutButton />
    </View>
  );
}

export default withUserProfile(Main);

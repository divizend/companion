import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Icon } from "@rneui/themed";
import { t } from "@/i18n";
import { colors } from "@/common/colors";

interface ComingSoonScreenProps {
  iconName: string;
}

export default function ComingSoonScreen({ iconName }: ComingSoonScreenProps) {
  return (
    <View style={styles.container}>
      <Icon
        name={iconName}
        type="material"
        size={60}
        color={colors.theme}
        style={styles.icon}
      />
      <Text h3 style={styles.title}>
        {t("common.comingSoon")}
      </Text>
      <Text style={styles.stayTuned}>{t("common.stayTuned")}</Text>
      <Text style={styles.emojis}>🚀💵🕉️🌅</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontWeight: "900",
    color: colors.theme,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    maxWidth: "80%",
    marginBottom: 10,
  },
  stayTuned: {
    fontSize: 16,
    textAlign: "center",
    maxWidth: "80%",
  },
  emojis: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
});

import React from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Text, Icon, Header } from "@rneui/themed";
import { t } from "@/i18n";
import GoalsManager from "./GoalsManager";

interface GoalsManagerModalProps {
  onClose: () => void;
}

export default function GoalsManagerModal({
  onClose,
}: GoalsManagerModalProps): JSX.Element {
  return (
    <View style={styles.container}>
      <Header
        centerComponent={
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {t("learn.realizeGoals.manageGoals")}
            </Text>
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
          <GoalsManager />
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
});

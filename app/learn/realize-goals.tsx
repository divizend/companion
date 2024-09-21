import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Modal,
  Alert,
} from "react-native";
import { Text, Input, Button } from "@rneui/themed";
import { t } from "@/i18n";
import { useUserProfile } from "@/common/profile";
import { useNavigation } from "@react-navigation/native";
import SectionList from "@/components/SectionList";
import GoalsManagerModal from "./GoalsManagerModal";

export default function RealizeGoals() {
  const navigation = useNavigation();
  const { profile } = useUserProfile({
    moduleDescription: t("learn.vision"),
    viewTitle: t("learn.realizeGoals.title"),
    viewExplanation: t("learn.realizeGoals.explanation"),
  });

  const [isModalVisible, setIsModalVisible] = useState(false);

  const toggleModal = () => setIsModalVisible(!isModalVisible);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text h1 style={styles.title}>
          {t("learn.realizeGoals.title")}
        </Text>
        <Text style={styles.explanationText}>
          {t("learn.realizeGoals.explanation")}
        </Text>

        <SectionList
          title={t("learn.realizeGoals.yourGoals")}
          items={profile.companionProfile.goals.map((goal) => ({
            title: goal.description,
            onPress: () =>
              // super ugly typecast to avoid TS errors relating to "never"
              (navigation.navigate as any)("GoalDetails", { goalId: goal.id }),
          }))}
          containerStyle={styles.sectionContainer}
        />

        <SectionList
          title={t("learn.realizeGoals.actions")}
          items={[
            {
              title: t("learn.realizeGoals.manageGoals"),
              onPress: toggleModal,
              leftIcon: { name: "edit", type: "material" },
            },
          ]}
          containerStyle={styles.actionsContainer}
        />
      </ScrollView>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={toggleModal}
      >
        <GoalsManagerModal onClose={toggleModal} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  scrollViewContent: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    marginHorizontal: 5,
  },
  explanationText: {
    fontSize: 16,
    marginHorizontal: 5,
    marginBottom: 30,
  },
  sectionContainer: {
    marginTop: 0,
    marginBottom: 20,
  },
  actionsContainer: {
    marginTop: 10,
  },
});

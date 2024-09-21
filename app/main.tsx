import React, { useState } from "react";
import { TouchableOpacity, Modal, SafeAreaView } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Avatar, Icon } from "@rneui/themed";
import { withUserProfile } from "@/common/withUserProfile";
import { colors } from "@/common/colors";
import SettingsView from "@/components/SettingsView";
import InsightsScreen from "./learn/insights";
import GoalsScreen from "./learn/goals";
import RealizeGoalsScreen from "./learn/realize-goals";
import AnalyzeScreen from "./analyze";
import TrackScreen from "./track";
import DecideScreen from "./decide";
import DiscoverScreen from "./discover";
import { DisclaimerModal } from "@/components/DisclaimerModal";
import { useUserProfile } from "@/common/profile";
import { t } from "@/i18n";

const Tab = createBottomTabNavigator();
const LearnStack = createStackNavigator();

function LearnStackNavigator() {
  const { companionProfile } = useUserProfile();
  return (
    <LearnStack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={
        companionProfile.goalSetupDone ? "RealizeGoals" : "Insights"
      }
    >
      <LearnStack.Screen name="Insights" component={InsightsScreen} />
      <LearnStack.Screen name="Goals" component={GoalsScreen} />
      <LearnStack.Screen name="RealizeGoals" component={RealizeGoalsScreen} />
    </LearnStack.Navigator>
  );
}

function Main() {
  const { profile } = useUserProfile();
  const [settingsVisible, setSettingsVisible] = useState(false);

  if (!profile) {
    return null;
  }

  return (
    <>
      <DisclaimerModal visible={!profile?.flags?.allowedCompanionAI} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            const id = (route.params as any).id;

            if (id === "learn") {
              iconName = "school";
            } else if (id === "analyze") {
              iconName = "analytics";
            } else if (id === "track") {
              iconName = "trending-up";
            } else if (id === "decide") {
              iconName = "lightbulb";
            } else if (id === "discover") {
              iconName = "explore";
            }

            return (
              <Icon
                name={iconName!}
                type="material"
                size={size}
                color={color}
              />
            );
          },
          tabBarActiveTintColor: colors.theme,
          tabBarInactiveTintColor: "gray",
          headerShown: false,
        })}
      >
        <Tab.Screen
          initialParams={{ id: "learn" }}
          name={t("tabs.learn")}
          component={LearnStackNavigator}
        />
        <Tab.Screen
          initialParams={{ id: "analyze" }}
          name={t("tabs.analyze")}
          component={AnalyzeScreen}
        />
        <Tab.Screen
          initialParams={{ id: "track" }}
          name={t("tabs.track")}
          component={TrackScreen}
        />
        <Tab.Screen
          initialParams={{ id: "decide" }}
          name={t("tabs.decide")}
          component={DecideScreen}
        />
        <Tab.Screen
          initialParams={{ id: "discover" }}
          name={t("tabs.discover")}
          component={DiscoverScreen}
        />
      </Tab.Navigator>
      <Modal
        visible={settingsVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <SettingsView onClose={() => setSettingsVisible(false)} />
      </Modal>
      <SafeAreaView style={{ position: "absolute", top: 30, right: 0 }}>
        <TouchableOpacity
          style={{ marginRight: 15 }}
          onPress={() => setSettingsVisible(true)}
        >
          <Avatar
            rounded
            title={profile.email[0].toUpperCase()}
            containerStyle={{ backgroundColor: colors.theme }}
          />
        </TouchableOpacity>
      </SafeAreaView>
    </>
  );
}

export default withUserProfile(Main);

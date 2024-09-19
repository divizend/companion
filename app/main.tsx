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
import AnalyzeScreen from "./analyze";
import TrackScreen from "./track";
import DecideScreen from "./decide";
import DiscoverScreen from "./discover";
import { DisclaimerModal } from "@/components/DisclaimerModal";
import { useUserProfile } from "@/common/profile";

const Tab = createBottomTabNavigator();
const LearnStack = createStackNavigator();

function LearnStackNavigator() {
  return (
    <LearnStack.Navigator screenOptions={{ headerShown: false }}>
      <LearnStack.Screen
        name="Insights"
        component={InsightsScreen}
        options={{ title: "Insights" }}
      />
      <LearnStack.Screen
        name="Goals"
        component={GoalsScreen}
        options={{ title: "Goals" }}
      />
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

            if (route.name === "Learn") {
              iconName = "school";
            } else if (route.name === "Analyze") {
              iconName = "analytics";
            } else if (route.name === "Track") {
              iconName = "trending-up";
            } else if (route.name === "Decide") {
              iconName = "lightbulb";
            } else if (route.name === "Discover") {
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
        <Tab.Screen name="Learn" component={LearnStackNavigator} />
        <Tab.Screen name="Analyze" component={AnalyzeScreen} />
        <Tab.Screen name="Track" component={TrackScreen} />
        <Tab.Screen name="Decide" component={DecideScreen} />
        <Tab.Screen name="Discover" component={DiscoverScreen} />
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

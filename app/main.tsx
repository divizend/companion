import React, { useEffect, useState } from "react";
import { TouchableOpacity, Modal, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Avatar, Icon } from "@rneui/themed";
import { withUserProfile } from "@/common/withUserProfile";
import { useFetch } from "@/common/api";
import { colors } from "@/common/colors";
import SettingsView from "@/components/SettingsView";
import LearnScreen from "@/components/screens/LearnScreen";
import AnalyzeScreen from "@/components/screens/AnalyzeScreen";
import TrackScreen from "@/components/screens/TrackScreen";
import DecideScreen from "@/components/screens/DecideScreen";
import DiscoverScreen from "@/components/screens/DiscoverScreen";
import { DisclaimerModal } from "@/components/DisclaimerModal";

const Tab = createBottomTabNavigator();

function Main() {
  const { data } = useFetch("userProfile");
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [disclaimerVisible, setDisclaimerVisible] = useState(false);

  useEffect(() => {
    if (!data?.flags?.allowedCompanionAI) {
      setDisclaimerVisible(true);
    }
  }, [data]);

  if (!data) {
    return null;
  }

  return (
    <>
      <DisclaimerModal
        visible={disclaimerVisible}
        onClose={() => setDisclaimerVisible(false)}
      />
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
        <Tab.Screen name="Learn" component={LearnScreen} />
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
      <View style={{ position: "absolute", top: 30, right: 0 }}>
        <TouchableOpacity
          style={{ marginRight: 15 }}
          onPress={() => setSettingsVisible(true)}
        >
          <Avatar
            rounded
            title={data.email[0].toUpperCase()}
            containerStyle={{ backgroundColor: colors.theme }}
          />
        </TouchableOpacity>
      </View>
    </>
  );
}

export default withUserProfile(Main);

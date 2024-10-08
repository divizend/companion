import React, { useState } from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Avatar, Icon } from '@rneui/themed';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, TouchableOpacity } from 'react-native';

import { useUserProfile } from '@/common/profile';
import { withUserProfile } from '@/common/withUserProfile';
import OnboardingModal from '@/components/OnboardingModal';
import SettingsModal from '@/components/SettingsModal';
import { useThemeColor } from '@/hooks/useThemeColor';
import { t } from '@/i18n';

import AnalyzeScreen from './analyze';
import DecideScreen from './decide';
import DiscoverScreen from './discover';
import GoalDetailsScreen from './learn/goal-details';
import GoalsScreen from './learn/goals';
import InsightsScreen from './learn/insights';
import RealizeGoalsScreen from './learn/realize-goals';
import TrackScreen from './track';

const Tab = createBottomTabNavigator();
const LearnStack = createStackNavigator();

function LearnStackNavigator() {
  const { companionProfile } = useUserProfile();
  return (
    <LearnStack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={companionProfile.goalSetupDone ? 'RealizeGoals' : 'Insights'}
    >
      <LearnStack.Screen name="Insights" component={InsightsScreen} />
      <LearnStack.Screen name="Goals" component={GoalsScreen} />
      <LearnStack.Screen name="RealizeGoals" component={RealizeGoalsScreen} />
      <LearnStack.Screen name="GoalDetails" component={GoalDetailsScreen} getId={({ params }: any) => params?.goalId} />
    </LearnStack.Navigator>
  );
}

function Main() {
  const theme = useThemeColor();
  const { profile } = useUserProfile();
  const [settingsVisible, setSettingsVisible] = useState(false);

  if (!profile) {
    return null;
  }

  return (
    <>
      <OnboardingModal visible={!profile?.flags?.allowedCompanionAI} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            const id = (route.params as any).id;

            if (id === 'learn') {
              iconName = 'school';
            } else if (id === 'analyze') {
              iconName = 'analytics';
            } else if (id === 'track') {
              iconName = 'trending-up';
            } else if (id === 'decide') {
              iconName = 'lightbulb';
            } else if (id === 'discover') {
              iconName = 'explore';
            }

            return <Icon name={iconName!} type="material" size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.theme,
          tabBarInactiveTintColor: 'gray',
          tabBarActiveBackgroundColor: theme.darkBackground,
          tabBarInactiveBackgroundColor: theme.darkBackground,
          tabBarStyle: { backgroundColor: theme.backgroundSecondary, borderTopColor: theme.backgroundPrimary },
          headerShown: false,
        })}
      >
        <Tab.Screen initialParams={{ id: 'learn' }} name={t('tabs.learn')} component={LearnStackNavigator} />
        <Tab.Screen initialParams={{ id: 'analyze' }} name={t('tabs.analyze')} component={AnalyzeScreen} />
        <Tab.Screen initialParams={{ id: 'track' }} name={t('tabs.track')} component={TrackScreen} />
        <Tab.Screen initialParams={{ id: 'decide' }} name={t('tabs.decide')} component={DecideScreen} />
        <Tab.Screen initialParams={{ id: 'discover' }} name={t('tabs.discover')} component={DiscoverScreen} />
      </Tab.Navigator>
      <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
      <StatusBar style="light" />
      <SafeAreaView style={{ position: 'absolute', top: 30, right: 0 }}>
        <TouchableOpacity style={{ marginRight: 15 }} onPress={() => setSettingsVisible(true)}>
          <Avatar rounded title={profile.email[0].toUpperCase()} containerStyle={{ backgroundColor: theme.theme }} />
        </TouchableOpacity>
      </SafeAreaView>
    </>
  );
}

export default withUserProfile(Main);

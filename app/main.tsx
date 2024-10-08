import React from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Icon } from '@rneui/themed';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { StyleSheet } from 'react-native';

import { useUserProfile } from '@/common/profile';
import { withUserProfile } from '@/common/withUserProfile';
import OnboardingModal from '@/components/OnboardingModal';
import SettingsModal from '@/components/SettingsModal';
import BlurredHeader from '@/components/global/BlurredHeader';
import { useThemeColor } from '@/hooks/useThemeColor';
import { t } from '@/i18n';
import { isSettingsModalVisible } from '@/signals/app.signal';

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
  const { colorScheme } = useColorScheme();
  const { profile } = useUserProfile();

  if (!profile) {
    return null;
  }

  return (
    <>
      <OnboardingModal visible={!profile?.flags?.allowedCompanionAI} />
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            const id = (route.params as any).id;

            const iconMap: { [key: string]: string } = {
              learn: 'school',
              analyze: 'analytics',
              track: 'trending-up',
              decide: 'lightbulb',
              discover: 'explore',
            };

            iconName = iconMap[id];

            return <Icon name={iconName!} type="material" size={size} color={color} />;
          },
          tabBarActiveTintColor: theme.theme,
          tabBarInactiveTintColor: 'gray',
          // tabBarActiveBackgroundColor: theme.backgroundSecondary,
          // tabBarInactiveBackgroundColor: theme.backgroundSecondary,
          // tabBarStyle: { backgroundColor: theme.backgroundSecondary, borderTopColor: theme.backgroundPrimary, borderTopWidth: 0 },
          header: props => <BlurredHeader {...props} />,
          tabBarBackground: () => (
            <BlurView
              tint={colorScheme === 'dark' ? 'dark' : 'light'}
              intensity={80}
              style={{
                ...StyleSheet.absoluteFillObject,
                overflow: 'hidden',
                backgroundColor: 'transparent',
              }}
            />
          ),
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: 'transparent',
            // backgroundColor: theme.backgroundSecondary,
            borderTopColor: theme.backgroundPrimary,
            borderTopWidth: 0,
          },
        })}
      >
        <Tab.Screen initialParams={{ id: 'learn' }} name={t('tabs.learn')} component={LearnStackNavigator} />
        <Tab.Screen initialParams={{ id: 'analyze' }} name={t('tabs.analyze')} component={AnalyzeScreen} />
        <Tab.Screen initialParams={{ id: 'track' }} name={t('tabs.track')} component={TrackScreen} />
        <Tab.Screen initialParams={{ id: 'decide' }} name={t('tabs.decide')} component={DecideScreen} />
        <Tab.Screen initialParams={{ id: 'discover' }} name={t('tabs.discover')} component={DiscoverScreen} />
      </Tab.Navigator>
      <SettingsModal visible={isSettingsModalVisible.value} onClose={() => (isSettingsModalVisible.value = false)} />
    </>
  );
}

export default withUserProfile(Main);

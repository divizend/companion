import React, { useEffect } from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Icon } from '@rneui/themed';
import { BlurView } from 'expo-blur';
import { Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from 'react-native-screens/lib/typescript/native-stack/types';

import { useUserProfile } from '@/common/profile';
import { withUserProfile } from '@/common/withUserProfile';
import OnboardingModal from '@/components/OnboardingModal';
import SettingsStackNavigator from '@/components/features/settings/SettingsStack';
import BlurredHeader from '@/components/global/BlurredHeader';
import PromptProvider from '@/hooks/usePrompt';
import { RevenueCatProvider, usePurchases } from '@/hooks/usePurchases';
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

export type RootStackParamList = {
  App: undefined;
  SettingsModal?: { subscriptionInactive?: boolean };
};

const RootStack = createStackNavigator<RootStackParamList>();
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

function AppTabNavigator({ navigation }: NativeStackScreenProps<RootStackParamList, 'App'>) {
  const theme = useThemeColor();
  const { colorScheme } = useColorScheme();
  const { customerInfo } = usePurchases();

  useEffect(() => {
    if (!customerInfo) return;
    if (!customerInfo.entitlements.active['divizend-membership']) {
      return navigation.navigate('SettingsModal', { subscriptionInactive: true });
    }
  }, [customerInfo, navigation]);

  if (!customerInfo)
    return (
      <View className="flex-1">
        <ActivityIndicator />
      </View>
    );

  if (!customerInfo.entitlements.active['divizend-membership']) return <Redirect href="/main" />;

  return (
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
        header: props => <BlurredHeader {...props} />,
        tabBarBackground: () => (
          <BlurView
            experimentalBlurMethod="dimezisBlurView"
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
  );
}

function Main() {
  const { colorScheme } = useColorScheme();
  const { profile } = useUserProfile();

  if (!profile) {
    return null;
  }

  return (
    <RevenueCatProvider>
      <PromptProvider>
        <OnboardingModal visible={!profile?.flags?.allowedCompanionAI} />
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="App" component={AppTabNavigator} />
          <RootStack.Screen
            name="SettingsModal"
            component={SettingsStackNavigator}
            options={{ presentation: 'modal' }}
          />
        </RootStack.Navigator>
      </PromptProvider>
    </RevenueCatProvider>
  );
}

export default withUserProfile(Main);

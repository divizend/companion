import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';
import { NativeStackScreenProps } from 'react-native-screens/lib/typescript/native-stack/types';

import ModalLayout from '@/components/base/ModalLayout';
import { t } from '@/i18n';

import CurrentPlan from './CurrentPlan';
import SettingsView from './Settings';

export type SettingsStackParamList = {
  Settings: undefined;
  Plan: { subscriptionInactive?: boolean };
};

const SettingsStack = createStackNavigator<SettingsStackParamList>();

function SettingsViewScreen() {
  return (
    <ModalLayout canGoBack={false} title={t('settings.title')}>
      <SettingsView />
    </ModalLayout>
  );
}

function CurrentPlanScreen(screenProps: NativeStackScreenProps<SettingsStackParamList, 'Plan'>) {
  return (
    <ModalLayout noScrollView title={t('settings.currentPlan.title')}>
      <CurrentPlan {...screenProps} />
    </ModalLayout>
  );
}

export default function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator initialRouteName="Settings" screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="Settings" component={SettingsViewScreen} />
      <SettingsStack.Screen name="Plan" component={CurrentPlanScreen} />
    </SettingsStack.Navigator>
  );
}

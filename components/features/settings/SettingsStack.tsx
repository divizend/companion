import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';

import ModalLayout from '@/components/base/ModalLayout';
import { t } from '@/i18n';

import CurrentPlan from './CurrentPlan';
import SettingsView from './Settings';

const SettingsStack = createStackNavigator();

function SettingsViewScreen() {
  return (
    <ModalLayout canGoBack={false} title={t('settings.title')}>
      <SettingsView />
    </ModalLayout>
  );
}

function CurrentPlanScreen() {
  return (
    <ModalLayout noScrollView title={t('settings.currentPlan.title')}>
      <CurrentPlan />
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

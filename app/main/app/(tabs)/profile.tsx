import React from 'react';

import { StyleSheet } from 'react-native';

import { SafeAreaView, Text } from '@/components/base';
import { t } from '@/i18n';

import SettingsView from '../../settings';

export default function profile() {
  return (
    <SafeAreaView style={styles.container}>
      <Text className="text-3xl font-bold pl-5">{t('settings.pages.settings')}</Text>
      <SettingsView />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
  },
});

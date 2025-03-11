import React from 'react';

import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { SafeAreaView, Text } from '@/components/base';

import SettingsView from '../../settings';

export default function profile() {
  const { t } = useTranslation();

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

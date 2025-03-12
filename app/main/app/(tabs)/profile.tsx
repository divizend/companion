import React from 'react';

import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { SafeAreaView, Text } from '@/components/base';

import SettingsView from '../../settings';

export default function profile() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <Text h1 className="font-bold" style={{ marginHorizontal: 25 }}>
        {t('settings.pages.settings')}
      </Text>
      <SettingsView />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
  },
});

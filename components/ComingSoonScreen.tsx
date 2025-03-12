import React from 'react';

import { Icon } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

import { Text } from './base';
import { SafeAreaView } from './base/SafeAreaView';

interface ComingSoonScreenProps {
  iconName: string;
}

export default function ComingSoonScreen({ iconName }: ComingSoonScreenProps) {
  const { t } = useTranslation();
  const theme = useThemeColor();

  return (
    <SafeAreaView style={styles.container}>
      <Icon name={iconName} type="material" size={60} color={theme.theme} style={styles.icon} />
      <Text h3 style={[styles.title, { color: theme.theme }]}>
        {t('comingSoon.title')}
      </Text>
      <Text style={styles.stayTuned}>{t('comingSoon.stayTuned')}</Text>
      <Text style={styles.emojis}>🚀💵🕉️🌅</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    maxWidth: '80%',
    marginBottom: 10,
  },
  stayTuned: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: '80%',
  },
  emojis: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});

import React from 'react';

import { useTheme } from '@react-navigation/native';
import { Icon } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/base';

export default function ComingSoon({ iconName }: { iconName: string }) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Icon name={iconName} type="material" size={40} color={theme.colors.primary} style={styles.icon} />
      <Text h3 style={[styles.title, { color: theme.colors.primary }]}>
        {t('comingSoon.title')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

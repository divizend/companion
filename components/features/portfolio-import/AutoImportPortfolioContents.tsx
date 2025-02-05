import React, { useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { portfolioContentsImportConnectDepots } from '@/common/portfolioConnect';

export default function AutoImportPortfolioContents({ multiAccountImport = undefined }) {
  const { t } = useTranslation();

  useEffect(() => {
    portfolioContentsImportConnectDepots(multiAccountImport);
  }, [multiAccountImport]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('portfolioConnect:importingDepot')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
  },
});

import React, { useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { portfolioContentsImportConnectDepots } from '@/common/portfolioConnect';
import { useUserProfile } from '@/common/profile';
import { Text } from '@/components/base';
import { useThemeColor } from '@/hooks/useThemeColor';

type AutoImportPortfolioContentsProps = {
  multiAccountImport?: string;
};

export default function AutoImportPortfolioContents({ multiAccountImport }: AutoImportPortfolioContentsProps) {
  const { t } = useTranslation();
  const { profile } = useUserProfile();
  const theme = useThemeColor();

  useEffect(() => {
    portfolioContentsImportConnectDepots({
      multiAccountImport,
      ownerEntityId: profile.legalEntities.find(entity => entity.isActive)!.id,
    });
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.theme} />
      <Text style={styles.title}>{t('portfolioConnect.importingDepot')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
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

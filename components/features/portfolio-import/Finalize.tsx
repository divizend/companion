import React, { useEffect } from 'react';

import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { t } from 'i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Text } from '@/components/base';
import { useThemeColor } from '@/hooks/useThemeColor';
import { importedSomething, resetPortfolioConnect } from '@/signals/actions/portfolio-connect.actions';
import { portfolioConnect } from '@/signals/portfolio-connect';

interface FinalizeProps {
  applyMultiAccountFilter?: string;
  finalizeOnSuccess?: boolean;
  onFinalizeImports?: (arg1: any, arg2?: boolean) => void;
  onClose?: () => void;
}

export default function Finalize({
  applyMultiAccountFilter,
  finalizeOnSuccess,
  onFinalizeImports,
  onClose,
}: FinalizeProps) {
  const empty = portfolioConnect.value.importedDepotEmpty;
  const done = portfolioConnect.value.importedDepotDone || applyMultiAccountFilter;
  const theme = useThemeColor();

  useEffect(() => {
    if (empty || finalizeOnSuccess) {
      portfolioConnect.value = { ...portfolioConnect.value, importedDepotEmpty: false, importedDepotDone: false };
      if (onFinalizeImports) onFinalizeImports(null, true);
    }
  }, [empty, finalizeOnSuccess, onFinalizeImports]);

  return (
    <View style={styles.container}>
      <Feather name="check-circle" size={128} color={theme.theme} className="shadow-theme" style={styles.icon} />

      <Text style={styles.heading}>
        {applyMultiAccountFilter
          ? t('portfolioConnect.finalize.headingMultiple')
          : done
            ? t('portfolioConnect.finalize.heading')
            : t('portfolioConnect.finalize.headingNotDone')}
      </Text>

      {!done && <Text style={styles.subheading}>{t('portfolioConnect.finalize.subheadingNotDone')}</Text>}

      {!applyMultiAccountFilter ? (
        <>
          <Button
            title={t('portfolioConnect.finalize.goToPortfolios')}
            onPress={() => {
              router.navigate('/main/app/(tabs)/portfolios');
              onClose?.();
            }}
          />
          <Button
            variant="secondary"
            title={t('portfolioConnect.finalize.importAnother')}
            onPress={() => {
              resetPortfolioConnect();
              importedSomething();
            }}
          />
        </>
      ) : (
        <Text style={styles.subheading}>{t('portfolioConnect.finalize.multiAccountFilter')}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 7,
  },
  icon: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subheading: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: '80%',
  },
});

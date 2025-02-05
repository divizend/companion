import React, { useEffect } from 'react';

import { Feather } from '@expo/vector-icons';
import { t } from 'i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/base';
import { portfolioConnect } from '@/signals/portfolioConnect';

interface FinalizeProps {
  applyMultiAccountFilter?: string;
  finalizeOnSuccess?: boolean;
  onFinalizeImports?: (arg1: any, arg2?: boolean) => void;
}

export default function Finalize({ applyMultiAccountFilter, finalizeOnSuccess, onFinalizeImports }: FinalizeProps) {
  const empty = portfolioConnect.value.importedDepotEmpty;
  const done = portfolioConnect.value.importedDepotDone || applyMultiAccountFilter;

  useEffect(() => {
    if (empty || finalizeOnSuccess) {
      portfolioConnect.value = { ...portfolioConnect.value, importedDepotEmpty: false, importedDepotDone: false };
      if (onFinalizeImports) onFinalizeImports(null, true);
    }
  }, [empty, finalizeOnSuccess, onFinalizeImports]);

  const handleReset = () => {
    portfolioConnect.value = {
      ...portfolioConnect.value,
      importedDepotEmpty: false,
      importedDepotDone: false,
      importedSomething: true,
    };
  };

  return (
    <View style={styles.container}>
      <Feather name="check-circle" size={128} color="#4CAF50" style={styles.icon} />

      <Text style={styles.heading}>
        {applyMultiAccountFilter
          ? t('portfolioConnect:finalize.headingMultiple')
          : done
            ? t('portfolioConnect:finalize.heading')
            : t('portfolioConnect:finalize.headingNotDone')}
      </Text>

      {!done && <Text style={styles.subheading}>{t('portfolioConnect:finalize.subheadingNotDone')}</Text>}

      {!applyMultiAccountFilter ? (
        <Button title={t('portfolioConnect:finalize.importAnother')} onPress={handleReset} />
      ) : (
        <Text style={styles.subheading}>{t('portfolioConnect:finalize.multiAccountFilter')}</Text>
      )}

      <Button
        title={t(done ? 'portfolioConnect:finalize.backToDashboard' : 'portfolioConnect:finalize.editPortfolio')}
        onPress={() => {
          portfolioConnect.value = { ...portfolioConnect.value, importedDepotEmpty: false, importedDepotDone: false };
          if (onFinalizeImports) onFinalizeImports(null, !done);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
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

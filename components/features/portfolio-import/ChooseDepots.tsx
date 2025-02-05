import React from 'react';

import CheckBox from '@react-native-community/checkbox';
import { t } from 'i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/base';
import { portfolioConnect } from '@/signals/portfolioConnect';
import { chooseDepot, chooseDepotsSubmit, restartImport } from '@/signals/portfolioConnectActions';

const chosenDepotIds = ['1', '2', '3']; // Mocking a selected depot for testing

const accounts = [
  { id: '1', description: 'customer 1', depotNumber: '12345' },
  { id: '1', depotNumber: '67890' },
  { id: '2', description: 'customer 2', depotNumber: '67890' },
];

export function ChooseDepots() {
  const chosenDepotIds = portfolioConnect.value.importDepots.chosenDepotIds;
  const accounts = portfolioConnect.value.portfolioContents.accounts;

  const handleSelectAll = (checked: boolean) => {
    const depotIds = accounts.map(acc => acc.id);
    depotIds.forEach(depotId => chooseDepot({ depotId, checked, oneOnly: false }));
  };

  const handleDepotChange = (depotId: string, checked: boolean) => {
    chooseDepot({ depotId, checked, oneOnly: false });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.description}>{t('portfolioConnect.chooseDepots.description')}</Text>

      <View style={styles.checkboxContainer}>
        <CheckBox
          style={{
            transform: [{ scale: 0.7 }],
          }}
          boxType="square"
          value={chosenDepotIds.length === accounts.length}
          onValueChange={handleSelectAll}
        />
        <Text style={styles.selectAllText}>
          <Text style={styles.boldText}>{t('portfolioConnect.chooseDepots.selectAll')}</Text>
          {' - '}
          {t('portfolioConnect.chooseDepots.selected', { count: chosenDepotIds.length, total: accounts.length })}
        </Text>
      </View>

      <View style={styles.scrollView}>
        {accounts.map(acc => (
          <View key={acc.id} style={styles.checkboxItem}>
            <CheckBox
              style={{
                transform: [{ scale: 0.7 }],
              }}
              boxType="square"
              value={chosenDepotIds.includes(acc.id)}
              onValueChange={checked => handleDepotChange(acc.id, checked)}
            />
            <View>
              {acc.description && <Text style={styles.checkboxText}>{acc.description}</Text>}
              <Text style={styles.depotNumberText}>
                {t('portfolioConnect.chooseDepots.depotNumber', { number: acc.depotNumber })}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <Button title={t('portfolioConnect.restartImport')} onPress={restartImport} />
        <Button
          title={t('portfolioConnect.chooseDepots.callToAction')}
          onPress={chooseDepotsSubmit}
          disabled={chosenDepotIds.length === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 45,
    paddingVertical: 20,
    display: 'flex',
    flexDirection: 'column',
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 32,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 2,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  selectAllText: {
    marginLeft: 8,
  },
  boldText: {
    fontWeight: 'bold',
  },
  scrollView: {
    maxHeight: '60%',
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkboxText: {
    fontWeight: 'bold',
    marginLeft: 8,
  },
  depotNumberText: {
    marginTop: 0,
    marginLeft: 8,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});

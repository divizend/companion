import CheckBox from '@react-native-community/checkbox';
import { t } from 'i18next';
import { StyleSheet, View } from 'react-native';

import { Button, Text } from '@/components/base';
import { useThemeColor } from '@/hooks/useThemeColor';
import { chooseDepot, chooseDepotsSubmit, resetPortfolioConnect } from '@/signals/actions/portfolio-connect.actions';
import { portfolioConnect } from '@/signals/portfolio-connect';

export function ChooseDepots() {
  const theme = useThemeColor();

  const chosenDepotIds = portfolioConnect.value.importDepots.chosenDepotIds;
  const accounts = portfolioConnect.value.portfolioContents.accounts!;

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
        <Button
          title={t('portfolioConnect.restartImport')}
          style={{ borderRadius: 0 }}
          onPress={resetPortfolioConnect}
        />
        <Button
          title={t('portfolioConnect.chooseDepots.callToAction')}
          style={{ borderRadius: 0 }}
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
    marginTop: 40,
    display: 'flex',
    flexDirection: 'column',
  },
  description: {
    fontSize: 20,
    fontWeight: '800',
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
    fontSize: 16,
  },
  boldText: {
    fontWeight: 'bold',
    fontSize: 18,
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
    fontSize: 18,
  },
  depotNumberText: {
    marginTop: 0,
    marginLeft: 8,
    fontSize: 16,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});

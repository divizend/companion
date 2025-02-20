import { CheckBox } from '@rneui/themed';
import { t } from 'i18next';
import { capitalize } from 'lodash';
import { View } from 'react-native';

import SectionList from '@/components/SectionList';
import { Button, Text } from '@/components/base';
import { useThemeColor } from '@/hooks/useThemeColor';
import { chooseDepot, chooseDepotsSubmit, resetPortfolioConnect } from '@/signals/actions/portfolio-connect.actions';
import { portfolioConnect } from '@/signals/portfolio-connect';

const CheckBoxEasy = ({ checked, onPress }: { checked: boolean; onPress: () => void }) => {
  const { theme } = useThemeColor();

  return (
    <CheckBox
      wrapperStyle={{ backgroundColor: 'transparent', margin: 0, padding: 0 }}
      iconType="material-community"
      checkedIcon="checkbox-marked"
      uncheckedIcon="checkbox-blank-outline"
      checkedColor={theme}
      containerStyle={{
        backgroundColor: 'transparent',
        margin: 0,
        padding: 0,
        marginLeft: 0,
        marginRight: 0,
      }}
      checked={checked}
      onPress={onPress}
    />
  );
};

export function ChooseDepots() {
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
    <View className="p-5 mt-3">
      <SectionList
        title={t('portfolioConnect.chooseDepots.selected', { count: chosenDepotIds.length, total: accounts.length })}
        bottomText={t('portfolioConnect.chooseDepots.description')}
        items={[
          {
            onPress: () => handleSelectAll(chosenDepotIds.length !== accounts.length),
            title: t('portfolioConnect.chooseDepots.selectAll'),
            rightElement: (
              <CheckBoxEasy
                checked={chosenDepotIds.length === accounts.length}
                onPress={() => handleSelectAll(chosenDepotIds.length !== accounts.length)}
              />
            ),
          },
        ]}
      />

      <SectionList
        items={accounts.map((acc, index) => ({
          onPress: () => handleDepotChange(acc.id, !chosenDepotIds.includes(acc.id)),
          title: (
            <View>
              <Text h4 className="font-bold">
                {acc.description ? capitalize(acc.description) : 'Portfolio ' + (index + 1)}
              </Text>
              <Text>{t('portfolioConnect.chooseDepots.depotNumber', { number: acc.depotNumber })}</Text>
            </View>
          ),
          rightElement: (
            <CheckBoxEasy
              checked={chosenDepotIds.includes(acc.id)}
              onPress={() => handleDepotChange(acc.id, !chosenDepotIds.includes(acc.id))}
            />
          ),
        }))}
      />

      <View className="flex flex-col gap-3 mt-6">
        <Button
          title={t('portfolioConnect.chooseDepots.callToAction')}
          style={{ borderRadius: 0 }}
          onPress={chooseDepotsSubmit}
          disabled={chosenDepotIds.length === 0}
        />
        <Button
          variant="secondary"
          title={t('portfolioConnect.restartImport')}
          style={{ borderRadius: 0 }}
          onPress={resetPortfolioConnect}
        />
      </View>
    </View>
  );
}

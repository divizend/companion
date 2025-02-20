import React from 'react';

import { ListItem } from '@rneui/base';
import { capitalize } from 'lodash';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/base';
import { useThemeColor } from '@/hooks/useThemeColor';
import { t } from '@/i18n';
import { UserProfileDepot } from '@/types/depot.types';

import { BankParentIcon } from './BankParentIcon';

export const PortfolioCard = ({ depot }: { depot: UserProfileDepot }) => {
  const theme = useThemeColor();
  return (
    <ListItem
      containerStyle={[
        styles.card,
        {
          backgroundColor: theme.backgroundSecondary,
        },
      ]}
    >
      <ListItem.Content>
        <View className="flex flex-row items-center justify-between w-full gap-3">
          <Text h3 className="font-extrabold" style={{ flexShrink: 1 }}>
            {capitalize(depot.bankName)}
          </Text>
          <BankParentIcon bankParent={depot.bankType} />
        </View>
        <View className="mt-1">
          <View style={styles.detailRow}>
            <Text>{t('portfolioOverview.labels.description')}:</Text>
            <Text style={styles.value}>{depot.description || 'No description'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>{t('portfolioOverview.labels.portfolioNumber')}:</Text>
            <Text style={styles.value}>{depot.number || 'N/A'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>{t('portfolioOverview.labels.importedAt')}:</Text>
            <Text style={styles.value}>
              {depot.createdAt ? t('dateTime.dayLongAndTime', { date: depot.createdAt }) : 'N/A'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>{t('portfolioOverview.labels.syncedAt')}:</Text>
            <Text style={styles.value}>
              {depot.syncedAt ? t('dateTime.dayLongAndTime', { date: depot.syncedAt }) : 'N/A'}
            </Text>
          </View>
        </View>
      </ListItem.Content>
    </ListItem>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
    flexShrink: 1,
  },
});

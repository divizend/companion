import React from 'react';

import { ListItem } from '@rneui/base';
import { StyleSheet, Text, View } from 'react-native';

import { t } from '@/i18n';
import { UserProfileDepot } from '@/types/depot.types';

import { BankParentIcon } from './BankParentIcon';

export const DepotCard = ({ depot }: { depot: UserProfileDepot }) => {
  return (
    <ListItem containerStyle={styles.card}>
      <ListItem.Content>
        <View style={styles.bankContainer}>
          <BankParentIcon bankParent={depot.bankType} />
          <Text style={styles.bank}>{depot.bankName}</Text>
        </View>
        <View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>{t('portfolioOverview.labels.description')}:</Text>
            <Text style={styles.value}>{depot.description || 'No description'}</Text>
          </View>

          {/* <View style={styles.detailRow}>
            <Text style={styles.label}>{t('portfolioOverview.labels.owner')}:</Text>
            <Text>
              <DepotOwners depotId={depot.id} />
            </Text>
          </View> */}

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
  container: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 40,
    marginTop: 90,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
  },
  bankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bank: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
    flexShrink: 1,
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

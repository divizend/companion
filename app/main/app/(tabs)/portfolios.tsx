import React from 'react';

import { FlatList, StyleSheet, Text, View } from 'react-native';

import { useUserProfile } from '@/common/profile';
import { DepotCard } from '@/components/features/portfolio-overview/DepotCard';
import { t } from '@/i18n';

export default function Portfolios() {
  const { profile } = useUserProfile();
  const depots = profile.depots;
  const filteredDepots = depots.filter(d => !d.isClone);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('portfolioOverview.title')}</Text>
      <FlatList
        data={filteredDepots}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <DepotCard depot={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 40,
    marginTop: 90,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
});

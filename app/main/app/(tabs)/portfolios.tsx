import React from 'react';

import { Icon } from '@rneui/themed';
import { FlatList, StyleSheet, View } from 'react-native';

import { useUserProfile } from '@/common/profile';
import { Button, SafeAreaView, Text } from '@/components/base';
import PortfolioConnectModal from '@/components/features/portfolio-import/PortfolioConnectModal';
import { PortfolioCard } from '@/components/features/portfolio-overview/PortfolioCard';
import { ModalManager } from '@/components/global/modal';
import { useThemeColor } from '@/hooks/useThemeColor';
import { t } from '@/i18n';

export default function Portfolios() {
  const { profile } = useUserProfile();
  const theme = useThemeColor();

  const filteredPortfolios = profile.depots.filter(d => !d.isClone);

  return (
    <SafeAreaView style={styles.container}>
      <Text className="text-3xl font-bold mb-5">
        {t('portfolioOverview.title')} {filteredPortfolios.length ? '(' + filteredPortfolios.length + ')' : undefined}
      </Text>
      {!filteredPortfolios.length ? (
        <View className="flex-1 flex gap-5 justify-center items-center">
          <Icon name="block" type="material" size={64} color={theme.muted} />
          <Text h3>{t('portfolioOverview.noPortfolios')}</Text>
          <Button onPress={() => ModalManager.showModal(PortfolioConnectModal)}>
            {t('portfolioConnect.bankLogin.title')}
          </Button>
        </View>
      ) : (
        <FlatList
          data={filteredPortfolios}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <PortfolioCard depot={item} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
});

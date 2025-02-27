import React from 'react';

import { useSignals } from '@preact/signals-react/runtime';
import { Icon } from '@rneui/themed';
import { capitalize } from 'lodash';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { apiDelete } from '@/common/api';
import { showConfirmationDialog } from '@/common/inputDialog';
import { useUserProfile } from '@/common/profile';
import SectionList from '@/components/SectionList';
import { Button, SafeAreaView, Text } from '@/components/base';
import PortfolioOnboarding from '@/components/features/on-boarding/PortfolioOnboarding';
import PortfolioConnectModal from '@/components/features/portfolio-import/PortfolioConnectModal';
import { BankParentIcon } from '@/components/features/portfolio-overview/BankParentIcon';
import { useSnackbar } from '@/components/global/Snackbar';
import { ModalManager } from '@/components/global/modal';
import { useThemeColor } from '@/hooks/useThemeColor';
import { isPortfolioConnectOnboardingVisible } from '@/signals/app.signal';

export default function Portfolios() {
  const { t } = useTranslation();
  const { profile, refetch } = useUserProfile();
  const theme = useThemeColor();
  const { showSnackbar } = useSnackbar();
  const [deleteLoadingById, setDeleteLoadingById] = React.useState<Record<string, boolean>>({});

  useSignals();

  const filteredPortfolios = profile.depots.filter(d => !d.isClone);

  const handleDeletePortfolio = async (portfolioId: string) => {
    const confirmed = await showConfirmationDialog(
      t('portfolio.deletePortfolio.title'),
      t('portfolio.deletePortfolio.description'),
    );
    if (confirmed) {
      setDeleteLoadingById(prev => ({ ...prev, [portfolioId]: true }));
      await apiDelete(`/depots/${portfolioId}`)
        .then(refetch)
        .catch(e => {
          showSnackbar(e.message, { type: 'error' });
          setDeleteLoadingById(prev => ({ ...prev, [portfolioId]: false }));
        });
    }
    setDeleteLoadingById(prev => ({ ...prev, [portfolioId]: false }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text className="text-3xl font-bold mb-5">{t('portfolio.title')}</Text>

      {/* <Button
        disabled={isPortfolioConnectOnboardingVisible.value}
        onPress={() => (isPortfolioConnectOnboardingVisible.value = true)}
        containerStyle={{ marginBottom: 10 }}
      >
        Onboarding
      </Button> */}

      {isPortfolioConnectOnboardingVisible.value ? (
        <PortfolioOnboarding />
      ) : !filteredPortfolios.length ? (
        <View className="flex-1 flex gap-5 justify-center items-center">
          <Icon name="block" type="material" size={64} color={theme.muted} />
          <Text h3>{t('portfolio.noPortfolios')}</Text>
          <Button onPress={() => ModalManager.showModal(PortfolioConnectModal)}>
            {t('portfolioConnect.bankLogin.title')}
          </Button>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
          <SectionList
            items={[
              ...filteredPortfolios.map(portfolio => ({
                key: portfolio.id,
                leftIcon: <BankParentIcon bankParent={portfolio.bankType} size={25} />,
                title: (
                  <View>
                    <Text h4 className="font-bold line-clamp-1">
                      {capitalize(portfolio.bankName)}
                    </Text>
                    <Text className="line-clamp-1">{portfolio.description || portfolio.number}</Text>
                  </View>
                ),
                onRemove: () => handleDeletePortfolio(portfolio.id),
                containerStyle: {
                  opacity: deleteLoadingById[portfolio.id] ? 0.5 : 1,
                },
              })),
              {
                title: t('portfolioConnect.bankLogin.title'),
                onPress: () => ModalManager.showModal(PortfolioConnectModal),
                leftIcon: {
                  name: 'add',
                  type: 'material',
                },
              },
            ]}
          />
        </ScrollView>
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

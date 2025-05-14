import { useSignals } from '@preact/signals-react/runtime';
import { useTranslation } from 'react-i18next';
import { LogBox } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';

import { SafeAreaView, ScrollScreen, Text } from '@/components/base';
import {
  AssetClassesWidget,
  CalendarWidget,
  DivisionWidget,
  PortfolioSelector,
  PortfolioStatsWidget,
  QuotesWidget,
  SimulationWidget,
} from '@/components/features/actor';
import useInitializeActor from '@/hooks/useInitializeActor';

LogBox.ignoreLogs(['Image source "null" doesn\'t exist', 'No stops in gradient']);

export default function Analyze() {
  const { t } = useTranslation();

  const { isFetching, refetch } = useInitializeActor();

  useSignals();

  return (
    <SafeAreaView>
      <ScrollScreen
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() => {
              refetch();
            }}
          />
        }
      >
        <Text h1 className="mb-5 mx-1.5">
          {t('common.tabs.analyze')}
        </Text>
        <Text className="mb-2 ml-0.5 font-medium">{t('actor.portfolioSelector.label')}</Text>
        <PortfolioSelector className="mb-5 flex-1" />
        <QuotesWidget />
        <DivisionWidget />
        <SimulationWidget />
        <PortfolioStatsWidget />
        <AssetClassesWidget />
        <CalendarWidget />
      </ScrollScreen>
    </SafeAreaView>
  );
}

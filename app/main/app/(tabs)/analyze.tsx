import { useSignals } from '@preact/signals-react/runtime';
import { useTranslation } from 'react-i18next';
import { LogBox } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';

import { SafeAreaView, ScrollScreen, Text } from '@/components/base';
import AssetClassesWidget from '@/components/features/actor/AssetClassesWidget';
import CalendarWidget from '@/components/features/actor/CalendarWidget/CalendarWidget';
import DivisionWidget from '@/components/features/actor/DivisionWidget';
import PortfolioStatsWidget from '@/components/features/actor/PortfolioStatsWidget';
import QuotesWidget from '@/components/features/actor/QuotesWidget';
import SimulationWidget from '@/components/features/actor/SimulationWidget';
import useInitializeActor from '@/hooks/useInitializeActor';

LogBox.ignoreLogs(['Image source "null" doesn\'t exist']);

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

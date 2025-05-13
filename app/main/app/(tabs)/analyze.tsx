import { useSignals } from '@preact/signals-react/runtime';
import { useTranslation } from 'react-i18next';
import { LogBox } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';

import { SafeAreaView, ScrollScreen, Text } from '@/components/base';
import AssetClassesWidget from '@/components/features/actor/AssetClassesWidget';
import CalendarWidget from '@/components/features/actor/CalendarWidget/CalendarWidget';
import DivisionWidget from '@/components/features/actor/DivisionWidget';
import GenericWidget from '@/components/features/actor/GenericWidget';
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
        <GenericWidget
          config={{
            title: 'Generic Division',
            type: 'half-piechart',
            version: '1.0.0',
            pluginVersion: '1.0.0',
            meta: {
              author: 'Mohamed Aziz Khayati',
              description: 'This is a division widget that displays the portfolio division.',
              tags: ['division', 'quotes', 'portfolio'],
              created: '2025-04-08T00:00:00Z',
            },
            aggregation: [
              {
                type: 'query',
                queryText: `query {
                              performance {
                                totalAmount
                                entries {
                                  amount
                                  currency
                                }
                              }
                            }`,
              },
            ],
            outputOptions: {
              centerText:
                'Total Whatever $t(currency, {"amount": {"amount": $.performance.totalAmount,  "unit": "$.performance.entries.0.currency" } })',
              entries: '$.performance.entries',
              entryValue: '$.amount',
            },
          }}
        />
        <DivisionWidget />
        <SimulationWidget />
        <PortfolioStatsWidget />
        <AssetClassesWidget />
        <CalendarWidget />
      </ScrollScreen>
    </SafeAreaView>
  );
}

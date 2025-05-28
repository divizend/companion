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
import GenericWidget from '@/components/features/actor/GenericWidget';
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

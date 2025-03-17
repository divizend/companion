import { useSignals } from '@preact/signals-react/runtime';
import { useTranslation } from 'react-i18next';

import { SafeAreaView, ScrollScreen, Text } from '@/components/base';
import AssetClassesWidget from '@/components/features/actor/AssetClassesWidget';
import CalendarWidget from '@/components/features/actor/CalendarWidget/CalendarWidget';
import DivisionWidget from '@/components/features/actor/DivisionWidget';
import PortfolioStatsWidget from '@/components/features/actor/PortfolioStatsWidget';
import QuotesWidget from '@/components/features/actor/QuotesWidget';
import useInitializeActor from '@/hooks/useInitializeActor';

export default function Analyze() {
  const { t } = useTranslation();
  useInitializeActor();

  useSignals();

  return (
    <SafeAreaView>
      <ScrollScreen>
        <Text h1 className="mb-5 mx-1.5">
          {t('common.tabs.analyze')}
        </Text>
        <QuotesWidget />
        <DivisionWidget />
        <PortfolioStatsWidget />
        <AssetClassesWidget />
        <CalendarWidget />
      </ScrollScreen>
    </SafeAreaView>
  );
}

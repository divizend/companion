import { useSignals } from '@preact/signals-react/runtime';

import { SafeAreaView, ScrollScreen, Text } from '@/components/base';
import AssetClassesWidget from '@/components/features/actor/AssetClassesWidget';
import DivisionWidget from '@/components/features/actor/DivisionWidget';
import PortfolioStatsWidget from '@/components/features/actor/PortfolioStatsWidget';
import QuotesWidget from '@/components/features/actor/QuotesWidget';
import useInitializeActor from '@/hooks/useInitializeActor';
import { t } from '@/i18n';

export default function Analyze() {
  useInitializeActor();

  useSignals();

  return (
    <SafeAreaView>
      <ScrollScreen>
        <Text className="text-3xl font-bold mb-5 mx-1.5">{t('common.tabs.analyze')}</Text>
        <QuotesWidget />
        <DivisionWidget />
        <PortfolioStatsWidget />
        <AssetClassesWidget />
      </ScrollScreen>
    </SafeAreaView>
  );
}

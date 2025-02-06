import { useSignals } from '@preact/signals-react/runtime';

import { SafeAreaView } from '@/components/base';
import PortfolioConnectDialog from '@/components/features/portfolio-import/PortfolioConnectDialog';

export default function Analyze() {
  useSignals();

  return (
    <SafeAreaView>
      <PortfolioConnectDialog open onClose={() => console.log('onClose')} />
    </SafeAreaView>
  );
}

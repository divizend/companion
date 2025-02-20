import { Button, SafeAreaView } from '@/components/base';
import PortfolioConnectModal from '@/components/features/portfolio-import/PortfolioConnectModal';
import { ModalManager } from '@/components/global/modal';

export default function Analyze() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Button onPress={() => ModalManager.showModal(PortfolioConnectModal)}>Open PortfolioConnectModal</Button>
    </SafeAreaView>
  );
}

import React from 'react';

import { useSignals } from '@preact/signals-react/runtime';
import { useTranslation } from 'react-i18next';

import ModalLayout from '@/components/global/ModalLayout';
import { resetPortfolioConnect } from '@/signals/actions/portfolio-connect.actions';

import PortfolioConnect from './PortfolioConnect';

type PortfolioConnectModalProps = {
  dismiss: () => void;
} & React.ComponentProps<typeof PortfolioConnect>;

const PortfolioConnectModal: React.FC<PortfolioConnectModalProps> = ({ dismiss, ...props }) => {
  const { t } = useTranslation();

  useSignals();

  return (
    <ModalLayout
      dismiss={() => {
        resetPortfolioConnect();
        dismiss();
      }}
      title={t('portfolioConnect.title')}
      noScrollView
    >
      <PortfolioConnect {...props} />
    </ModalLayout>
  );
};

export default PortfolioConnectModal;

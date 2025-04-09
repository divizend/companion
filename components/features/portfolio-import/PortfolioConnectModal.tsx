import React, { useCallback } from 'react';

import { useSignals } from '@preact/signals-react/runtime';
import { useTranslation } from 'react-i18next';

import { useUserProfile } from '@/common/profile';
import ModalLayout from '@/components/global/ModalLayout';
import { resetPortfolioConnect } from '@/signals/actions/portfolio-connect.actions';

import PortfolioConnect from './PortfolioConnect';

type PortfolioConnectModalProps = {
  dismiss: () => void;
} & React.ComponentProps<typeof PortfolioConnect>;

const PortfolioConnectModal: React.FC<PortfolioConnectModalProps> = ({ dismiss, ...props }) => {
  const { t } = useTranslation();
  const { refetch } = useUserProfile();

  useSignals();

  const onClose = useCallback(() => {
    refetch();
    resetPortfolioConnect();
    dismiss();
  }, [refetch, dismiss]);

  return (
    <ModalLayout dismiss={onClose} title={t('portfolio.importTitle')} noScrollView>
      <PortfolioConnect {...props} onClose={onClose} />
    </ModalLayout>
  );
};

export default PortfolioConnectModal;

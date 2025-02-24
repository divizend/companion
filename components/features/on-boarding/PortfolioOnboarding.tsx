import React from 'react';

import { useTranslation } from 'react-i18next';

import { Button } from '@/components/base';
import PortfolioConnectModal from '@/components/features/portfolio-import/PortfolioConnectModal';
import { ModalManager } from '@/components/global/modal';
import { setIsPortfolioConnectOnboardingVisible } from '@/signals/app.signal';

import OnBoarding, { OnboardingView } from './OnBoarding';

const PortfolioOverview = require('@/assets/images/on-boarding/portfolio-overview.png');
const GermanBanks = require('@/assets/images/on-boarding/german-banks.png');
const PortfolioConnect = require('@/assets/images/on-boarding/portfolio-connect.png');

export default function PortfolioOnboarding() {
  const { t, i18n } = useTranslation();

  const data = React.useMemo(() => {
    const result = t('portfolioOverview.onBoarding', { returnObjects: true }) as {
      title: string;
      description: string;
    }[];

    const images = [PortfolioOverview, GermanBanks, PortfolioConnect];

    return result.map((item, index) => ({
      ...item,
      src: images[index],
      button: (
        <Button
          containerStyle={{ marginTop: 'auto' }}
          onPress={() => {
            ModalManager.showModal(PortfolioConnectModal);
            setIsPortfolioConnectOnboardingVisible(false);
          }}
        >
          {t('portfolioConnect.cta')}
        </Button>
      ),
    }));
  }, [i18n.language]);

  return (
    <OnBoarding data={data} render={OnboardingView} onClose={() => setIsPortfolioConnectOnboardingVisible(false)} />
  );
}

import React from 'react';

import { Divider } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useUserProfile } from '@/common/profile';
import usePortfolioQuery from '@/hooks/actor/useDepotQuery';
import { ActorService } from '@/services/actor.service';
import { actor } from '@/signals/actor';

import PortfolioStatsItem from './PortfolioStatsItem';
import Widget from './Widget';

interface PortfolioStatsItemProps {
  title: string;
  value: {
    amount: number;
    unit: string;
  };
  extraInfo?: React.ReactNode;
}

const PortfolioStatsRow = ({ items }: { items: PortfolioStatsItemProps[] }) => {
  return (
    <View className="flex-row justify-between flex-1">
      {items.map((item: PortfolioStatsItemProps) => (
        <View key={item.title} className="flex-1 mx-5">
          <PortfolioStatsItem title={item.title} value={item.value} extraInfo={item.extraInfo} />
        </View>
      ))}
    </View>
  );
};

export default function PortfolioStatsWidget() {
  const { t } = useTranslation();
  const depot = actor.value.depot;

  const { data, isLoading: statsLoading } = usePortfolioQuery({
    queryFn: ActorService.getPortfolioStats,
  });

  const { data: performance, isLoading: performanceLoading } = usePortfolioQuery({
    queryFn: ActorService.getPerformance,
  });

  const currency = useUserProfile().profile?.flags.currency;
  const loading = statsLoading || performanceLoading;

  const firstRowItems = [
    {
      title: t('actor.portfolioStats.totalAssets'),
      value: {
        amount: performance?.totalAmount ?? 0,
        unit: currency ?? 'EUR',
        options: {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        },
      },
    },
    {
      title: t('actor.portfolioStats.grossDividendThisYear'),
      value: {
        amount: data?.grossDividends.amount || 0,
        unit: data?.grossDividends.unit ?? currency ?? 'EUR',
        options: {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        },
      },
      extraInfo:
        data?.grossDividends.yearChange &&
        t('percent', {
          value: data?.grossDividends.yearChange,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          signDisplay: 'exceptZero',
        }),
    },
  ];

  const secondRowItems = [
    {
      title: t('actor.portfolioStats.totalRefundableWithholdingTax'),
      value: {
        amount: depot?.totalRefundableAmount?.amount ?? 0,
        unit: currency ?? 'EUR',
        options: {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        },
      },
    },
    {
      title: t('actor.portfolioStats.nextDividend'),
      value: {
        amount: data?.nextDividend?.yield.amount ?? 0,
        unit: data?.nextDividend?.yield.unit ?? currency ?? 'EUR',
      },
      extraInfo: data?.nextDividend && <>{t('dateTime.dayShort', { date: data.nextDividend.date })}</>,
    },
  ];

  return (
    <Widget title={t('actor.portfolioStats.title')} ready={!loading && !!data}>
      <PortfolioStatsRow items={firstRowItems} />
      <Divider style={{ marginVertical: 10 }} />
      <PortfolioStatsRow items={secondRowItems} />
    </Widget>
  );
}

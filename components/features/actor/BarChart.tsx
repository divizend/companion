import React, { useMemo } from 'react';

import { useSignals } from '@preact/signals-react/runtime';
import { Icon } from '@rneui/themed';
import { useFont } from '@shopify/react-native-skia';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';
import { Bar, CartesianChart } from 'victory-native';

import { showCustom } from '@/components/global/prompt';
import { actor } from '@/signals/actor';
import { CompanyDividendData, DividendDisplayOption } from '@/types/actor-api.types';

import { createDividendHistoryDisplayField, useActorSettingsModal } from './ActorSettingsModal';
import Widget from './Widget';
// @ts-ignore
import inter from './inter-var.ttf';

interface BarChartProps {
  queryKey: () => string[];
  queryFn: () => Promise<CompanyDividendData>;
}

export default function BarChart({ queryFn, queryKey }: BarChartProps) {
  const font = useFont(inter);
  const { t } = useTranslation();
  const { data, isLoading } = useQuery<CompanyDividendData>({
    queryFn: () => queryFn(),
    queryKey: queryKey(),
  });

  useSignals();

  const displayOption = actor.value.settings?.companyDividendHistoryWidget.displayOption;

  const { viewport, chartData } = useMemo(() => {
    const chartData =
      displayOption === DividendDisplayOption.YIELDS
        ? data?.dividendYields?.map(item => ({ date: item.date, amount: item.dividendYield! }))
        : displayOption === DividendDisplayOption.ABSOLUTESPLITADJUSTED
          ? data?.dividends?.map(item => ({ date: item.date, amount: item.absoluteSplitAdjusted.amount }))
          : data?.dividends?.map(item => ({ date: item.date, amount: item.yield.amount }));
    const amounts = chartData?.map(item => item.amount) || [];

    const minDividend = Math.min(...amounts);
    const maxDividend = Math.max(...amounts);

    const margin = maxDividend - minDividend;
    const marginTopRatio = 0.1; // 10% margin on top

    return {
      chartData,
      viewport: {
        y: [0, maxDividend + margin * marginTopRatio] as [number, number],
      },
    };
  }, [data, displayOption]);

  const SettingsModalComponent = useActorSettingsModal([createDividendHistoryDisplayField()]);

  return (
    <Widget
      styles={{ root: { overflow: 'hidden' }, container: { height: 150 } }}
      title={t('actor.dividendHistory.title')}
      ready={!!chartData && !isLoading}
      settings={
        <Pressable onPress={() => showCustom(SettingsModalComponent)}>
          <Icon name="settings" type="material" color="gray" size={24} />
        </Pressable>
      }
    >
      <CartesianChart
        domainPadding={{ left: 20, right: 20 }}
        viewport={viewport}
        axisOptions={{ lineWidth: 0 }}
        frame={{ lineWidth: 0 }}
        data={chartData!}
        xKey="date"
        yKeys={['amount']}
        xAxis={{
          formatXLabel: label => new Date(label).getFullYear().toString(),
          font,
          labelPosition: 'outset',
          labelRotate: 0,
        }}
      >
        {({ points, chartBounds }) => (
          <Bar
            barCount={5}
            roundedCorners={{ topLeft: 5, topRight: 5, bottomLeft: 5, bottomRight: 5 }}
            chartBounds={chartBounds}
            barWidth={5}
            points={points.amount}
            color="#2E7877"
          />
        )}
      </CartesianChart>
    </Widget>
  );
}

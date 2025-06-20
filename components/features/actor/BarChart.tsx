import React, { useMemo, useState } from 'react';

import { useSignals } from '@preact/signals-react/runtime';
import { Icon } from '@rneui/themed';
import { Circle, useFont } from '@shopify/react-native-skia';
import { useQuery } from '@tanstack/react-query';
import { throttle } from 'lodash';
import { Trans, useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import { SharedValue, runOnJS, useAnimatedReaction, useSharedValue } from 'react-native-reanimated';
import { Bar, CartesianChart, Line, useChartPressState } from 'victory-native';

// @ts-ignore
import inter from '@/assets/fonts/inter-var.ttf';
import { Text } from '@/components/base';
import { showCustom } from '@/components/global/prompt';
import { useThemeColor } from '@/hooks/useThemeColor';
import { actor } from '@/signals/actor';
import {
  CompanyDividendData,
  CompanyDividendHistory,
  CompanyDividendYield,
  DividendDisplayOption,
} from '@/types/actor-api.types';

import { createDividendHistoryDisplayField, useActorSettingsModal } from './ActorSettingsModal';
import Widget from './Widget';

interface BarChartProps {
  queryKey: () => string[];
  queryFn: () => Promise<CompanyDividendData>;
}

function ToolTip({ x, y }: { x: SharedValue<number>; y: SharedValue<number> }) {
  return (
    <>
      <Circle cx={x} cy={y} r={9} color="white" />
      <Circle cx={x} cy={y} r={7} color="#2E7877" />
    </>
  );
}

function InfoComponent({
  data,
  isActive,
  pressedData,
  displayOption,
}: {
  data: CompanyDividendData | undefined;
  isActive: boolean;
  pressedData: any;
  displayOption: DividendDisplayOption;
}) {
  if (!data) return null;

  let specificData: CompanyDividendHistory | CompanyDividendYield | null = null;

  if (displayOption === DividendDisplayOption.YIELDS) {
    const yields = data.dividendYields || [];
    if (isActive && pressedData && pressedData.x) {
      specificData = pressedData?.originalData;
    } else {
      specificData = yields[yields.length - 1] || null;
    }
  } else {
    const dividends = data.dividends || [];
    if (isActive && pressedData && pressedData.x) {
      specificData = pressedData?.originalData;
    } else {
      specificData = dividends[dividends.length - 1] || null;
    }
  }

  if (!specificData) return null;

  return <View className="flex items-start py-4 pb-0">{OPTIONS[displayOption].render(specificData as any)}</View>;
}

function DividendInformation({ data }: { data: CompanyDividendHistory }) {
  const { t } = useTranslation();
  return (
    <View className="flex items-start">
      <Text h1 className="font-bold">
        {t('currency', {
          amount: {
            amount: data.yield.amount,
            unit: data.yield.unit ?? 'EUR',
          },
        })}
      </Text>
      <Text className="text-sm mt-1 font-bold" style={{ color: '#999' }}>
        {t('dateTime.day', { date: new Date(data.date) })}
      </Text>
    </View>
  );
}

function AbsoluteSplitAdjustedInfo({ data }: { data: CompanyDividendHistory }) {
  const { t } = useTranslation();
  const splits = data.dividendSplits;

  return (
    <View style={{ alignItems: 'flex-start' }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
        <View>
          <Text h1 className="font-bold">
            {t('currency', {
              amount: {
                amount: data.absoluteSplitAdjusted.amount,
                unit: data.absoluteSplitAdjusted.unit ?? 'EUR',
              },
            })}
          </Text>
          <Text className="text-sm mt-1 font-bold" style={{ color: '#999' }}>
            {t('dateTime.day', { date: new Date(data.date) })}
          </Text>
        </View>
        {!!splits ? (
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, marginBottom: 4 }}>
              <Trans
                i18nKey="actor.dividendHistory.absoluteSplitAdjustedInfo.splits.value"
                values={{
                  from: splits.from,
                  to: splits.to,
                }}
                components={{
                  strong: <Text style={{ fontWeight: 'bold' }} />,
                }}
              />
            </Text>
            <Text style={{ fontSize: 14 }}>
              <Trans
                i18nKey="actor.dividendHistory.absoluteSplitAdjustedInfo.splits.splitAdjustedDividend"
                values={{
                  priceBeforeSplit: t('currency', {
                    amount: data.yield,
                  }),
                  splits: `${splits.from}:${splits.to}`,
                  price: t('currency', {
                    amount: data?.absoluteSplitAdjusted,
                  }),
                }}
                components={{
                  strong: <Text style={{ fontWeight: 'bold' }} />,
                }}
              />
            </Text>
          </View>
        ) : (
          <Text style={{ fontSize: 14 }}>{t('actor.dividendHistory.absoluteSplitAdjustedInfo.noSplits')}</Text>
        )}
      </View>
    </View>
  );
}

function DividendYieldInfo({}: { data: CompanyDividendYield }) {
  return <></>;
}

const OPTIONS = {
  [DividendDisplayOption.ABSOLUTE]: {
    showBars: true,
    showArea: false,
    showLine: false,
    showHorizontalGrid: false,
    getHorizontalValue: (d: CompanyDividendHistory) => new Date(d.date),
    getVerticalValue: (d: CompanyDividendHistory) => d.yield.amount,
    render: (d: CompanyDividendHistory) => <DividendInformation data={d} />,
    shouldYStartFromZero: true,
  },
  [DividendDisplayOption.ABSOLUTESPLITADJUSTED]: {
    showBars: true,
    showArea: false,
    showLine: false,
    showHorizontalGrid: false,
    getHorizontalValue: (d: CompanyDividendHistory) => new Date(d.date),
    getVerticalValue: (d: CompanyDividendHistory) => d.absoluteSplitAdjusted?.amount ?? 0,
    render: (d: CompanyDividendHistory) => <AbsoluteSplitAdjustedInfo data={d} />,
    shouldYStartFromZero: true,
  },
  [DividendDisplayOption.YIELDS]: {
    showBars: false,
    showArea: true,
    showLine: true,
    showHorizontalGrid: true,
    getHorizontalValue: (d: CompanyDividendYield) => new Date(d.date),
    getVerticalValue: (d: CompanyDividendYield) => d.dividendYield ?? 0,
    render: (d: CompanyDividendYield) => <DividendYieldInfo data={d} />,
    shouldYStartFromZero: true,
  },
} as const;

export default function BarChart({ queryFn, queryKey }: BarChartProps) {
  const font = useFont(inter, 12);
  const theme = useThemeColor();
  const { t } = useTranslation();
  const { data, isLoading } = useQuery<CompanyDividendData>({
    queryFn: () => queryFn(),
    queryKey: queryKey(),
  });
  const { state, isActive } = useChartPressState({
    x: '',
    y: {
      amount: 0,
    },
  });

  const [pressedData, setPressedData_] = useState<{
    originalData: CompanyDividendYield | CompanyDividendHistory;
    date: string;
    amount: number;
    isActive: boolean;
  } | null>(null);
  const setPressedData = throttle(setPressedData_, 32);

  const defaultTooltipX = useSharedValue(0);
  const defaultTooltipY = useSharedValue(0);

  useSignals();

  const displayOption = actor.value.settings?.companyDividendHistoryWidget.displayOption;

  const { viewport, chartData } = useMemo(() => {
    const currentDisplayOption = displayOption || DividendDisplayOption.YIELDS;

    const chartData: { date: string; amount: number; originalData: CompanyDividendYield | CompanyDividendHistory }[] =
      currentDisplayOption === DividendDisplayOption.YIELDS
        ? data?.dividendYields?.map(d => ({
            date: OPTIONS[currentDisplayOption].getHorizontalValue(d).toISOString().slice(0, 10),
            amount: OPTIONS[currentDisplayOption].getVerticalValue(d),
            originalData: d,
          })) || []
        : data?.dividends?.map(d => ({
            date: OPTIONS[currentDisplayOption].getHorizontalValue(d).toISOString().slice(0, 10),
            amount: OPTIONS[currentDisplayOption].getVerticalValue(d),
            originalData: d,
          })) || [];

    const amounts = chartData?.map(item => item.amount) || [];

    const minDividend = Math.min(...amounts);
    const maxDividend = Math.max(...amounts);

    const margin = maxDividend - minDividend;
    const marginTopRatio = 0.1;

    const option = OPTIONS[currentDisplayOption];

    return {
      chartData,
      viewport: {
        y: option?.shouldYStartFromZero
          ? ([0, maxDividend + margin * marginTopRatio] as [number, number])
          : ([minDividend - margin * marginTopRatio, maxDividend + margin * marginTopRatio] as [number, number]),
      },
    };
  }, [data, displayOption]);

  useAnimatedReaction(
    () => ({
      isActive: isActive,
      x: state.x.value,
      y: state.y.amount.value,
      matchedIndex: state.matchedIndex,
    }),
    current => {
      if (current.isActive && current.matchedIndex !== undefined && chartData) {
        const pressedChartData = chartData[current.matchedIndex.value];
        const enhancedData = {
          ...current,
          originalData: pressedChartData?.originalData,
          date: pressedChartData?.date,
          amount: pressedChartData?.amount,
        };
        runOnJS(setPressedData)(enhancedData);
      } else {
        runOnJS(setPressedData)(null);
      }
    },
    [isActive, state.matchedIndex, chartData],
  );

  const SettingsModalComponent = useActorSettingsModal([createDividendHistoryDisplayField()]);

  let selectedYield = undefined;
  if (displayOption === DividendDisplayOption.YIELDS && data?.dividendYields?.length) {
    selectedYield = isActive ? data.dividendYields.at(state.matchedIndex.value) : data.dividendYields.at(-1);
  }

  return (
    <Widget
      styles={{ root: { overflow: 'hidden' } }}
      title={t('actor.dividendHistory.title')}
      ready={!!chartData && !isLoading}
      settings={
        <Pressable onPress={() => showCustom(SettingsModalComponent)}>
          <Icon name="settings" type="material" color="gray" size={24} />
        </Pressable>
      }
    >
      <InfoComponent
        data={data}
        isActive={isActive}
        pressedData={pressedData}
        displayOption={displayOption || DividendDisplayOption.YIELDS}
      />
      {displayOption === DividendDisplayOption.YIELDS && selectedYield ? (
        <View className="flex items-center">
          <Text>
            <Trans
              i18nKey="actor.dividendHistory.yieldInfo.splits.sharePrice"
              values={{
                date: t('dateTime.day', {
                  date: new Date(selectedYield.date ?? 0),
                }),
                price: t('currency', {
                  amount: {
                    amount: selectedYield.quote?.price,
                    unit: selectedYield.quote?.currency,
                  },
                }),
              }}
              components={{
                strong: <Text style={{ fontWeight: 'bold' }} />,
              }}
            />
          </Text>

          {selectedYield.dividendYield !== 0 && !!selectedYield.quote && (
            <Text>
              <Trans
                i18nKey="actor.dividendHistory.yieldInfo.dividendYield"
                values={{
                  yield: t('currency', {
                    amount: {
                      amount: selectedYield.quote.price * selectedYield.dividendYield!,
                      unit: selectedYield.quote?.currency,
                    },
                  }),
                  price: t('currency', {
                    amount: {
                      amount: selectedYield.quote?.price,
                      unit: selectedYield.quote?.currency,
                    },
                  }),
                  result: t('percent', {
                    value: {
                      value: selectedYield.dividendYield,
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    },
                  }),
                }}
                components={{
                  strong: <Text style={{ fontWeight: 'bold' }} />,
                }}
              />
            </Text>
          )}
        </View>
      ) : null}
      <Text className="text-center text-gray-500 text-xs mb-4 italic">{t('actor.chartInstruction')}</Text>
      <View className="h-[200]">
        <CartesianChart
          chartPressState={state}
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
            labelColor: theme.text,
            labelPosition: 'outset',
            lineWidth: 0,
          }}
          yAxis={[
            {
              font,
              labelColor: theme.text,
              labelPosition: 'outset',
              tickCount: displayOption === DividendDisplayOption.YIELDS ? 2 : 4,
              formatYLabel: label =>
                displayOption === DividendDisplayOption.YIELDS
                  ? t('percent', {
                      value: {
                        value: label,
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    })
                  : t('currency', {
                      amount: {
                        amount: label,
                        unit: data?.dividends?.at(-1)?.yield.unit ?? 'EUR',
                      },
                    }),
            },
          ]}
        >
          {({ points, chartBounds }) => {
            const option = OPTIONS[displayOption || DividendDisplayOption.YIELDS];

            if (points.amount.length > 0) {
              const lastPoint = points.amount[points.amount.length - 1];
              defaultTooltipX.value = lastPoint?.x ?? 0;
              defaultTooltipY.value = lastPoint?.y ?? 0;
            }

            return (
              <>
                {option.showBars ? (
                  <Bar
                    roundedCorners={{ topLeft: 5, topRight: 5, bottomLeft: 5, bottomRight: 5 }}
                    chartBounds={chartBounds}
                    barWidth={5}
                    points={points.amount}
                    color="#2E7877"
                  />
                ) : (
                  <Line points={points.amount} strokeWidth={3} color="#2E7877" />
                )}
                {isActive ? (
                  <ToolTip x={state.x.position} y={state.y.amount.position} />
                ) : (
                  <ToolTip x={defaultTooltipX} y={defaultTooltipY} />
                )}
              </>
            );
          }}
        </CartesianChart>
      </View>
    </Widget>
  );
}

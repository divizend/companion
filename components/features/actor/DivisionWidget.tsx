import React, { useCallback, useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useUserProfile } from '@/common/profile';
import SecurityIcon from '@/components/SecurityIcon';
import { Text } from '@/components/base';
import usePortfolioQuery from '@/hooks/actor/useDepotQuery';
import { ActorService } from '@/services/actor.service';
import { CurrencyAmount, actor } from '@/signals/actor';
import { clampArray } from '@/utils/object';
import { rgbToHsl } from '@/utils/strings';

import { PieDataItem } from './PieChart/PieChart';
import PieChartWidget from './PieChart/PieChartWidget';

interface PieChartEntry extends PieDataItem {
  name: string;
  amount: CurrencyAmount;
}

export default function DivisionWidget() {
  const { t } = useTranslation();
  const depot = actor.value.depot;

  const { data: performance, isLoading } = usePortfolioQuery({
    queryFn: ActorService.getPerformance,
  });

  const currency = useUserProfile().profile?.flags.currency;

  const divisionEntriesClamper = useCallback(
    (remainingEntries: PieChartEntry[]): PieChartEntry => {
      const totalAmountOthers = remainingEntries.reduce((total, entry) => total + entry.amount.amount, 0);
      return {
        text: 'Others',
        id: 'others',
        name: t('actor.division.others'),
        value: totalAmountOthers,
        color: '#FFA5BA',
        amount: {
          amount: totalAmountOthers,
          unit: currency ?? 'EUR',
        },
      };
    },
    [currency],
  );

  const entries = useMemo(() => {
    const sortedEntries: PieChartEntry[] = [...(performance?.entries ?? [])]
      .sort((a, b) => b.amount - a.amount)
      .map(entry => ({
        amount: {
          amount: entry.amount,
          unit: currency ?? 'EUR',
        },
        text: depot?.securities[entry.isin]?.name ?? entry.name ?? '',
        id: entry.isin,
        name: depot?.securities[entry.isin]?.name ?? entry.name ?? '',
        value: entry.amount,
      }));

    // we don't want to show entries that are less than 1% of the total amount
    // but rather show them as "others" to enhance readability
    let maxToShow = sortedEntries.length;

    while (maxToShow > 0 && sortedEntries[maxToShow - 1].amount.amount / (performance?.totalAmount ?? 1) < 0.01) {
      maxToShow--;
    }

    if (maxToShow === sortedEntries.length - 1) maxToShow = sortedEntries.length;

    const result = clampArray(sortedEntries, maxToShow, divisionEntriesClamper);

    const baseHighest = 'rgb(46, 120, 119)';
    const baseLightest = 'rgb(154, 216, 215)';
    const hslBase = rgbToHsl(baseHighest);
    const hslLowest = rgbToHsl(baseLightest);
    return result.map((entry, index) => {
      const hsl = { ...hslBase };
      const ratio = index / result.length;
      hsl.l = (hslLowest.l - hslBase.l) * ratio + hslBase.l;
      const color = hsl.toString();

      return {
        ...entry,
        color,
      };
    });
  }, [performance]);

  return (
    <>
      <PieChartWidget
        data={entries}
        legendEntries={entries
          .slice(0, 5)
          .concat([entries.at(-1)!])
          .filter(Boolean)}
        title={t('actor.division.title')}
        ready={!isLoading}
        renderCenterLabel={() => (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{t('actor.division.totalAssets')}</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
              {t('currency', {
                amount: {
                  amount: performance?.totalAmount ?? 0,
                  unit: currency ?? 'EUR',
                  options: {
                    notation: 'compact',
                  },
                },
              })}
            </Text>
          </View>
        )}
        renderSelectedSegment={entry => (
          <>
            <SecurityIcon
              isin={entry.id}
              accessibilityLabel={entry.name}
              country={depot?.securities[entry.id]?.country ?? 'WW'}
              className="mr-2 w-5"
            />
            <Text className="flex-1 flex-wrap">
              {`${entry.name}: ${t('currency', {
                amount: {
                  amount: entry.amount?.amount ?? 0,
                  unit: entry.amount?.unit ?? 'EUR',
                  options: {
                    notation: 'compact',
                  },
                },
              })} (${t('percent', { value: entry.value / (performance?.totalAmount ?? 1) })})`}
            </Text>
          </>
        )}
        renderLegend={entry => (
          <>
            <SecurityIcon
              isin={entry.id}
              accessibilityLabel={entry.name}
              country={depot?.securities[entry.id]?.country ?? 'WW'}
              className="mr-2 w-5"
            />
            <Text className="flex-1 flex-wrap line-clamp-2">{`${entry.name}`}</Text>
          </>
        )}
      />
    </>
  );
}

import { useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useUserProfile } from '@/common/profile';
import { Text } from '@/components/base';
import usePortfolioQuery from '@/hooks/actor/useDepotQuery';
import { ActorService } from '@/services/actor.service';
import { CurrencyAmount, actor } from '@/signals/actor';
import { SecurityAccountSecurityType } from '@/types/secapi.types';
import { rgbToHsl } from '@/utils/strings';

import { PieDataItem } from './PieChart/PieChart';
import PieChartWidget from './PieChart/PieChartWidget';

interface PieChartEntry extends PieDataItem {
  name: string;
  amount: CurrencyAmount;
}

export default function AssetClassesWidget() {
  const { t } = useTranslation();
  const { data: performance, isLoading } = usePortfolioQuery({
    queryFn: ActorService.getPerformance,
  });
  const depot = actor.value.depot;
  const currency = useUserProfile().profile?.flags.currency;

  // entries are grouped by security type
  const entries: PieChartEntry[] = useMemo(() => {
    const entriesMap = new Map<SecurityAccountSecurityType, PieChartEntry>();
    performance?.entries.forEach(entry => {
      const sec = depot?.securities[entry.isin];
      const secType = sec?.type ?? SecurityAccountSecurityType.OTHER;
      const currentEntry = entriesMap.get(secType);
      if (currentEntry) {
        currentEntry.amount.amount += entry.amount;
        currentEntry.value += entry.amount;
      } else {
        entriesMap.set(secType, {
          id: secType.toString(),
          name: t('actor.assetClasses.secType.' + secType).toString(),
          amount: {
            amount: entry.amount,
            unit: currency,
          },
          value: entry.amount,
        });
      }
    });

    const baseHighest = 'rgb(46, 120, 119)';
    const baseLightest = 'rgb(154, 216, 215)';
    const hslBase = rgbToHsl(baseHighest);
    const hslLowest = rgbToHsl(baseLightest);
    const entriesArray = [...entriesMap.values()];
    const coloredEntries = entriesArray.map((entry: PieChartEntry, index: number) => {
      const hsl = { ...hslBase };
      const ratio = index / entriesArray.length;
      hsl.l = (hslLowest.l - hslBase.l) * ratio + hslBase.l;
      const color = hsl.toString();

      return {
        ...entry,
        color,
      };
    });

    return coloredEntries.sort((a, b) => b.amount.amount - a.amount.amount);
  }, [performance]);

  return (
    <PieChartWidget
      data={entries}
      title={t('actor.assetClasses.title')}
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
      )}
      renderLegend={entry => <Text className="flex-1 flex-wrap line-clamp-2">{`${entry.name}`}</Text>}
    />
  );
}

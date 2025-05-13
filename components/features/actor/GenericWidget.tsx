import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/base';
import usePortfolioQuery from '@/hooks/actor/useDepotQuery';
import { ActorService } from '@/services/actor.service';
import { PerformanceResponse } from '@/types/actor-api.types';
import { clampArray } from '@/utils/object';
import { rgbToHsl } from '@/utils/strings';

import { PieDataItem } from './PieChart/PieChart';
import PieChartWidget from './PieChart/PieChartWidget';
import { mockGraphql } from './mock-graphql';

type Config = {
  title: string;
  type: 'half-piechart';
  version: string;
  pluginVersion: string;
  meta: {
    author: string;
    description: string;
    tags: string[];
    created: string;
  };
  aggregation: Array<{
    type: string;
    queryText: string;
  }>;
  outputOptions: {
    centerText: string;
    entries: string;
    entryValue: string | number;
  };
};

type GenericWidgetProps = {
  config: Config;
};

const getAttribute = (data: any, path: string) => {
  if (!path.includes('$.')) return data;
  const keys = path.replace('$.', '').split('.');
  return keys.reduce((acc, key) => {
    return acc && acc[key] ? acc[key] : null;
  }, data);
};

export default function GenericWidget({ config }: GenericWidgetProps) {
  const { t } = useTranslation();
  const { data: _data } = usePortfolioQuery({
    queryFn: ActorService.getPerformance,
  });

  const { data, isLoading } = useQuery({
    queryFn: () =>
      mockGraphql
        .getQuery<PerformanceResponse>(config.aggregation[0].queryText, {}, { performance: _data })
        .then(res => res.data),
    queryKey: [config.aggregation[0].queryText!, _data],
    enabled: !!_data,
  });

  const dataEntries: PieDataItem[] = useMemo(() => {
    if (!data) return [];

    const dataAny = data as any;
    const entries: PieDataItem[] = (getAttribute(dataAny, config.outputOptions.entries) ?? [])
      .map((entry: any) => {
        const value =
          typeof config.outputOptions.entryValue === 'string'
            ? getAttribute(entry, config.outputOptions.entryValue)
            : config.outputOptions.entryValue;

        return {
          id: value,
          value: value,
        } as PieDataItem;
      })
      .sort((a: PieDataItem, b: PieDataItem) => {
        return b.value - a.value;
      });

    // we don't want to show entries that are less than 1% of the total amount
    // but rather show them as "others" to enhance readability
    let maxToShow = entries.length;
    const totalAmount = entries.reduce((total, entry) => total + entry.value, 0);
    while (maxToShow > 0 && entries[maxToShow - 1].value / totalAmount < 0.01) {
      maxToShow--;
    }

    if (maxToShow === entries.length - 1) maxToShow = entries.length;

    const result = clampArray(entries, maxToShow, remainingEntries => {
      const totalAmountOthers = remainingEntries.reduce((total, entry) => total + entry.value, 0);
      return {
        text: 'Others',
        id: 'others',
        name: t('actor.division.others'),
        value: totalAmountOthers,
        color: '#FFA5BA',
      } as PieDataItem;
    }).sort((a, b) => b.value - a.value);

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
  }, [data, config]);

  if (config.type === 'half-piechart') {
    const value = config.outputOptions.centerText.matchAll(/(\$\.[^,^"^ ]*)/g);
    let text = config.outputOptions.centerText;

    for (const match of value) {
      const value = getAttribute(data, match[0]);
      text = text.replaceAll(match[0], value);
    }

    return (
      <PieChartWidget
        title={config.title}
        ready={!isLoading && !!data}
        data={dataEntries}
        renderCenterLabel={() => (
          <Text h2 className="font-bold text-center">
            {t(text)}
          </Text>
        )}
      />
    );
  }
  return null;
}

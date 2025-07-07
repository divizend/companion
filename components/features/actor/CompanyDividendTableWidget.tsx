import React, { useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { ActorService } from '@/services/actor.service';
import { CompanyDividendData, DividendDisplayOption, SecurityAccountSecurity } from '@/types/actor-api.types';

import { Text } from '../../base';
import Widget from './Widget';

export default function CompanyDividendTableWidget({ security }: { security: SecurityAccountSecurity }) {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery<CompanyDividendData>({
    queryKey: ['companyDividendTable', security.isin],
    queryFn: () => ActorService.getCompanyDividendsHistory(security, DividendDisplayOption.ABSOLUTE),
    enabled: !!security.isin,
  });

  const grouped = useMemo(() => {
    if (!data?.dividends) return {};
    return data.dividends.reduce((acc: Record<string, typeof data.dividends>, div) => {
      const year = new Date(div.date).getFullYear();
      if (!acc[year]) acc[year] = [];
      acc[year].push(div);
      return acc;
    }, {});
  }, [data]);

  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));
    setExpandedYears(prev => {
      if (Object.keys(prev).length === 0) {
        const initial: Record<string, boolean> = {};
        years.forEach((year, idx) => {
          initial[year] = idx < 3;
        });
        return initial;
      }
      return prev;
    });
  }, [grouped]);

  const toggleYear = (year: string) => {
    setExpandedYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  const totalDividendsPerYear = useMemo(() => {
    const totals: Record<string, number> = {};
    if (data?.dividends) {
      data.dividends.forEach(div => {
        const year = new Date(div.date).getFullYear().toString();
        if (!totals[year]) totals[year] = 0;
        totals[year] += div.yield.amount;
      });
    }
    return totals;
  }, [data]);

  const yoyGrowth: Record<string, number | null> = useMemo(() => {
    const years = Object.keys(totalDividendsPerYear).sort((a, b) => Number(b) - Number(a));
    const growth: Record<string, number | null> = {};
    for (let i = 0; i < years.length - 1; i++) {
      const year = years[i];
      const prevYear = years[i + 1];
      const prevTotal = totalDividendsPerYear[prevYear];
      const currTotal = totalDividendsPerYear[year];
      if (prevTotal && currTotal) {
        growth[year] = currTotal / prevTotal - 1;
      } else {
        growth[year] = null;
      }
    }
    if (years.length > 0) {
      growth[years[years.length - 1]] = null;
    }
    return growth;
  }, [totalDividendsPerYear]);

  if (!data?.dividends?.length) return <></>;

  return (
    <Widget title={t('actor.dividendTableWidget.title')} ready={!isLoading}>
      <ScrollView horizontal>
        <View className="bg-primary-light dark:bg-primary-dark rounded-lg overflow-hidden min-w-[350]">
          <View className="flex-row px-3 py-2">
            <Text className="uppercase flex-1 font-bold text-xs">{t('actor.dividendTableWidget.exDate')}</Text>
            <Text className="uppercase flex-1 font-bold text-xs">{t('actor.dividendTableWidget.yoy')}</Text>
            <Text className="uppercase flex-1 font-bold text-xs text-right">
              {t('actor.dividendTableWidget.amount')}
            </Text>
          </View>
          {Object.keys(grouped)
            .sort((a, b) => Number(b) - Number(a))
            .map(year => (
              <View key={year}>
                <Pressable onPress={() => toggleYear(year)}>
                  <View className="flex-row bg-secondary-light dark:bg-secondary-dark px-3 py-2 items-center">
                    <Text className="flex-1 font-bold">{year}</Text>
                    <View
                      className={`px-2 py-0.5 rounded-md inline-flex items-center ${
                        !!yoyGrowth[year]
                          ? yoyGrowth[year] < 0
                            ? 'bg-red-100 dark:bg-red-900'
                            : 'bg-green-100 dark:bg-green-900'
                          : ''
                      }`}
                    >
                      {yoyGrowth[year] ? (
                        <Text
                          className={`font-bold ${
                            yoyGrowth[year] < 0
                              ? 'text-red-700 dark:text-red-300'
                              : 'text-green-700 dark:text-green-300'
                          }`}
                        >
                          {yoyGrowth[year] < 0 ? '↓' : '↑'}{' '}
                          {t('percent', {
                            value: {
                              value: Math.abs(yoyGrowth[year]),
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          })}
                        </Text>
                      ) : (
                        ''
                      )}
                    </View>
                    <Text className="flex-1 font-bold text-right">
                      {t('currency', {
                        amount: { amount: totalDividendsPerYear[year], unit: data?.dividends?.[0].yield.unit && 'EUR' },
                      })}
                    </Text>
                  </View>
                </Pressable>
                {expandedYears[year] &&
                  (grouped[year] as any[]).map((div: any, idx: number) => (
                    <View key={div.date + idx} className="flex-row px-3 py-2">
                      <Text className="flex-1 text-xs">{t('dateTime.day', { date: new Date(div.date) })}</Text>
                      <Text className="flex-1 text-xs"></Text>
                      <Text className="flex-1 text-xs text-right">
                        {t('currency', { amount: { amount: div.yield.amount, unit: div.yield.unit || 'EUR' } })}
                      </Text>
                    </View>
                  ))}
              </View>
            ))}
        </View>
      </ScrollView>
    </Widget>
  );
}

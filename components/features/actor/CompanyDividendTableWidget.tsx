import React, { useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

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

  const yieldMap = useMemo(() => {
    const map: Record<string, number | undefined> = {};
    if (data?.dividendYields) {
      data.dividendYields.forEach(y => {
        const dateKey = new Date(y.date).toISOString().slice(0, 10);
        map[dateKey] = y.dividendYield;
      });
    }
    return map;
  }, [data]);

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

  return (
    <Widget title={t('actor.dividendTableWidget.title')} ready={!isLoading}>
      <View className="bg-gray-100 rounded-lg overflow-hidden">
        <View className="flex-row px-3 py-2 border-b border-gray-200">
          <Text className="flex-1 font-bold text-xs">{t('actor.dividendTableWidget.exDate')}</Text>
          <Text className="flex-1 font-bold text-xs">{t('actor.dividendTableWidget.yield')}</Text>
          <Text className="flex-1 font-bold text-xs text-right">{t('actor.dividendTableWidget.amount')}</Text>
        </View>
        {Object.keys(grouped)
          .sort((a, b) => Number(b) - Number(a))
          .map(year => (
            <View key={year}>
              <Pressable onPress={() => toggleYear(year)}>
                <View className="flex-row bg-gray-200 px-3 py-2 items-center">
                  <Text className="flex-1 font-bold">{year}</Text>
                  <Text className="text-xs">{expandedYears[year] ? '▲' : '▼'}</Text>
                  <Text className="flex-1 font-bold text-right"></Text>
                </View>
              </Pressable>
              {expandedYears[year] &&
                (grouped[year] as any[]).map((div: any, idx: number) => {
                  const dateKey = new Date(div.date).toISOString().slice(0, 10);
                  const yieldValue = yieldMap[dateKey];
                  return (
                    <View key={div.date + idx} className="flex-row px-3 py-2 border-b border-gray-100">
                      <Text className="flex-1 text-xs">{t('dateTime.day', { date: new Date(div.date) })}</Text>
                      <Text className="flex-1 text-xs">
                        {yieldValue != null
                          ? t('percent', {
                              value: {
                                value: yieldValue,
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            })
                          : '-'}
                      </Text>
                      <Text className="flex-1 text-xs text-right">
                        {t('currency', { amount: { amount: div.yield.amount, unit: div.yield.unit || 'EUR' } })}
                      </Text>
                    </View>
                  );
                })}
            </View>
          ))}
      </View>
    </Widget>
  );
}

import React from 'react';

import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { CompanyDividendYield, DividendDisplayOption } from '@/types/actor-api.types';
import { SecurityAccountSecurity } from '@/types/secapi.types';

import usePortfolioQuery from '../../../hooks/actor/useDepotQuery';
import { ActorService } from '../../../services/actor.service';
import { Text } from '../../base';
import Widget from './Widget';

export type CompanyDividendYieldWidgetProps = {
  security: SecurityAccountSecurity;
};

export default function CompanyDividendYieldWidget({ security }: CompanyDividendYieldWidgetProps) {
  const { t } = useTranslation();

  // Fetch company performance data for next payment info

  const { data: performanceData, isLoading: performanceLoading } = usePortfolioQuery({
    queryKey: ['companyPerformance', security.isin],
    queryFn: () => ActorService.getCompanyPerformance(security),
    enabled: !!security.isin,
  });

  // Fetch dividend history data
  const { data: dividendData, isLoading: dividendLoading } = usePortfolioQuery({
    queryKey: ['companyDividendsHistory', security.isin],
    queryFn: () => ActorService.getCompanyDividendsHistory(security, DividendDisplayOption.YIELDS),
    enabled: !!security.isin,
  });

  // Get the most recent dividend yield
  const currentDividendYield = dividendData?.dividendYields
    ?.slice()
    .sort(
      (a: CompanyDividendYield, b: CompanyDividendYield) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )[0];

  const isLoading = performanceLoading || dividendLoading;

  return (
    <Widget
      title={t('actor.dividendYieldWidget.title')}
      ready={!isLoading}
      styles={{
        container: { minHeight: 180 },
      }}
    >
      <View className="gap-4">
        {/* Dividend Yield Display */}
        <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 min-h-[80px] flex flex-col justify-center">
          <Text className="text-4xl text-gray-700 dark:text-gray-200 font-extrabold">
            {currentDividendYield?.dividendYield
              ? t('percent', {
                  value: {
                    value: currentDividendYield.dividendYield,
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  },
                })
              : t('common.notAvailable')}
          </Text>
        </View>

        {/* Next Payment Display */}
        <View className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 min-h-[80px] flex flex-col justify-center">
          <Text className="text-gray-800 dark:text-gray-200 mb-2 font-medium text-sm">
            {t('actor.dividendYieldWidget.nextPayment')}
          </Text>
          <Text className="text-2xl text-gray-700 dark:text-gray-200 font-extrabold">
            {performanceData?.nextPayment?.date
              ? t('dateTime.day', {
                  date: performanceData.nextPayment.date,
                })
              : t('common.notAvailable')}
          </Text>
        </View>
      </View>
    </Widget>
  );
}

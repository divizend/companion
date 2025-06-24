import React from 'react';

import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';

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
    <Widget title={t('actor.dividendYieldWidget.title')} ready={!isLoading}>
      <View className="flex-1 justify-center gap-3">
        {/* Dividend Yield Display */}
        <View className="bg-gray-50 rounded-lg p-2 h-20 flex flex-col justify-center">
          <Text className="text-4xl text-gray-700 font-extrabold">
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
        <View className="bg-gray-50 rounded-lg p-2 h-20 flex flex-col justify-center">
          <Text className="text-gray-800 mb-1 font-medium text-sm">{t('actor.dividendYieldWidget.nextPayment')}</Text>
          <View className="flex flex-row justify-between items-end">
            <Text className="text-xl text-gray-700 font-extrabold">
              {performanceData?.nextPayment?.date
                ? t('dateTime.day', {
                    date: performanceData.nextPayment.date,
                  })
                : t('common.notAvailable')}
            </Text>
          </View>
        </View>
      </View>
    </Widget>
  );
}

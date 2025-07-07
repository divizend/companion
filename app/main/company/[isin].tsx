import React from 'react';

import { Icon } from '@rneui/themed';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';

import { apiGet } from '@/common/api';
import { Text } from '@/components/base';
import {
  CompanyDividendEvolutionWidget,
  CompanyDividendHistoryWidget,
  CompanyDividendTableWidget,
  CompanyDividendYieldWidget,
  CompanyIsinWknWidget,
  CompanyQuotesWidget,
  CompanySectorsWidget,
  CompanySharePriceWidget,
} from '@/components/features/actor';
import CompanyHeader from '@/components/widgets/CompanyHeader';
import useInitializeActor from '@/hooks/useInitializeActor';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ActorService } from '@/services/actor.service';
import { DividendDisplayOption, SecurityAccountSecurity } from '@/types/actor-api.types';
import { SecurityAccountSecurityType } from '@/types/secapi.types';

export default function StockDetails() {
  const { t } = useTranslation();
  const { isin } = useLocalSearchParams<{ isin: string }>();
  const theme = useThemeColor();
  useInitializeActor();

  const {
    data: stockDetails,
    isLoading,
    error,
  } = useQuery<SecurityAccountSecurity>({
    queryKey: ['stock', 'details', isin],
    queryFn: () => apiGet(`/actor/company/${isin}/EUR`),
    enabled: !!isin,
  });

  if (isLoading) {
    return (
      <View className="flex-1 dark:bg-primary-dark bg-primary-light justify-center items-center">
        <ActivityIndicator size="large" color={theme.theme} />
        <Text className="mt-2 text-gray-600 dark:text-gray-400">{t('common.loading')}</Text>
      </View>
    );
  }

  if (error || !stockDetails) {
    return (
      <View className="flex-1 dark:bg-primary-dark bg-primary-light justify-center items-center">
        <Text className="text-red-500">Failed to load stock details</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 dark:bg-primary-dark bg-primary-light">
      <View className="flex-row items-center px-4 py-2 gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Icon size={24} name="arrow-back" type="material" color={theme.theme} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold dark:text-white flex-1">{stockDetails.name || 'Stock Details'}</Text>
      </View>

      <ScrollView className="flex-1 px-4 mt-4">
        <CompanyHeader isin={isin} name={stockDetails.name} size="large" />
        <CompanyQuotesWidget
          queryKey={range => ['getCompanyPerformanceQuotes', isin, range.toString()]}
          useQuery={useQuery}
          queryFn={range => ActorService.getCompanyQuotes({ ...stockDetails, isin }, range)}
        />

        <CompanySharePriceWidget security={{ ...stockDetails, isin }} />
        <CompanyIsinWknWidget security={{ ...stockDetails, isin }} />
        <CompanyDividendYieldWidget security={{ ...stockDetails, isin, type: SecurityAccountSecurityType.STOCK }} />
        <CompanyDividendEvolutionWidget security={{ ...stockDetails, isin, type: SecurityAccountSecurityType.STOCK }} />
        <CompanyDividendHistoryWidget
          queryKey={() => ['getCompanyDividendsHistory', isin]}
          queryFn={() =>
            ActorService.getCompanyDividendsHistory({ ...stockDetails, isin }, DividendDisplayOption.ABSOLUTE)
          }
        />
        <CompanyDividendTableWidget security={{ ...stockDetails, isin }} />
        <CompanySectorsWidget security={{ ...stockDetails, isin }} />
      </ScrollView>
    </View>
  );
}

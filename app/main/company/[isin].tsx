import React from 'react';

import { Icon } from '@rneui/themed';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';

import { apiGet } from '@/common/api';
import { Text } from '@/components/base';
import { QuotesWidget } from '@/components/features/actor';
import BarChart from '@/components/features/actor/BarChart';
import CompanyHeader from '@/components/widgets/CompanyHeader';
import useInitializeActor from '@/hooks/useInitializeActor';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ActorService } from '@/services/actor.service';
import { DividendDisplayOption, SecurityAccountSecurity } from '@/types/actor-api.types';

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
      {/* Header */}
      <View className="flex-row items-center px-4 py-2 gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Icon size={24} name="arrow-back" type="material" color={theme.theme} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold dark:text-white flex-1">{stockDetails.name || 'Stock Details'}</Text>
      </View>

      <ScrollView className="flex-1 px-4 mt-4">
        {/* Company Header Widget */}
        <CompanyHeader isin={isin} name={stockDetails.name} size="large" />
        <QuotesWidget
          queryKey={range => ['getCompanyPerformanceQuotes', isin, range.toString()]}
          useQuery={useQuery}
          queryFn={range => ActorService.getCompanyQuotes({ ...stockDetails, isin }, range)}
        />

        <BarChart
          queryKey={() => ['getCompanyDividendsHistory', isin]}
          queryFn={() =>
            ActorService.getCompanyDividendsHistory({ ...stockDetails, isin }, DividendDisplayOption.ABSOLUTE)
          }
        />

        {/* Key Statistics */}
        {/* <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold dark:text-white mb-3">Key Statistics</Text>

          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600 dark:text-gray-400">Market Cap</Text>
              <Text className="dark:text-white">{stockDetails.marketCap || 'N/A'}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600 dark:text-gray-400">Volume</Text>
              <Text className="dark:text-white">{stockDetails.volume || 'N/A'}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600 dark:text-gray-400">P/E Ratio</Text>
              <Text className="dark:text-white">{stockDetails.peRatio || 'N/A'}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600 dark:text-gray-400">Dividend Yield</Text>
              <Text className="dark:text-white">{stockDetails.dividendYield || 'N/A'}</Text>
            </View>
          </View>
        </View> */}

        {/* Company Description */}
        {/* {stockDetails.description && (
          <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold dark:text-white mb-3">About</Text>
            <Text className="text-gray-700 dark:text-gray-300 leading-6">{stockDetails.description}</Text>
          </View>
        )} */}

        {/* Sector & Industry */}
        {/* <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm">
          <Text className="text-lg font-semibold dark:text-white mb-3">Classification</Text>

          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600 dark:text-gray-400">Sector</Text>
              <Text className="dark:text-white">{stockDetails.sector || 'N/A'}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600 dark:text-gray-400">Industry</Text>
              <Text className="dark:text-white">{stockDetails.industry || 'N/A'}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600 dark:text-gray-400">Country</Text>
              <Text className="dark:text-white">{stockDetails.country || 'N/A'}</Text>
            </View>
          </View>
        </View> */}
      </ScrollView>
    </View>
  );
}

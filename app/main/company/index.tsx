import React, { useCallback, useEffect, useState } from 'react';

import { Icon } from '@rneui/themed';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, TouchableOpacity, View } from 'react-native';

import { apiGet } from '@/common/api';
import { Text, TextInput } from '@/components/base';
import { useThemeColor } from '@/hooks/useThemeColor';

const searchCompanies = async (query: string): Promise<any[]> => {
  const response = await apiGet('/securities', { query });
  return response || [];
};

export default function Company({}) {
  const { t } = useTranslation();
  const theme = useThemeColor();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['companies', 'search', searchQuery],
    queryFn: () => searchCompanies(searchQuery),
    enabled: searchQuery.trim().length > 2,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
    }, 500),
    [],
  );

  const handleSearchChange = (text: string) => {
    debouncedSearch(text);
  };

  const renderResultItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="p-4 border-b border-gray-200 dark:border-gray-700"
      onPress={() => {
        router.push(`/main/company/${item.isin}`);
      }}
    >
      <Text className="text-lg font-semibold dark:text-white">{item.name}</Text>
      <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.isin}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 dark:bg-primary-dark bg-primary-light">
      <View className="flex-row items-center px-4 py-2 gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Icon size={24} name="arrow-back" type="material" color={theme.theme} />
        </TouchableOpacity>

        <TextInput
          className="flex-1 text-base dark:text-white"
          placeholder={t('common.search.placeholder')}
          placeholderTextColor={theme.style === 'light' ? '#666' : '#999'}
          autoFocus
          onChangeText={handleSearchChange}
        />

        <View style={{ width: 24 }} />
      </View>

      {searchQuery.trim().length > 2 && (
        <View className="flex-1">
          <View className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              {t('common.search.showingResults', { query: searchQuery })}
            </Text>
          </View>

          {isSearching && (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color={theme.theme} />
              <Text className="mt-2 text-gray-600 dark:text-gray-400">{t('common.search.searching')}</Text>
            </View>
          )}

          {!isSearching && searchResults.length > 0 && (
            <FlatList
              data={searchResults}
              renderItem={renderResultItem}
              keyExtractor={item => item.isin.toString()}
              className="flex-1"
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="none"
            />
          )}

          {!isSearching && searchResults.length === 0 && searchQuery.trim().length > 2 && (
            <View className="flex-1 justify-center items-center">
              <Text className="text-gray-600 dark:text-gray-400">{t('common.search.noResults')}</Text>
            </View>
          )}
        </View>
      )}

      {searchQuery.trim().length <= 2 && (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-600 dark:text-gray-400">{t('common.search.startTyping')}</Text>
        </View>
      )}
    </View>
  );
}

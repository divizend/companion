import React, { useState } from 'react';

import { Icon } from '@rneui/themed';
import { TouchableOpacity, View } from 'react-native';

import { Text } from '@/components/base';
import { useThemeColor } from '@/hooks/useThemeColor';

import { SelectModal, SelectableItem } from '../base/SelectModal';

// Example data types
interface Portfolio extends SelectableItem {
  id: string;
  label: string;
  balance: number;
  currency: string;
}

interface AssetClass extends SelectableItem {
  id: string;
  label: string;
  color: string;
  allocation: number;
}

interface Country extends SelectableItem {
  id: string;
  label: string;
  code: string;
  flag: string;
}

// Sample data
const PORTFOLIOS: Portfolio[] = [
  { id: '1', label: 'Scalable Capital', balance: 48609.35, currency: 'EUR' },
  { id: '2', label: 'Trade Republic', balance: 23450.78, currency: 'EUR' },
  { id: '3', label: 'Interactive Brokers', balance: 67890.12, currency: 'USD' },
  { id: '4', label: 'Vanguard', balance: 34567.89, currency: 'USD' },
  { id: '5', label: 'Fidelity', balance: 12345.67, currency: 'USD' },
];

const ASSET_CLASSES: AssetClass[] = [
  { id: '1', label: 'Stocks', color: '#3939ff', allocation: 65 },
  { id: '2', label: 'Bonds', color: '#39c739', allocation: 20 },
  { id: '3', label: 'Cash', color: '#c73939', allocation: 10 },
  { id: '4', label: 'Real Estate', color: '#c7c739', allocation: 5 },
];

const COUNTRIES: Country[] = [
  { id: '1', label: 'United States', code: 'US', flag: '🇺🇸' },
  { id: '2', label: 'Germany', code: 'DE', flag: '🇩🇪' },
  { id: '3', label: 'France', code: 'FR', flag: '🇫🇷' },
  { id: '4', label: 'Japan', code: 'JP', flag: '🇯🇵' },
  { id: '5', label: 'United Kingdom', code: 'GB', flag: '🇬🇧' },
];

export const SelectModalExamples = () => {
  const theme = useThemeColor();
  const [selectedPortfolios, setSelectedPortfolios] = useState<Portfolio[]>([]);
  const [selectedAssetClass, setSelectedAssetClass] = useState<AssetClass[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [customPortfolio, setCustomPortfolio] = useState<Portfolio[]>([PORTFOLIOS[0]]);

  // Calculate total balance whenever selected portfolios change
  React.useEffect(() => {
    const total = selectedPortfolios.reduce((sum, portfolio) => sum + portfolio.balance, 0);
    setTotalBalance(total);
  }, [selectedPortfolios]);

  // Handle asset class selection with allocation validation
  const handleAssetClassSelect = (items: AssetClass[]) => {
    const totalAllocation = items.reduce((sum, item) => sum + item.allocation, 0);

    if (totalAllocation > 100) {
      // In a real app, you might use a toast or alert here
      console.warn('Total allocation exceeds 100%');
    }

    setSelectedAssetClass(items);
  };

  // Demo function to show what you might do with country selection
  const handleCountrySelect = (items: Country[]) => {
    setSelectedCountry(items);

    // Example of side effect after selection
    if (items.length > 0) {
      // In a real app, you might fetch data for the selected country
      console.log(`Selected country: ${items[0].label} (${items[0].code})`);
    }
  };

  return (
    <View className="p-4 gap-8">
      <Text h1 className="mb-5">
        Select Modal Examples
      </Text>

      {/* Basic Portfolio Selector with Summary */}
      <View>
        <Text className="mb-2 font-medium">Portfolios (Multiple Selection)</Text>
        <SelectModal
          items={PORTFOLIOS}
          selectedItems={selectedPortfolios}
          onSelect={setSelectedPortfolios}
          modalTitle="Portfolio auswählen"
          placeholder="Select portfolios"
          searchPlaceholder="Search portfolios"
          noResultsText="No portfolios found"
        />

        {selectedPortfolios.length > 0 ? (
          <View className="mt-2 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <Text className="font-medium mb-1">Selected Portfolios:</Text>
            {selectedPortfolios.map(portfolio => (
              <View key={portfolio.id} className="flex-row justify-between py-1">
                <Text>{portfolio.label}</Text>
                <Text className="text-gray-500">
                  {portfolio.balance.toFixed(2)} {portfolio.currency}
                </Text>
              </View>
            ))}
            <View className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-700">
              <View className="flex-row justify-between">
                <Text className="font-bold">Total Balance:</Text>
                <Text className="font-bold">
                  {totalBalance.toFixed(2)} {selectedPortfolios[0]?.currency}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <Text className="mt-2 text-gray-500">No portfolios selected</Text>
        )}
      </View>

      {/* Asset Class Selector with Custom Rendering and Validation */}
      <View>
        <Text className="mb-2 font-medium">Asset Classes (With Allocation)</Text>
        <SelectModal
          items={ASSET_CLASSES}
          selectedItems={selectedAssetClass}
          onSelect={handleAssetClassSelect}
          modalTitle="Select Asset Classes"
          multiple={true}
          renderItem={(item, isSelected, onPress) => (
            <TouchableOpacity
              onPress={onPress}
              className={`flex-row items-center justify-between py-3 px-3 mb-1 rounded-lg ${
                isSelected ? 'bg-gray-100 dark:bg-gray-800' : ''
              }`}
            >
              <View className="flex-row items-center">
                <View style={{ backgroundColor: item.color }} className="w-5 h-5 rounded-full mr-2" />
                <Text>{item.label}</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="mr-2 text-gray-500">{item.allocation}%</Text>
                {isSelected && <Text className="text-blue-500 font-bold">✓</Text>}
              </View>
            </TouchableOpacity>
          )}
        />

        {selectedAssetClass.length > 0 && (
          <View className="mt-2">
            <View className="h-6 flex-row rounded-full overflow-hidden">
              {selectedAssetClass.map(assetClass => (
                <View
                  key={assetClass.id}
                  style={{
                    backgroundColor: assetClass.color,
                    width: `${assetClass.allocation}%`,
                  }}
                />
              ))}
            </View>
            <Text className="text-center text-xs mt-1 text-gray-500">
              Total allocation: {selectedAssetClass.reduce((sum, item) => sum + item.allocation, 0)}%
            </Text>
          </View>
        )}
      </View>

      {/* Country Selector with Custom Display */}
      <View>
        <Text className="mb-2 font-medium">Country (Single Selection)</Text>
        <SelectModal
          items={COUNTRIES}
          selectedItems={selectedCountry}
          onSelect={handleCountrySelect}
          modalTitle="Select Country"
          renderItem={(item, isSelected, onPress) => (
            <TouchableOpacity
              onPress={onPress}
              className={`flex-row items-center justify-between py-3 px-3 mb-1 rounded-lg ${
                isSelected ? 'bg-gray-100 dark:bg-gray-800 border border-blue-400' : ''
              }`}
            >
              <View className="flex-row items-center">
                <Text className="mr-2 text-xl">{item.flag}</Text>
                <Text style={{ fontWeight: isSelected ? '600' : 'normal' }}>{item.label}</Text>
              </View>
              {isSelected && <Icon name="check" type="material" size={20} color={theme.theme} />}
            </TouchableOpacity>
          )}
        />

        {selectedCountry.map(country => (
          <View className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex-row items-center">
            <Text className="text-2xl mr-3">{country.flag}</Text>
            <View>
              <Text className="font-bold">{country.label}</Text>
              <Text className="text-gray-500">Country code: {country.code}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Styled Example with Pre-selected Value */}
      <View>
        <Text className="mb-2 font-medium">Pre-selected Example</Text>
        <SelectModal
          items={PORTFOLIOS}
          selectedItems={customPortfolio}
          onSelect={setCustomPortfolio}
          className="border-2 border-blue-400 dark:border-blue-600"
          placeholder="Select your main portfolio"
          multiple={false}
          renderItem={(item, isSelected, onPress) => (
            <TouchableOpacity
              onPress={onPress}
              className={`flex-row items-center justify-between py-3 px-3 mb-1 rounded-lg ${
                isSelected ? 'bg-blue-50 dark:bg-blue-900 border border-blue-400' : ''
              }`}
            >
              <View>
                <Text>{item.label}</Text>
                <Text className="text-xs text-gray-500">ID: {item.id}</Text>
              </View>
              <View className="items-end">
                <Text className="font-medium">
                  {item.balance.toFixed(2)} {item.currency}
                </Text>
                {isSelected && <Text className="text-xs text-blue-500">Primary Portfolio</Text>}
              </View>
            </TouchableOpacity>
          )}
        />

        {customPortfolio.length > 0 && (
          <View className="mt-2 flex-row justify-between items-center">
            <Text className="text-gray-500">Main portfolio:</Text>
            <Text className="font-medium">{customPortfolio[0].label}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

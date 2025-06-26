import React, { useState } from 'react';

import { Image, View } from 'react-native';

import { Text } from '@/components/base';
import { useThemeColor } from '@/hooks/useThemeColor';

import CopyableString from '../base/CopyableString';
import Widget from '../features/actor/Widget';

interface CompanyHeaderProps {
  name: string;
  isin: string;
  size?: 'small' | 'medium' | 'large';
}

export default function CompanyHeader({ name, isin, size = 'medium' }: CompanyHeaderProps) {
  const theme = useThemeColor();
  const [imageError, setImageError] = useState(false);

  const sizeConfig = {
    small: {
      logoSize: 32,
      nameSize: 'text-sm',
      containerPadding: 'p-3',
    },
    medium: {
      logoSize: 48,
      nameSize: 'text-lg',
      containerPadding: 'p-4',
    },
    large: {
      logoSize: 64,
      nameSize: 'text-xl',
      containerPadding: 'p-5',
    },
  };

  const config = sizeConfig[size];

  const getLogoUrl = (isin: string) => {
    return `https://actor-static.divizend.com/actor/logo/${isin}.png`;
  };

  const getCountryFlagUrl = (isin: string) => {
    const countryCode = isin.substring(0, 2).toUpperCase();
    return `https://divizend.com/flags/${countryCode}.png`;
  };

  return (
    <Widget ready>
      <View className="flex-row items-center gap-3">
        {/* Company Logo */}
        <View className="justify-center items-center">
          {isin ? (
            <Image
              source={{ uri: imageError ? getCountryFlagUrl(isin) : getLogoUrl(isin) }}
              style={{
                width: config.logoSize,
                height: config.logoSize,
              }}
              onError={() => setImageError(true)}
            />
          ) : (
            <View
              style={{
                width: config.logoSize,
                height: config.logoSize,
                backgroundColor: theme.theme,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                className={`font-bold text-white ${
                  size === 'small' ? 'text-xs' : size === 'medium' ? 'text-sm' : 'text-base'
                }`}
              >
                {name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-1">
          <Text className={`font-semibold dark:text-white ${config.nameSize} pl-2`}>{name}</Text>
          <Text
            className="text-sm mr-2"
            style={{
              color: theme.muted,
            }}
          >
            <CopyableString>{isin}</CopyableString>
          </Text>
        </View>
      </View>
    </Widget>
  );
}

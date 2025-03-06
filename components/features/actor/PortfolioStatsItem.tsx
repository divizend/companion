import React from 'react';

import { View } from 'react-native';

import { useUserProfile } from '@/common/profile';
import { Text } from '@/components/base';
import { useThemeColor } from '@/hooks/useThemeColor';
import { t } from '@/i18n';

export type PortfolioStatsItemProps = {
  title: string;
  value?: {
    amount: number;
    unit: string;
  };
  extraInfo?: React.ReactNode;
};

export default function PortfolioStatsItem({ title, value, extraInfo }: PortfolioStatsItemProps) {
  const theme = useThemeColor();
  const unit = useUserProfile().profile?.flags.currency;

  return (
    <View className="mb-2 gap-3 flex flex-1 justify-between">
      <Text style={{ color: theme.muted }}>{title}</Text>
      <View className="flex flex-row justify-between items-end">
        <Text className="text-2xl font-bold">
          {t('currency', {
            amount: {
              amount: value?.amount ?? 0,
              unit: value?.unit ?? unit,
              options: {
                notation: 'compact',
              },
            },
          })}
        </Text>
        {!!extraInfo && <Text style={{ color: theme.muted, fontSize: 12, marginBottom: 3 }}>{extraInfo}</Text>}
      </View>
    </View>
  );
}

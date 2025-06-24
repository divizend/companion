import React, { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useUserProfileQuery } from '../../../common/queries';
import { ActorService } from '../../../services/actor.service';
import { SecurityAccountSecurity } from '../../../types/actor-api.types';
import { Text } from '../../base';
import Widget from './Widget';

export type CompanySharePriceWidgetProps = {
  security: SecurityAccountSecurity;
};

export default function CompanySharePriceWidget({ security }: CompanySharePriceWidgetProps) {
  const { t } = useTranslation();
  const { data: profile } = useUserProfileQuery();
  const currency = profile?.flags.currency;

  const { data, isLoading } = useQuery({
    queryKey: ['companyPerformance', security.isin, currency],
    queryFn: () => ActorService.getCompanyPerformance(security, currency),
    enabled: !!security.isin,
  });

  const displayValue = useMemo(() => {
    return data?.quote?.price
      ? t('currency', {
          amount: {
            amount: data.quote.price ?? 0,
            unit: data?.quote?.currency ?? currency,
            options: {
              notation: data.quote.price.toString().length > 6 ? 'compact' : undefined,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            },
          },
        })
      : t('actor.sharePriceWidget.noData');
  }, [data, currency, t]);
  return (
    <Widget title={t('actor.sharePriceWidget.title')} ready={!isLoading}>
      <View className="rounded-lg p-2 flex-1 justify-center items-center">
        <Text
          className={`text-gray-700 font-extrabold ${displayValue.length < 6 ? 'text-5xl' : 'text-4xl'}`}
          style={{ textAlign: 'center' }}
        >
          {displayValue}
        </Text>
      </View>
    </Widget>
  );
}

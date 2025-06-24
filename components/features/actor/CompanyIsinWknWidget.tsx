import React from 'react';

import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ActorService } from '../../../services/actor.service';
import { actor } from '../../../signals/actor';
import { DisplayValue, SecurityAccountSecurity } from '../../../types/actor-api.types';
import SecurityIcon from '../../SecurityIcon';
import { Text } from '../../base';
import Widget from './Widget';

type InformationDisplayProps = {
  title: string;
  value?: string;
};

function InformationDisplay({ title, value }: InformationDisplayProps) {
  return (
    <View className="bg-gray-50 rounded-lg p-3 min-h-[56px]">
      <Text className="text-gray-500 mb-1 font-medium text-xs">{title}</Text>
      <View className="flex-row justify-between items-end">
        <Text className="text-sm text-gray-700 font-black">{value}</Text>
      </View>
    </View>
  );
}

export type CompanyIsinWknWidgetProps = {
  security: SecurityAccountSecurity;
};

export default function CompanyIsinWknWidget({ security }: CompanyIsinWknWidgetProps) {
  const { t } = useTranslation();
  const actorState = actor.value;
  const settings = actorState?.settings;

  const { data, isLoading } = useQuery({
    queryKey: ['companyPerformance', security.isin],
    queryFn: () => ActorService.getCompanyPerformance(security),
    enabled: !!security.isin,
  });
  //   const SettingsModalComponent = useActorSettingsModal([createIsinWknDisplayField()], t('actor:company.isinWknWidget.title'));

  const isCountryName = /^[a-zA-Z]/.test(security.country);

  const getLabel = (displayValue: DisplayValue) =>
    displayValue === DisplayValue.WKN ? t('actor.isinWknWidget.wkn') : t('actor.isinWknWidget.valor');

  const getValue = (displayValue: DisplayValue) =>
    displayValue === DisplayValue.WKN
      ? data?.wkn
        ? data?.wkn
        : t('common:notAvailable')
      : data?.valor
        ? data?.valor
        : t('common:notAvailable');

  return (
    <Widget
      title={t('actor.isinWknWidget.title')}
      ready={!isLoading}
      //   settings={
      //     <Pressable onPress={() => showCustom(SettingsModalComponent)}>
      //       <Icon name="settings" type="material" color="gray" size={24} />
      //     </Pressable>
      //   }
    >
      <View className="flex-col gap-3">
        <View className="p-2">
          <View className="flex-row gap-1 items-center">
            <SecurityIcon isin={security.isin} country={security.country} style={{ height: 25, width: 25 }} />
            <Text className=" text-gray-700 font-black flex-1" numberOfLines={1}>
              {isCountryName ? t(`country.${security.country}`) : security.country}
            </Text>
          </View>
        </View>

        <InformationDisplay title={t('actor.isinWknWidget.isin')} value={security.isin} />

        {settings?.isinWknWidget?.displayValue && (
          <InformationDisplay
            title={getLabel(settings.isinWknWidget.displayValue)}
            value={getValue(settings.isinWknWidget.displayValue)}
          />
        )}
      </View>
    </Widget>
  );
}

import React from 'react';

import { useSignals } from '@preact/signals-react/runtime';
import { Icon } from '@rneui/themed';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, View } from 'react-native';

import { showCustom } from '@/components/global/prompt';

import { ActorService } from '../../../services/actor.service';
import { actor } from '../../../signals/actor';
import { DisplayValue, SecurityAccountSecurity } from '../../../types/actor-api.types';
import { Text } from '../../base';
import { createIsinWknDisplayField, useActorSettingsModal } from './ActorSettingsModal';
import Widget from './Widget';

type InformationDisplayProps = {
  title: string;
  value?: string;
};

function InformationDisplay({ title, value }: InformationDisplayProps) {
  return (
    <View className=" dark:bg-primary-dark bg-primary-light rounded-lg p-3 min-h-[56px]">
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
  useSignals();
  const { t } = useTranslation();
  const actorState = actor.value;
  const settings = actorState?.settings;

  const { data, isLoading } = useQuery({
    queryKey: ['companyPerformance', security.isin],
    queryFn: () => ActorService.getCompanyPerformance(security),
    enabled: !!security.isin,
  });

  const isCountryName = /^[a-zA-Z]/.test(security.country);
  const getLabel = (displayValue: DisplayValue) =>
    displayValue === DisplayValue.WKN ? t('actor.isinWknWidget.wkn') : t('actor.isinWknWidget.valor');

  const getValue = (displayValue: DisplayValue) =>
    displayValue === DisplayValue.WKN
      ? data?.wkn
        ? data?.wkn
        : t('common.notAvailable')
      : data?.valor
        ? data?.valor
        : t('common.notAvailable');

  const SettingsModalComponent = useActorSettingsModal([createIsinWknDisplayField()]);
  return (
    <Widget
      title={t('actor.isinWknWidget.title')}
      ready={!isLoading}
      settings={
        <Pressable onPress={() => showCustom(SettingsModalComponent)}>
          <Icon name="settings" type="material" color="gray" size={24} />
        </Pressable>
      }
    >
      <View className="flex-col gap-3">
        <View className="flex-row p-2 gap-1 items-center">
          <Image
            source={{ uri: `https://divizend.com/flags/${security.country.toUpperCase()}.png` }}
            style={{ height: 25, width: 25 }}
            className="rounded-md"
            resizeMode="contain"
          />
          <Text className=" text-gray-700 font-black flex-1" numberOfLines={1}>
            {isCountryName ? t(`country.${security.country}`) : security.country}
          </Text>
        </View>
        <InformationDisplay title={t('actor.isinWknWidget.isin')} value={security.isin} />
        <InformationDisplay
          title={getLabel(settings?.isinWknWidget?.displayValue || DisplayValue.WKN)}
          value={getValue(settings?.isinWknWidget?.displayValue || DisplayValue.WKN)}
        />
      </View>
    </Widget>
  );
}

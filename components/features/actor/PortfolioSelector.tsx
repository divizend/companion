import React from 'react';

import { Icon } from '@rneui/base';
import { capitalize } from 'lodash';
import { useTranslation } from 'react-i18next';
import { TouchableOpacity, View } from 'react-native';

import { clsx } from '@/common/clsx';
import { useUserProfileQuery } from '@/common/queries';
import { Text } from '@/components/base';
import { SelectModal } from '@/components/base/SelectModal';
import { BankParentIcon } from '@/components/features/portfolio-overview/BankParentIcon';
import { useThemeColor } from '@/hooks/useThemeColor';
import { actor } from '@/signals/actor';

interface PortfolioSelectorProps {
  className?: string;
}

export const PortfolioSelector: React.FC<PortfolioSelectorProps> = ({ className = '' }) => {
  const theme = useThemeColor();
  const { t } = useTranslation();
  const { data } = useUserProfileQuery();
  const depots = data?.depots ?? [];

  return (
    <SelectModal
      className={`${className}`}
      items={depots}
      labelExtractor={depot => depot.bankName ?? 'Depot'}
      label={actor.value.depotIds === 'all' ? t('actor.portfolioSelector.all') : undefined}
      modalTitle={t('actor.portfolioSelector.select')}
      selectedItems={
        depots?.filter(depot => actor.value.depotIds.includes(depot.id) || actor.value.depotIds === 'all') ?? []
      }
      onSelect={items => {
        if (items.length === 0) {
          actor.value = {
            ...actor.value,
            depotIds: 'all',
          };
          return;
        }
        actor.value = {
          ...actor.value,
          depotIds: items.map(item => item.id),
        };
      }}
      renderItem={(depot, isSelected, onPress) => (
        <TouchableOpacity
          onPress={onPress}
          className={clsx('flex-row items-center py-2 px-3 mb-1 rounded-xl gap-4 border border-transparent')}
          style={{
            backgroundColor: isSelected ? theme.backgroundSecondary : 'transparent',
            borderColor: isSelected ? theme.selectedBorder : 'transparent',
          }}
        >
          <BankParentIcon bankParent={depot.bankType} size={30} />
          <View>
            <Text h4>{capitalize(depot.bankName)}</Text>
            <Text className="text-xs">{depot.number}</Text>
          </View>
          <View className="items-end ml-auto">
            {isSelected && <Icon name="check" type="material" size={20} color={theme.selectedBorder} />}
          </View>
        </TouchableOpacity>
      )}
    />
  );
};

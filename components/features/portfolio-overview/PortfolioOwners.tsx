import React from 'react';

import { Text } from 'react-native';

import { UserProfile, useUserProfile } from '@/common/profile';
import { t } from '@/i18n';
import { UserProfileDepot } from '@/types/depot.types';
import { getEntityName } from '@/utils/entities';

const mapDepotOwnersToStrings = ({ depot, profile }: { depot: UserProfileDepot; profile: UserProfile }): string[] => {
  return depot.ownerLists.map(
    l =>
      `${l.owners
        .map(o => {
          const sEntity = profile.legalEntities.find(e => e.id === o.legalEntityId);
          if (!sEntity) return o.legalEntityId;
          const name = getEntityName(sEntity);
          return name;
        })
        .join(' + ')} (${t('common.percent', { value: `${l.shareOwned * 100}` })})`,
  );
};

const PortfolioOwners = ({ depotId }: { depotId: string }) => {
  const { profile } = useUserProfile();
  if (!profile) return null;

  const depot = profile.depots.find(d => d.id === depotId);
  if (!depot) return null;

  return <Text style={{ fontWeight: '700' }}>{mapDepotOwnersToStrings({ depot, profile }).join(', ')}</Text>;
};

export const usePortfolioOwners = (depotId: string): string[] | null => {
  const { profile } = useUserProfile();
  if (!profile) return null;

  const depot = profile.depots.find(d => d.id === depotId);
  if (!depot) return null;

  return mapDepotOwnersToStrings({ depot, profile });
};

export default PortfolioOwners;

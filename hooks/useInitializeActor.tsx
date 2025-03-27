import { useQuery } from '@tanstack/react-query';

import { useUserProfileQuery } from '@/common/queries';
import SocketHandler from '@/socket/socket-handler';

import { initializeActor, loadDepot, loadDepotSuccess, setActorLoadingState } from '../signals/actions/actor.actions';
import { LoadingState, actor } from '../signals/actor';

export default function useInitializeActor() {
  const { data: profile } = useUserProfileQuery();
  const currency = profile?.flags.currency;
  const depotIds = actor.value.depotIds;

  return useQuery({
    queryKey: [
      'actor.initialize',
      currency,
      ...(Array.isArray(depotIds) ? depotIds : [depotIds, profile?.depots?.length]),
    ],
    queryFn: async () => {
      setActorLoadingState(LoadingState.AGGREGATING);

      SocketHandler.connect();
      const depot = await loadDepot(depotIds === 'all' ? undefined : depotIds);

      if (!depot) return depot;

      setActorLoadingState(LoadingState.INITIALIZING);
      await initializeActor({ ...depot, currency: currency });
      setActorLoadingState(LoadingState.LOADING_WIDGETS);

      loadDepotSuccess(depot);

      return depot;
    },
  });
}

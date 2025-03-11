import { DefaultError, QueryKey, useQuery } from '@tanstack/react-query';

import { useUserProfileQuery } from '@/common/queries';
import { initializeActor } from '@/signals/actions/actor.actions';
import { actor } from '@/signals/actor';

type UseQueryOptions<TQueryFnData = unknown, TError = DefaultError> = Parameters<
  typeof useQuery<TQueryFnData, TError>
>[0];

type UseQueryOptionsCustom<TQueryFnData = unknown, TError = DefaultError> = Omit<
  UseQueryOptions<TQueryFnData, TError>,
  'queryKey'
> & { queryKey?: QueryKey };

export default function usePortfolioQuery<TQueryFnData = unknown, TError = DefaultError>(
  options: UseQueryOptionsCustom<TQueryFnData, TError>,
) {
  const { data: profile } = useUserProfileQuery();
  const depot = actor.value.depot;
  const currency = profile?.flags.currency;

  return useQuery<TQueryFnData, TError>({
    retryDelay: 1000,
    retry: (failureCount, error: any) => {
      if (error.message === 'actor-initialization-required' && depot) {
        initializeActor({ ...depot, currency: currency });
      }

      return failureCount < 3;
    },
    ...options,
    queryKey: [
      depot?.id,
      actor.value.lastInitialized,
      ...[typeof options.queryFn === 'function' ? [options.queryFn.name] : []],
      ...(Array.isArray(options.queryKey) ? options.queryKey : [options]),
    ],
    queryFn: depot?.id ? options.queryFn : undefined,
  });
}

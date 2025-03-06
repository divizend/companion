import { DefaultError, useQuery } from '@tanstack/react-query';

import { actor } from '@/signals/actor';

type UseQueryOptions<TQueryFnData = unknown, TError = DefaultError> = Parameters<
  typeof useQuery<TQueryFnData, TError>
>[0];

type UseQueryOptionsCustom<TQueryFnData = unknown, TError = DefaultError> = Omit<
  UseQueryOptions<TQueryFnData, TError>,
  'queryKey'
> & { queryKey?: Pick<UseQueryOptions<TQueryFnData, TError>, 'queryKey'> };

export default function usePortfolioQuery<TQueryFnData = unknown, TError = DefaultError>(
  options: UseQueryOptionsCustom<TQueryFnData, TError>,
) {
  const depot = actor.value.depot;

  return useQuery<TQueryFnData, TError>({
    ...options,
    queryKey: [
      depot?.id,
      ...[typeof options.queryFn === 'function' ? [options.queryFn.name] : []],
      ...(Array.isArray(options.queryKey) ? options.queryKey : [options]),
    ],
    queryFn: depot?.id ? options.queryFn : undefined,
  });
}

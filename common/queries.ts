import { useFetch } from './api';
import { UserProfile } from './profile';

export function useUserProfileQuery() {
  return useFetch<UserProfile>('userProfile', '/users/me', {
    refetchInterval: 60_000, // Refetch every 5 minutes
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
}

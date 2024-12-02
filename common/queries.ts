import { useFetch } from './api';
import { UserProfile } from './profile';

export function useUserProfileQuery() {
  return useFetch<UserProfile>('userProfile', '/users/me');
}

import { useFetch } from '@/common/api';

export type WaitlistStatusResponse = {
  waitingForPoints: number;
  spotsReserved: number;
  unreservedSpots: number;
};

export function useWaitlistStatus() {
  return useFetch<WaitlistStatusResponse>('waitlist-status', '/waitlist-status');
}

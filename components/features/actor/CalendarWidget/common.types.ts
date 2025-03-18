import dayjs from 'dayjs';

import {
  CalendarDayDividend,
  SecurityAccountSecuritySplit,
  SecurityAccountSecurityTransaction,
} from '@/types/actor-api.types';

export enum CalendarDayEventType {
  DIVIDEND = 'DIVIDEND',
  TRANSACTION = 'TRANSACTION',
  SPLIT = 'SPLIT',
}

export type CalendarDayEventBase = {
  isin: string;
  name: string;
};

export type CalendarDayEvent = (
  | {
      type: CalendarDayEventType.DIVIDEND;
      dividend: CalendarDayDividend;
    }
  | {
      type: CalendarDayEventType.TRANSACTION;
      transaction: SecurityAccountSecurityTransaction;
    }
  | {
      type: CalendarDayEventType.SPLIT;
      split: SecurityAccountSecuritySplit;
    }
) &
  CalendarDayEventBase;

export type EventsCalendarDay = {
  date: dayjs.Dayjs;
  events: CalendarDayEvent[];
};

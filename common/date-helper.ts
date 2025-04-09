import dayjs, { ConfigType, Dayjs } from 'dayjs';
import dayjsCustomParseFormat from 'dayjs/plugin/customParseFormat';
import dayjsIsSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import dayjsIsSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import dayjsIsoWeek from 'dayjs/plugin/isoWeek';
import dayjsTimezone from 'dayjs/plugin/timezone';
import dayjsUtc from 'dayjs/plugin/utc';

dayjs.extend(dayjsCustomParseFormat);
dayjs.extend(dayjsIsSameOrAfter);
dayjs.extend(dayjsIsSameOrBefore);
dayjs.extend(dayjsUtc);
dayjs.extend(dayjsIsoWeek);
dayjs.extend(dayjsTimezone);

export function date(config?: string | Date | Dayjs, format?: string): dayjs.Dayjs {
  return dayjs.utc(config, format);
}

export function dateWithTimeZone(config: ConfigType, format: string, timezone: string): dayjs.Dayjs {
  return dayjs.tz(config, format, timezone);
}

export function convertDateToISOString(date: dayjs.Dayjs): string {
  return date.format('YYYY-MM-DD');
}

export function convertDateToGermanString(date: dayjs.Dayjs): string {
  return date.format('DD.MM.YYYY');
}

export function parseGermanDate(germanDate: string): dayjs.Dayjs {
  return dayjs.utc(germanDate, 'DD.MM.YYYY');
}

export function parseISODate(isoDate: string): dayjs.Dayjs {
  return dayjs.utc(isoDate, 'YYYY-MM-DD');
}

export function getDaysInMonthForCalendar(year: number, month: number) {
  const DAYS_STEP = {
    0: 1,
    6: 2,
  } as { [key: number]: number };

  let firstDate = dayjs(new Date(year, month - 1, 1));
  firstDate = firstDate.add(DAYS_STEP[firstDate.day()] ?? 0, 'day');

  let lastDate = firstDate.endOf('month');
  lastDate = lastDate.subtract(DAYS_STEP[lastDate.day()] ?? 0, 'day');

  const days = [];

  // We want to take the days of the previous month into account that are in the first week of the current month.
  for (let i = 0; i < firstDate.day(); i++) {
    const date = firstDate.subtract(firstDate.day() - i, 'day');
    if (date.day() === 6 || date.day() === 0) {
      continue;
    }

    days.push(date);
  }

  const daysInMonth = firstDate.daysInMonth();

  // We add the days of the current month.
  for (let i = 0; i < daysInMonth; i++) {
    const date = firstDate.add(i, 'day');
    if (date.day() === 6 || date.day() === 0) {
      continue;
    } else if (date.isAfter(lastDate)) {
      break;
    }
    days.push(date);
  }

  // We want to take the days of the next month into account that are in the last week of the current month.
  for (let i = 0; i < 6 - lastDate.day(); i++) {
    const date = lastDate.add(i + 1, 'day');
    if (date.day() === 6 || date.day() === 0) {
      continue;
    }

    days.push(date);
  }

  return days;
}

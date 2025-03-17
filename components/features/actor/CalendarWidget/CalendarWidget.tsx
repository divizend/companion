import React, { useMemo, useState } from 'react';

import { Calendar, DateData } from '@divizend/react-native-calendars';
import dayjs, { Dayjs } from 'dayjs';

import { getDaysInMonthForCalendar } from '@/common/date-helper';
import usePortfolioQuery from '@/hooks/actor/useDepotQuery';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ActorService } from '@/services/actor.service';
import { ActorState, actor } from '@/signals/actor';
import { CalendarDay } from '@/types/actor-api.types';
import { rgbToHsl } from '@/utils/strings';

import Widget from '../Widget';
import CalendarEntryModal from './CalendarEntryModal';
import { CalendarDayEvent, CalendarDayEventType, EventsCalendarDay } from './common.types';

function getCalendarEvents(
  depot: ActorState['depot'],
  dividends: CalendarDay[],
  calendarDays: dayjs.Dayjs[],
  showOnlyMyDividends: boolean,
): EventsCalendarDay[] {
  return calendarDays.map(date => {
    const isoDate = date.format('YYYY-MM-DD');

    const relevantDate = dividends.find(date => date.date === isoDate);
    const relevantDividends_ = (
      (relevantDate === undefined ? [] : relevantDate.dividends).map(dividend => ({
        type: CalendarDayEventType.DIVIDEND,
        dividend,
        isin: dividend.isin,
        name: dividend.company.name,
      })) as CalendarDayEvent[]
    ).filter(event => !showOnlyMyDividends || event.isin in (depot?.securities ?? {}));

    // Remove redundant dividends
    const relevantDividends: CalendarDayEvent[] = Object.values(
      relevantDividends_.reduce(
        (acc: any, event: any) => {
          if (acc[event.isin] === undefined) {
            acc[event.isin] = event;
          } else if (acc[event.isin].dividend.amount !== event.dividend.amount) {
            acc[event.isin + event.dividend.amount] = event;
          }
          return acc;
        },
        {} as Record<string, CalendarDayEvent>,
      ),
    );

    const relavantTransactionsAndSplits: CalendarDayEvent[] = Object.keys(depot?.securities ?? {})
      .map(isin => {
        const transactions: CalendarDayEvent[] = (depot?.securities[isin].transactions ?? [])
          .filter(transaction => new Date(transaction.date).toISOString().slice(0, 10) === isoDate)
          .map(transaction => ({
            type: CalendarDayEventType.TRANSACTION,
            transaction,
            isin,
            name: depot?.securities[isin].name ?? '',
          }));
        const splits: CalendarDayEvent[] = (depot?.securities[isin].splits ?? [])
          .filter(split => new Date(split.date).toISOString().slice(0, 10) === isoDate)
          .map(split => ({
            type: CalendarDayEventType.SPLIT,
            split,
            isin,
            name: depot?.securities[isin].name ?? '',
          }));

        return [...transactions, ...splits];
      })
      .flat();

    return {
      date,
      events: [...relevantDividends, ...relavantTransactionsAndSplits].sort((a, b) => a.name.localeCompare(b.name)),
    };
  });
}

export default function CalendarWidget() {
  const theme = useThemeColor();
  const depot = actor.value.depot;
  const [selectedDay, setSelectedDay] = useState<Dayjs | null>(null);
  const [currentYear, setCurrentYear] = useState(dayjs().year());
  const [currentMonth, setCurrentMonth] = useState(dayjs().month() + 1);
  const { data: { entries: dividends_ = [] } = { entries: [] }, isLoading } = usePortfolioQuery({
    queryFn: () => ActorService.getDividendCalendar(currentYear, currentMonth),
    queryKey: ['getDividendCalendar', currentYear, currentMonth],
  });
  const { data: selectedCalendarDayDetails } = usePortfolioQuery({
    queryFn: () =>
      selectedDay
        ? ActorService.getCalendarDayDetails(dividends_.find(calendarDay => selectedDay.isSame(calendarDay.date))!)
        : null,
    queryKey: ['getCalendarDayDetails', selectedDay?.toISOString(), currentYear, currentMonth],
  });

  const dividends = useMemo(() => {
    if (!selectedCalendarDayDetails?.calendarDay) return dividends_;

    return dividends_.map(dividend => {
      if (dividend.date === selectedCalendarDayDetails.calendarDay.date) {
        return selectedCalendarDayDetails.calendarDay;
      }
      return dividend;
    });
  }, [dividends_, selectedCalendarDayDetails]);

  const calendarDays = useMemo(() => getDaysInMonthForCalendar(currentYear, currentMonth), [currentYear, currentMonth]);
  const dailyEvents: EventsCalendarDay[] = useMemo(() => {
    const events = getCalendarEvents(depot, dividends, calendarDays, false);
    return events;
  }, [dividends, depot, calendarDays]);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    const maxEvents = Math.max(...dailyEvents.map(event => event.events.length), 0);
    const baseHighest = 'rgb(46, 120, 119)';
    const baseLightest = 'rgb(154, 216, 215)';
    const hslBase = rgbToHsl(baseHighest);
    const hslLowest = rgbToHsl(baseLightest);
    dailyEvents.forEach(event => {
      if (event.events.length > 0) {
        const ratio = 1 - Math.pow(event.events.length / maxEvents, 0.25);
        const hsl = { ...hslBase };
        hsl.l = (hslLowest.l - hslBase.l) * ratio + hslBase.l;
        marks[event.date.format('YYYY-MM-DD')] = {
          marked: true,
          dotColor: hsl.toString(),
        };
      }
    });
    if (selectedDay) {
      marks[selectedDay.format('YYYY-MM-DD')] = {
        ...marks[selectedDay.format('YYYY-MM-DD')],
        selected: true,
        disableTouchEvent: true,
      };
    }
    return marks;
  }, [dailyEvents, selectedDay]);

  const selectedDayDetails = useMemo(() => {
    if (!selectedDay) return null;
    return dailyEvents.find(event => event.date.isSame(selectedDay, 'day'));
  }, [dailyEvents, selectedDay, selectedCalendarDayDetails]);

  return (
    <Widget title="Calendar" ready>
      <Calendar
        hideWeekends
        markedDates={markedDates}
        displayLoadingIndicator={isLoading}
        initialDate={dayjs()
          .set('month', currentMonth - 1)
          .set('year', currentYear)
          .format('YYYY-MM-DD')}
        onDayPress={async (day: DateData) => {
          const selectedDate = dayjs(day.dateString).startOf('day');
          setSelectedDay(selectedDate);
        }}
        onMonthChange={(date: DateData) => {
          setCurrentYear(dayjs(date.dateString).year());
          setCurrentMonth(dayjs(date.dateString).month() + 1);
          setSelectedDay(null);
        }}
        theme={{
          'stylesheet.calendar.header': Object.fromEntries(
            Array.from({ length: 7 }, (_, i) => [`dayTextAtIndex${i}`, { color: theme.text, fontSize: 14 }]),
          ),
          arrowColor: 'rgb(46, 120, 119)',
          monthTextColor: theme.text,
          todayTextColor: theme.allColors.light.text,
          todayBackgroundColor: 'rgb(154, 216, 215)',
          selectedDayTextColor: 'rgb(142, 120, 119)',
          selectedDayBackgroundColor: 'rgb(154, 216, 215)',
          textDayFontWeight: '400',
          textMonthFontWeight: '500',
          calendarBackground: 'transparent',
          dayTextColor: theme.text,
          textDisabledColor: theme.disabled,
        }}
      />

      {/* Calendar Entry Modal */}
      {selectedDayDetails && (
        <CalendarEntryModal
          calendarDay={selectedDayDetails}
          visible={!!selectedDay}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </Widget>
  );
}

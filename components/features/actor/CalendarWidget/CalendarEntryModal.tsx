import React from 'react';

import { Icon } from '@rneui/themed';
import { FlatList, Modal, TouchableOpacity, View } from 'react-native';

import { clsx } from '@/common/clsx';
import SecurityIcon from '@/components/SecurityIcon';
import { Text } from '@/components/base';
import { useThemeColor } from '@/hooks/useThemeColor';
import { t } from '@/i18n';
import { actor } from '@/signals/actor';

import { CalendarDayEventType, EventsCalendarDay } from './common.types';

const TYPE_TO_COLOR: Record<string, string> = {
  [CalendarDayEventType.DIVIDEND]: 'bg-blue-100 text-blue-600',
  [CalendarDayEventType.TRANSACTION]: 'bg-gray-200 text-gray-700',
  [CalendarDayEventType.SPLIT]: 'bg-red-100 text-red-600',
};

const Tag = ({ color, children }: { color: string; children: React.ReactNode }) => {
  const theme = useThemeColor();
  return (
    <View className={`px-2 py-1 rounded-md ${color}`}>
      <Text className="text-xs font-semibold" style={{ color: theme.allColors.light.text }}>
        {children}
      </Text>
    </View>
  );
};

interface CalendarEntryModalProps {
  calendarDay: EventsCalendarDay;
  visible: boolean;
  onClose: () => void;
}

export default function CalendarEntryModal({ calendarDay, visible, onClose }: CalendarEntryModalProps) {
  const depot = actor.value.depot;
  const theme = useThemeColor();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-opacity-50">
        <TouchableOpacity onPressOut={onClose} className="flex-1" />
        <View className="p-5 rounded-t-2xl max-h-[80%] shadow-lg" style={{ backgroundColor: theme.backgroundPrimary }}>
          {/* Header with Close Button */}
          <View
            className="flex-row justify-between items-center pb-3 border-b"
            style={{
              borderBottomColor: theme.disabled,
            }}
          >
            <Text className="text-lg font-semibold text-center flex-1" style={{ color: theme.text }}>
              {t('dateTime.dayLongUTC', { date: calendarDay?.date.format('YYYY-MM-DD') })}
            </Text>
            <TouchableOpacity onPressOut={onClose} className="p-2">
              <Icon name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {calendarDay?.events.length === 0 ? (
            <Text className="text-center text-xl mt-4 mb-2">{t('actor.calendarWidget.noEvents')}</Text>
          ) : (
            <FlatList
              data={calendarDay.events}
              keyExtractor={(event, index) => event.isin + index}
              showsVerticalScrollIndicator={false}
              renderItem={({ item: event, index }) => (
                <View
                  className={clsx(
                    'flex-row justify-between items-center py-3',
                    index !== calendarDay.events.length - 1 && 'border-b',
                  )}
                  style={{
                    borderBottomColor: theme.disabled,
                  }}
                >
                  <View className="flex flex-1 flex-col">
                    <View className="flex-row items-center ">
                      <SecurityIcon
                        isin={event.isin}
                        country={depot?.securities[event.isin]?.country ?? event.isin.slice(0, 2)}
                      />
                      <Text className=" font-medium ml-2 flex-shrink min-w-0">{event.name}</Text>
                    </View>
                    <View className="flex-row flex-wrap gap-2 mt-2">
                      <Tag color={TYPE_TO_COLOR[event.type] ?? 'gray-inverse'}>
                        {t('actor.calendarWidget.' + event.type)}
                      </Tag>
                      {event.type === CalendarDayEventType.TRANSACTION && (
                        <Tag
                          color={
                            event.transaction.type === 'PURCHASE'
                              ? 'bg-blue-300 text-blue-800'
                              : 'bg-red-300 text-red-800'
                          }
                        >
                          {t('actor:calendarWidget.tooltip.' + event.transaction.type)}
                        </Tag>
                      )}
                      {event.type === CalendarDayEventType.DIVIDEND &&
                        new Date(event.dividend.date) >= new Date() &&
                        event.dividend.type === 'PREDICTION' && (
                          <Tag color="bg-orange-200 text-orange-600">{t('actor.calendarWidget.predictionTooltip')}</Tag>
                        )}
                    </View>
                  </View>

                  <View className="items-end whitespace-nowrap">
                    {event.type === CalendarDayEventType.DIVIDEND && (
                      <>
                        <Text className="text-gray-600 font-semibold">
                          {t('actor.calendarWidget.dividendPayout', {
                            price: t('currency', { amount: event.dividend.yield }),
                          })}
                        </Text>
                        {event.dividend.dividendYield && (
                          <Text className="text-gray-500">
                            {t('percent', {
                              value: {
                                value: event.dividend.dividendYield,
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            })}
                          </Text>
                        )}
                      </>
                    )}

                    {event.type === CalendarDayEventType.TRANSACTION &&
                      event.transaction.price &&
                      event.transaction.quantity && (
                        <View className="items-end">
                          <Text className="text-gray-600 font-semibold">
                            {t('actor:calendarWidget.transactionPrice', {
                              quantity: event.transaction.quantity,
                              price: t('currency', {
                                amount: {
                                  amount: event.transaction.price.amount / event.transaction.quantity,
                                  unit: event.transaction.price.unit,
                                },
                              }),
                            })}
                          </Text>
                          <Text className="text-gray-500 font-semibold text-xs">
                            {t('actor:calendarWidget.totalPayout', {
                              total: t('currency', {
                                amount: event.transaction.price,
                              }),
                            })}
                          </Text>
                        </View>
                      )}

                    {event.type === CalendarDayEventType.SPLIT && (
                      <Text className="text-gray-700 font-bold">
                        {event.split.from}:{event.split.to}
                      </Text>
                    )}
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

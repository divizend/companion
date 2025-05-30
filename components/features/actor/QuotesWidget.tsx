import React, { useMemo, useRef, useState } from 'react';

import { LineGraph } from '@divizend/react-native-graph';
import { useSignals } from '@preact/signals-react/runtime';
import { Icon } from '@rneui/themed';
import { throttle } from 'lodash';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { clsx } from '@/common/clsx';
import { Text } from '@/components/base';
import { showCustom } from '@/components/global/prompt';
import usePortfolioQuery from '@/hooks/actor/useDepotQuery';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ActorService } from '@/services/actor.service';
import { actor } from '@/signals/actor';
import { QuoteRange, TTWRORQuote } from '@/types/actor-api.types';

import { createPerformanceQuotesField, useActorSettingsModal } from './ActorSettingsModal';
import Widget from './Widget';

const Info = ({
  quote,
  currentQuote,
  range,
}: {
  quote: TTWRORQuote | undefined;
  currentQuote: TTWRORQuote;
  range: QuoteRange;
}) => {
  const { t } = useTranslation();
  const theme = useThemeColor();

  const color =
    currentQuote.price - (quote?.price ?? 0) > 0
      ? '#3c9d9b'
      : currentQuote.price - (quote?.price ?? 0) < 0
        ? 'red'
        : '#999';

  const arrowIcon = (() => {
    if (!quote) return null;

    const priceDifference = currentQuote.price - quote.price;

    if (priceDifference > 0) {
      return <Icon name="arrow-upward" size={15} color="#3c9d9b" type="material" />;
    } else if (priceDifference < 0) {
      return <Icon name="arrow-downward" size={15} color="red" type="material" />;
    }

    return null;
  })();

  const ttwrorArrowIcon = (() => {
    if (!quote) return null;

    const ttwrorDifference = quote.ttwror;

    if (ttwrorDifference > 0) {
      return <Icon name="arrow-upward" size={25} color={theme.text} type="material" />;
    } else if (ttwrorDifference < 0) {
      return <Icon name="arrow-downward" size={25} color="red" type="material" />;
    }

    return null;
  })();

  return (
    <>
      <Text className=" text-gray-600 font-bold text-lg">
        {t(!(range === QuoteRange.Y || range === QuoteRange.ALL) ? 'dateTime.dayLongAndTime' : 'dateTime.dayLongUTC', {
          date: new Date((quote?.time ?? 0) * 1000),
        }).replace(/(\d{2}):(\d{2}):\d{2}/g, '$1:$2')}
      </Text>
      {actor.value.settings?.performanceQuotesWidget.type === 'ttwror' ? (
        <Text
          h1
          className={clsx('font-bold', 'flex items-center')}
          style={{ color: (quote?.ttwror ?? 0) < 0 ? 'red' : theme.text }}
        >
          {ttwrorArrowIcon}
          {t('percent', {
            value: {
              value: quote?.ttwror ?? 0,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
              signDisplay: 'exceptZero',
            },
          })}
        </Text>
      ) : (
        <Text h1 className="font-bold">
          {t('currency', {
            amount: {
              amount: quote?.price ?? 0,
              unit: quote?.currency ?? 'EUR',
            },
          })}
        </Text>
      )}
      <View
        className={clsx(
          'flex-row items-center',
          actor.value.settings?.performanceQuotesWidget.type === 'ttwror' && 'hidden',
        )}
      >
        {arrowIcon}
        <Text
          h4
          style={{
            color: color,
            marginRight: 12,
          }}
        >
          {currentQuote.price - (quote?.price ?? 0) === 0 && '±'}
          {t('percent', {
            value: {
              value: (currentQuote.price - (quote?.price ?? 0)) / currentQuote.price,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
              signDisplay: 'exceptZero',
            },
          })}
        </Text>

        {arrowIcon}
        <Text
          h4
          style={{
            color: color,
          }}
        >
          {currentQuote.price - (quote?.price ?? 0) === 0 && '±'}
          {t('currency', {
            amount: {
              amount: currentQuote.price - (quote?.price ?? 0),
              unit: quote?.currency ?? 'EUR',
              options: {
                signDisplay: 'exceptZero',
              },
            },
          })}
        </Text>
      </View>
    </>
  );
};

export default function QuotesWidget() {
  const { t } = useTranslation();
  const isPanning = useRef(false);
  const theme = useThemeColor();
  const [selectedQuote, setSelectedQuote_] = useState<TTWRORQuote>();
  const setSelectedQuote = throttle(setSelectedQuote_, 32);
  const [range, setRange] = useState<QuoteRange>(QuoteRange.Y);
  const { data: quotes = [], isLoading } = usePortfolioQuery({
    queryFn: () => ActorService.getPerformanceQuotes(range),
    queryKey: ['getPerformanceQuotes', range],
  });

  useSignals();

  const currentQuote = quotes.at(-1);

  const SettingsModalComponent = useActorSettingsModal([createPerformanceQuotesField()]);

  const points = useMemo(() => {
    return quotes.map(q => ({
      date: new Date(q.time * 1000),
      value: actor.value.settings?.performanceQuotesWidget.type === 'ttwror' ? q.ttwror : q.price,
    }));
  }, [quotes, actor.value.settings?.performanceQuotesWidget.type]);

  const rangePoints = useMemo(() => {
    const key = actor.value.settings?.performanceQuotesWidget.type === 'ttwror' ? 'ttwror' : 'price';
    const maxQuote = quotes.reduce((max, quote) => (quote[key] > max ? quote[key] : max), 0);
    const minQuote = quotes.reduce((min, quote) => (quote[key] < min ? quote[key] : min), maxQuote);
    if (!quotes.length) return undefined;
    return {
      x: {
        min: new Date(quotes[0].time * 1000),
        max: new Date(((quotes[quotes.length - 1].time - quotes[0].time) * 1.25 + quotes[0].time) * 1000),
      },
      y: {
        min: minQuote,
        max: maxQuote,
      },
    };
  }, [quotes, actor.value.settings?.performanceQuotesWidget.type, range]);

  return (
    <Widget
      title={t('actor.quotes.title')}
      ready={!isLoading && !!quotes}
      styles={{ root: { overflow: 'hidden' } }}
      settings={
        <Pressable onPress={() => showCustom(SettingsModalComponent)}>
          <Icon name="settings" type="material" color="gray" size={24} />
        </Pressable>
      }
    >
      {!isLoading && quotes.length > 0 && (
        <>
          <Info quote={selectedQuote ?? currentQuote} currentQuote={currentQuote!} range={range} />

          <LineGraph
            range={rangePoints}
            points={points}
            animated
            color="#2E7877"
            enablePanGesture
            enableFadeInMask
            enableIndicator
            indicatorPulsating
            verticalPadding={30}
            panGestureDelay={200}
            style={{ height: 225, marginBottom: 20, marginHorizontal: -24 }}
            onGestureStart={() => {
              isPanning.current = true;
            }}
            onGestureEnd={() => {
              isPanning.current = false;
              setSelectedQuote(undefined);
            }}
            onPointSelected={(point: { date: Date; value: number } | undefined) => {
              if (!isPanning.current) return;
              const newQuote =
                quotes.find(q => Math.abs(q.time - (point?.date.getTime() ?? 0) / 1000) < 1e-5) ?? currentQuote;
              setSelectedQuote(newQuote);
            }}
          />

          <View className="flex-row justify-center" style={{ marginVertical: 10 }}>
            {Object.entries(QuoteRange)
              .filter(([k]) => isNaN(+k))
              .sort((a, b) => (a[1] as number) - (b[1] as number))
              .map(([k, v]) => (
                <Pressable
                  key={k}
                  onPress={() => {
                    setSelectedQuote(undefined);
                    setRange(v as QuoteRange);
                  }}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 15,
                    marginHorizontal: 5,
                    borderRadius: 10,
                    backgroundColor: range === v ? '#ccc' : 'transparent',
                  }}
                >
                  <Text style={{ fontWeight: 'bold', color: range === v ? 'black' : 'gray' }}>
                    {t(`actor.quotes.radioButton.${k}`)}
                  </Text>
                </Pressable>
              ))}
          </View>
        </>
      )}
    </Widget>
  );
}

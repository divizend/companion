import React, { useMemo, useRef, useState } from 'react';

import { LineGraph } from '@divizend/react-native-graph';
import { Icon } from '@rneui/themed';
import { throttle } from 'lodash';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/base';
import usePortfolioQuery from '@/hooks/actor/useDepotQuery';
import { t } from '@/i18n';
import { ActorService } from '@/services/actor.service';
import { Quote, QuoteRange } from '@/types/actor-api.types';

import Widget from './Widget';

const Info = ({ quote, currentQuote, range }: { quote: Quote | undefined; currentQuote: Quote; range: QuoteRange }) => {
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

  return (
    <>
      <Text className=" text-gray-600 font-bold text-lg">
        {t(!(range === QuoteRange.Y || range === QuoteRange.ALL) ? 'dateTime.dayLongAndTime' : 'dateTime.dayLongUTC', {
          date: new Date((quote?.time ?? 0) * 1000),
        })}
      </Text>
      <Text h1 className="font-bold">
        {t('currency', {
          amount: {
            amount: quote?.price ?? 0,
            unit: quote?.currency ?? 'EUR',
          },
        })}
      </Text>
      <View className="flex-row items-center">
        {arrowIcon}
        <Text
          h4
          className="mr-3"
          style={{
            color: color,
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

const GRADIENT_FILL_COLORS = ['#2E78775D', '#2E787700'];

export default function QuotesWidget() {
  const isPanning = useRef(false);
  const [selectedQuote, setSelectedQuote_] = useState<Quote>();
  const [range, setRange] = useState<QuoteRange>(QuoteRange.Y);
  const { data: quotes_ = [], isLoading } = usePortfolioQuery({
    queryFn: () => ActorService.getPerformanceQuotes(range),
    queryKey: [range],
  });
  const { data: performance } = usePortfolioQuery({
    queryFn: ActorService.getPerformance,
  });
  const setSelectedQuote = throttle(setSelectedQuote_, 32);
  const quotes = useMemo(() => {
    if (!quotes_.length || !performance) return quotes_;
    return quotes_.concat([
      {
        currency: quotes_.at(-1)!.currency,
        price: performance.totalAmount,
        time: new Date().getTime() / 1000,
      },
    ]);
  }, [quotes_, performance]);
  const currentQuote = quotes.at(-1);

  const points = useMemo(() => {
    return quotes.map(q => ({
      date: new Date(q.time * 1000),
      value: q.price,
    }));
  }, [quotes, performance]);

  const rangePoints = useMemo(() => {
    const maxQuote = quotes.reduce((max, quote) => (quote.price > max ? quote.price : max), 0);
    const minQuote = quotes.reduce((min, quote) => (quote.price < min ? quote.price : min), maxQuote);
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
  }, [quotes]);

  return (
    <Widget title={t('actor.quotes.title')} ready={!isLoading && !!quotes} styles={{ root: { overflow: 'hidden' } }}>
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
            // gradientFillColors={GRADIENT_FILL_COLORS}
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

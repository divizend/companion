import React, { useEffect, useMemo, useRef, useState } from 'react';

import { LineGraph } from '@divizend/react-native-graph';
import { useSignal, useSignals } from '@preact/signals-react/runtime';
import { CheckBox, Icon } from '@rneui/themed';
import { throttle } from 'lodash';
import { useTranslation } from 'react-i18next';
import { Pressable, Switch, View } from 'react-native';
import Animated, { useSharedValue } from 'react-native-reanimated';

import { usedConfig } from '@/common/config';
import { useUserProfile } from '@/common/profile';
import SectionList from '@/components/SectionList';
import { Text } from '@/components/base';
import { fetchSimulationData } from '@/components/features/analyze/portfolio-requests';
import { useSnackbar } from '@/components/global/Snackbar';
import { showCustom } from '@/components/global/prompt';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Scenarios, SimulationRange } from '@/types/actor-api.types';

import Widget from './Widget';

interface Security {
  _id: string | null;
  isin: string;
  name: string;
  quantity: number;
  weight: number;
  current_value: number;
}

interface SimulationData {
  computed_at: string;
  duration_months: number;
  portfolio_id: string;
  scenario: string;
  simulation_data: Record<string, Record<string, number>>;
}

const convertSimulationData = (
  simulationData: SimulationData,
  depotData: {
    securities: Security[];
  },
): { time: number; price: number }[] => {
  const { simulation_data } = simulationData;
  const { securities } = depotData;

  const total_value = securities.reduce((sum, sec) => sum + sec.current_value, 0);

  const weightLookup: Record<string, number> = securities.reduce(
    (acc: Record<string, number>, sec) => {
      acc[sec.isin] = sec.weight;
      return acc;
    },
    {} as Record<string, number>, // Explicitly define the initial value
  );

  return Object.entries(simulation_data).map(([date, assets]) => {
    const assetValues = Object.entries(assets).map(([isin, price]) => {
      return (price || 0) * (weightLookup[isin] || 0);
    });
    const price_value = assetValues.reduce((sum, value) => sum + value, 0) * total_value;
    const percentage_value = assetValues.reduce((sum, value) => sum + value, 0) * 100;
    return {
      time: Math.floor(new Date(date).getTime() / 1000),
      price: parseFloat(price_value.toFixed(2)),
      percentage_price: parseFloat(percentage_value.toFixed(2)),
      currency: 'EUR',
    };
  });
};

const Info = ({ quote, range, percentage }: { quote?: any; range: SimulationRange; percentage: boolean }) => {
  const { t } = useTranslation();

  return (
    <View className="flex-row justify-between">
      <View>
        <Text className=" text-gray-600 font-bold text-lg">
          {t(!(range === SimulationRange.Y) ? 'dateTime.dayLongAndTime' : 'dateTime.dayLongUTC', {
            date: new Date((quote?.time ?? 0) * 1000),
          }).replace(/(\d{2}):(\d{2}):\d{2}/g, '$1:$2')}
        </Text>
        <Text h1 className="font-bold">
          {percentage ? t((quote?.percentage_price ?? 0).toFixed(2)) + '%' : t((quote?.price ?? 0).toFixed(2)) + '€'}
        </Text>
      </View>
    </View>
  );
};

export default function SimulationWidget() {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  useSignals();

  const isPanning = useRef(false);
  const theme = useThemeColor();
  const [selectedQuote, setSelectedQuote_] = useState<{ time: number; price: number }>();
  const setSelectedQuote = throttle(setSelectedQuote_, 32);

  const [isLoading, setIsLoading] = useState(true);

  const [range, setRange] = useState<SimulationRange>(SimulationRange.Y);
  const [scenario, setScenario] = useState<Scenarios>(Scenarios.INFLATION_2021);
  const percentage = useSignal(true);

  const [depotIDs, setDepotIDs] = useState<string[]>([]);
  const [portfolioID, setPortfolioID] = useState('');

  const [depotData, setDepotData] = useState<any | null>(null);
  const [simulationData, setSimulationData] = useState<SimulationData>({
    computed_at: '',
    duration_months: 0,
    portfolio_id: '',
    scenario: '',
    simulation_data: {},
  });
  const [simulationPricePoints, setSimulationPricePoints] = useState<{ time: number; price: number }[]>([]);

  const profile = useUserProfile();
  const depots = profile.profile.depots;

  useEffect(() => {
    // Depots are only fetched from the production environment. Therefore if we're in local environment, use a demo depot.
    setDepotIDs(usedConfig.isProduction ? depots.map(depot => depot.id) : ['672a47e0bae468d6209a8bcc']);
  }, [depots]);

  useEffect(() => {
    if (!depotIDs || depotIDs.length === 0) return;
    setIsLoading(true);
    fetchSimulationData(depotIDs, setPortfolioID, setDepotData, range, scenario)
      .then(setSimulationData)
      .catch(() => showSnackbar(t('actor.error.simulation'), { type: 'error' }))
      .finally(() => setIsLoading(false));
  }, [depotIDs, range, scenario]);

  useEffect(() => {
    if (simulationData && simulationData.simulation_data && Object.keys(simulationData.simulation_data).length > 0) {
      setSimulationPricePoints(convertSimulationData(simulationData, depotData));
    } else {
      setSimulationPricePoints([]);
    }
  }, [simulationData]);

  const currentQuote = simulationPricePoints.at(-1);

  const points = useMemo(() => {
    return simulationPricePoints.map(({ time, price }) => ({
      date: new Date(time * 1000),
      value: price,
    }));
  }, [simulationPricePoints]);

  const rangePoints = useMemo(() => {
    if (!simulationPricePoints.length) return { x: { min: new Date(), max: new Date() }, y: { min: 0, max: 1 } };

    const maxPrice = Math.max(...simulationPricePoints.map(p => p.price), 0);
    const minPrice = Math.min(...simulationPricePoints.map(p => p.price), maxPrice);

    return {
      x: {
        min: new Date(simulationPricePoints[0].time * 1000),
        max: new Date(
          ((simulationPricePoints.at(-1)!.time - simulationPricePoints[0].time) * 1.25 +
            simulationPricePoints[0].time) *
            1000,
        ),
      },
      y: { min: minPrice, max: maxPrice },
    };
  }, [simulationPricePoints]);

  return (
    <Widget
      title={`${t('actor.simulation.title')} - ${t(`actor.simulation.scenarioButton.${scenario.toUpperCase()}`)}`}
      ready={!isLoading}
      styles={{ root: { overflow: 'hidden' } }}
      settings={
        <Pressable
          onPress={() =>
            showCustom(() => {
              useSignals();

              return (
                <>
                  <Text h2 className="text-center mb-5">
                    {t('actor.simulation.settings.title')}
                  </Text>
                  <SectionList
                    title={t('actor.simulation.settings.options')}
                    containerStyle={{ marginBottom: 30 }}
                    items={[
                      {
                        title: t('actor.simulation.settings.showPercentage'),
                        leftIcon: { name: 'percent', type: 'material' },
                        rightElement: (
                          <CheckBox
                            wrapperStyle={{ backgroundColor: 'transparent', margin: 0, padding: 0 }}
                            iconType="material-community"
                            checkedIcon="checkbox-marked"
                            uncheckedIcon="checkbox-blank-outline"
                            checkedColor={theme.theme}
                            containerStyle={{
                              backgroundColor: 'transparent',
                              margin: 0,
                              padding: 0,
                              marginLeft: 0,
                              marginRight: 0,
                            }}
                            checked={percentage.value}
                            onPress={() => (percentage.value = !percentage.value)}
                          />
                        ),
                        onPress: () => (percentage.value = !percentage.value),
                      },
                    ]}
                  />
                </>
              );
            })
          }
          className="mt-1"
        >
          <Icon name="settings" type="material" color="gray" size={24} />
        </Pressable>
      }
    >
      {!isLoading &&
        (simulationPricePoints.length === 0 ? (
          <Text className="text-center text-gray-600 font-bold" style={{ fontSize: 18 }}>
            {t('actor.error.insufficientData')}
          </Text>
        ) : (
          <>
            <Info quote={selectedQuote ?? currentQuote} range={range} percentage={percentage.value} />

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
              onPointSelected={point => {
                if (!isPanning.current) return;
                const newQuote =
                  simulationPricePoints.find(q => Math.abs(q.time - (point?.date.getTime() ?? 0) / 1000) < 1e-5) ??
                  currentQuote;

                setSelectedQuote(newQuote);
              }}
            />
          </>
        ))}
      <View className="flex-row justify-center" style={{ marginVertical: 10 }}>
        {Object.entries(SimulationRange)
          .filter(([k]) => isNaN(+k))
          .sort((a, b) => (a[1] as number) - (b[1] as number))
          .map(([k, v]) => (
            <Pressable
              key={k}
              onPress={() => {
                setSelectedQuote(undefined);
                setRange(v as SimulationRange);
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
                {t(`actor.simulation.radioButton.${k}`)}
              </Text>
            </Pressable>
          ))}
      </View>
      <View className="flex-col items-center space-y-2" style={{ marginVertical: 10 }}>
        {Object.entries(Scenarios)
          .filter(([k]) => isNaN(+k))
          .map(([k, v]) => (
            <Pressable
              key={k}
              onPress={() => {
                setSelectedQuote(undefined);
                setScenario(v as Scenarios);
              }}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 15,
                marginHorizontal: 5,
                borderRadius: 10,
                backgroundColor: scenario === v ? '#ccc' : 'transparent',
              }}
            >
              <Text style={{ fontWeight: 'bold', color: scenario === v ? 'black' : 'gray' }}>
                {t(`actor.simulation.scenarioButton.${k}`)}
              </Text>
            </Pressable>
          ))}
      </View>
    </Widget>
  );
}

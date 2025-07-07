import React from 'react';

import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { SecurityAccountSecurity } from '@/types/secapi.types';

import { ActorService } from '../../../services/actor.service';
import { Text } from '../../base';
import Widget from './Widget';

export type CompanyDividendEvolutionWidgetProps = {
  security: SecurityAccountSecurity;
};

export default function CompanyDividendEvolutionWidget({ security }: CompanyDividendEvolutionWidgetProps) {
  const { t } = useTranslation();

  const continuousIncreasesYears = React.useMemo(
    () => (security ? ActorService.getContinuousDividendIncreases(security) : undefined),
    [security],
  );

  const noDividendsCuts = React.useMemo(
    () => (security ? ActorService.getYearsWithNoDividendCuts(security) : undefined),
    [security],
  );

  const getCurrentYear = () => {
    return new Date().getFullYear();
  };

  const formatIntervals = (intervals?: number[][]) => {
    if (!intervals || intervals.length === 0) return null;

    const formattedIntervals = intervals.map(interval => {
      const [start, end] = interval;

      if (end === getCurrentYear()) {
        return t('actor.dividendEvolutionWidget.since') + ` ${start}`;
      } else if (start === end) {
        return t('actor.dividendEvolutionWidget.displaySinceYear', { start: start });
      } else {
        return t('actor.dividendEvolutionWidget.intervalDisplay', {
          start: start,
          end: end,
        });
      }
    });
    return (
      <View>
        {formattedIntervals.map((interval, index) => (
          <Text key={index} className="text-lg text-gray-700 font-black mb-1">
            {interval}
          </Text>
        ))}
      </View>
    );
  };

  return (
    <Widget title={t('actor.dividendEvolutionWidget.title')} ready>
      {continuousIncreasesYears || noDividendsCuts ? (
        <View className="flex flex-col gap-5 mt-3 mb-3">
          {continuousIncreasesYears && (
            <View className="min-h-14 pb-2">
              <Text className="text-gray-500 mb-2 font-medium text-lg">
                {t('actor.dividendEvolutionWidget.continuousIncreasesYears')}
              </Text>
              <View>{formatIntervals(continuousIncreasesYears)}</View>
            </View>
          )}

          {noDividendsCuts && (
            <View className="min-h-14 pb-2">
              <Text className="text-gray-500 mb-2 font-medium text-lg">
                {t('actor.dividendEvolutionWidget.noDividendsCuts')}
              </Text>
              <View>{formatIntervals(noDividendsCuts)}</View>
            </View>
          )}
        </View>
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text className="text-center text-gray-600 font-bold text-lg leading-7">
            {t('actor.dividendEvolutionWidget.noDividendPayments')}
          </Text>
        </View>
      )}
    </Widget>
  );
}

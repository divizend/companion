import React, { useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { PieChart as PieChartBase } from 'react-native-gifted-charts';

import { Text } from '@/components/base/Text';
import usePortfolioQuery from '@/hooks/actor/useDepotQuery';
import { ActorService } from '@/services/actor.service';
import { SecurityAccountSecurity } from '@/types/actor-api.types';
import { rgbToHsl } from '@/utils/strings';

import { PieDataItem } from './PieChart/PieChart';
import PieChartLegend from './PieChart/PieChartLegend';
import Widget from './Widget';

interface SectorWidgetProps {
  security: SecurityAccountSecurity;
}

interface PieChartEntry extends PieDataItem {
  name: string;
  percentage: number;
}

export default function CompanySectorsWidget({ security }: SectorWidgetProps) {
  const { t } = useTranslation();
  const [selectedSegment, setSelectedSegment] = useState<PieChartEntry | null>(null);

  // Fetch company sector data
  const { data: sectorData, isLoading: loading } = usePortfolioQuery({
    queryKey: ['companySectors', security.isin],
    queryFn: () => ActorService.getCompanySectors(security.isin),
    enabled: !!security.isin,
  });

  // Fetch company performance data
  const { data: companyPerformanceData, isLoading: loadingCompanyPerfomance } = usePortfolioQuery({
    queryKey: ['companyPerformance', security.isin],
    queryFn: () => ActorService.getCompanyPerformance(security),
    enabled: !!security.isin,
  });
  const entries: PieChartEntry[] = useMemo(() => {
    const entriesMap = new Map<string, { share: number; sector: string }>();

    // First pass: aggregate the shares by sector
    sectorData?.forEach(entry => {
      const sectorKey = isNaN(parseInt(entry.sector || '')) ? 'other' : (entry.sector || '').slice(0, 4);
      const existingEntry = entriesMap.get(sectorKey);
      const amount = entry.share;

      if (existingEntry) {
        existingEntry.share += amount;
      } else {
        entriesMap.set(sectorKey, {
          share: amount,
          sector: entry.sector || 'other',
        });
      }
    });

    // Calculate total for percentage calculation
    const totalShares = Array.from(entriesMap.values()).reduce((sum, entry) => sum + entry.share, 0);

    // Second pass: create pie chart entries with percentages
    const entriesArray = Array.from(entriesMap.entries()).map(([sectorKey, data]) => ({
      id: sectorKey,
      name: t(`gicsSectors.${sectorKey}`),
      value: data.share,
      percentage: totalShares > 0 ? (data.share / totalShares) * 100 : 0,
    }));

    // Apply color generation logic
    const baseHighest = 'rgb(46, 120, 119)';
    const baseLightest = 'rgb(154, 216, 215)';
    const hslBase = rgbToHsl(baseHighest);
    const hslLowest = rgbToHsl(baseLightest);
    const coloredEntries = entriesArray.map((entry: PieChartEntry, index: number) => {
      const hsl = { ...hslBase };
      const ratio = index / entriesArray.length;
      hsl.l = (hslLowest.l - hslBase.l) * ratio + hslBase.l;
      const color = hsl.toString();

      return {
        ...entry,
        color,
      };
    });

    return coloredEntries.sort((a, b) => b.percentage - a.percentage);
  }, [sectorData, companyPerformanceData, t]);

  const renderLegend = (entry: PieChartEntry) => <Text className="flex-1 flex-wrap line-clamp-2">{entry.name}</Text>;

  const renderSelectedSegment = (entry: PieChartEntry) => (
    <Text className="flex-1 flex-wrap">{`${entry.name}: ${entry.percentage.toFixed(1)}%`}</Text>
  );
  if (!loading && !loadingCompanyPerfomance && entries.length === 0) {
    return (
      <Widget title={t('actor.sectorWidget.title')} ready={!loading}>
        <View className="flex-1 justify-center items-center py-8">
          <Text type="muted" className="text-center">
            {t('actor.sectorWidget.noData', { defaultValue: 'No sector data available' })}
          </Text>
        </View>
      </Widget>
    );
  }

  const updateFocus = (selected: PieChartEntry | null) => {
    entries.forEach(segment => {
      segment.focused = selected ? segment === selected : false;
    });
  };

  const handlePress = (segment: PieChartEntry) => {
    const newSelected = segment?.focused ? null : segment;
    setSelectedSegment(newSelected);
    updateFocus(newSelected);
  };

  return (
    <Widget
      title={t('actor.sectorWidget.title')}
      ready={!loading && !loadingCompanyPerfomance}
      styles={{
        container: {
          alignItems: 'center',
          gap: 10,
        },
      }}
    >
      <PieChartBase
        data={entries}
        focusOnPress
        radius={130}
        innerRadius={20}
        strokeWidth={0}
        animationDuration={500}
        innerCircleColor="white"
        focusedPieIndex={selectedSegment ? entries.indexOf(selectedSegment) : -1}
        onPress={(segment: PieChartEntry) => handlePress(segment)}
      />
      <PieChartLegend
        renderLegend={selectedSegment ? renderSelectedSegment : renderLegend}
        entries={selectedSegment ? [selectedSegment] : entries.slice(0, 6)}
      />
    </Widget>
  );
}

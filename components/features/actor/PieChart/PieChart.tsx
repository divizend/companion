import { useEffect } from 'react';

import { PieChart as PieChartBase, pieDataItem } from 'react-native-gifted-charts';

import { useThemeColor } from '@/hooks/useThemeColor';

export interface PieDataItem extends pieDataItem {
  id: string;
}

interface PieChartProps<T> {
  data: T[];
  centerLabelComponent: () => JSX.Element;
  selectedSegment: T | null;
  setSelectedSegment: (segment: T | null) => void;
}

export default function PieChart<Datum extends pieDataItem>({
  data,
  centerLabelComponent,
  selectedSegment,
  setSelectedSegment,
}: PieChartProps<Datum>) {
  const theme = useThemeColor();

  const updateFocus = (selected: Datum | null) => {
    data.forEach(segment => {
      segment.focused = selected ? segment === selected : false;
    });
  };

  useEffect(() => {
    updateFocus(selectedSegment);
  }, [selectedSegment]);

  return (
    <PieChartBase
      data={data}
      showGradient
      extraRadius={7}
      focusOnPress
      inwardExtraLengthForFocused={3}
      animationDuration={500}
      radius={130}
      innerRadius={90}
      strokeWidth={1.5}
      strokeColor={theme.backgroundSecondary}
      innerCircleColor={theme.backgroundSecondary}
      focusedPieIndex={selectedSegment ? data.indexOf(selectedSegment) : -1}
      centerLabelComponent={centerLabelComponent}
      onPress={(segment: Datum) => setSelectedSegment(segment?.focused ? null : (segment ?? null))}
    />
  );
}

import { View } from 'react-native';

import { PieDataItem } from './PieChart';

interface PieChartLegendProps<Datum extends PieDataItem> {
  renderLegend: (entry: Datum) => JSX.Element;
  entries: Datum[];
}

const ColoredDot = ({ color }: { color?: string }) => (
  <View
    style={{
      height: 10,
      width: 10,
      borderRadius: 5,
      backgroundColor: color,
      marginRight: 10,
    }}
  />
);

export default function PieChartLegend<Datum extends PieDataItem>({
  renderLegend,
  entries,
}: PieChartLegendProps<Datum>) {
  return (
    <View className="flex flex-row flex-wrap px-3 gap-2.5">
      {entries.map(entry => (
        <View
          key={entry.id}
          className="flex flex-row items-center"
          style={{
            width: entries.length > 1 ? '45%' : '100%',
            justifyContent: entries.length > 1 ? 'center' : 'space-between',
          }}
        >
          <ColoredDot color={entry.color} />
          {renderLegend(entry)}
        </View>
      ))}
    </View>
  );
}

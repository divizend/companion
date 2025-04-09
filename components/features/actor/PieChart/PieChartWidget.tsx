import React, { useState } from 'react';

import Widget from '../Widget';
import PieChart, { PieDataItem } from './PieChart';
import PieChartLegend from './PieChartLegend';

interface PieChartWidgetProps<Datum> {
  title: string;
  data: Datum[];
  ready: boolean;
  renderCenterLabel: () => JSX.Element;
  renderSelectedSegment?: (entry: Datum) => JSX.Element;
  renderLegend: (entry: Datum) => JSX.Element;
  legendEntries?: Datum[];
}

export default function PieChartWidget<Datum extends PieDataItem>({
  title,
  data,
  renderCenterLabel,
  ready,
  renderSelectedSegment,
  renderLegend,
  legendEntries,
}: PieChartWidgetProps<Datum>) {
  const [selectedSegment, setSelectedSegment] = useState<Datum | null>(null);

  return (
    <Widget
      title={title}
      ready={ready}
      styles={{
        container: {
          alignItems: 'center',
          gap: 10,
        },
      }}
    >
      <PieChart
        data={data}
        selectedSegment={selectedSegment}
        setSelectedSegment={setSelectedSegment}
        centerLabelComponent={renderCenterLabel}
      />
      <PieChartLegend
        renderLegend={selectedSegment ? (renderSelectedSegment ?? renderLegend) : renderLegend}
        entries={selectedSegment ? [selectedSegment] : (legendEntries ?? data).slice(0, 6)}
      />
    </Widget>
  );
}

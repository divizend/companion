import { StyleSheet, View } from 'react-native';

import MPTBarChart from '@/components/features/analyze/MPTBarChart';
import PortfolioBarChart from '@/components/features/analyze/PortfolioBarChart';

interface PlotsViewProps {
  depotData: {};
  mptData: {};
  pageNumber: number;
}

export default function PlotsView({ depotData, mptData, pageNumber }: PlotsViewProps) {
  if (pageNumber == 1) {
    return null;
  } else if (pageNumber == 2) {
    return null;
  } else if (pageNumber == 3 && depotData !== null && depotData !== undefined) {
    return <View style={styles.plotcontainer}>{depotData ? <PortfolioBarChart depotData={depotData} /> : null}</View>;
  } else if (
    pageNumber > 3 &&
    depotData !== null &&
    depotData !== undefined &&
    mptData !== null &&
    mptData !== undefined
  ) {
    return (
      <View style={styles.plotcontainer}>
        {mptData ? <MPTBarChart depotData={depotData} mptData={mptData} /> : null}
      </View>
    );
  } else {
    return null;
  }
}

const styles = StyleSheet.create({
  plotcontainer: {
    minHeight: 300,
    flex: 3,
    margin: 0,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
    //   borderWidth: 2,
    //   borderColor: "#FFFFFF",
  },
});

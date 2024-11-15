import { StyleSheet, View } from 'react-native';

import MPTBarChart from '@/app/analyze/mptBarChart';
import PortfolioBarChart from '@/app/analyze/portfolioBarChart';

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
    pageNumber == 4 &&
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
    flex: 2,
    margin: 0,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
    //   borderWidth: 2,
    //   borderColor: "#FFFFFF",
  },
});

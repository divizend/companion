import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface PerformanceTableProps {
  depotData: {};
  mptData: {};
  performanceData: {};
}

export default function PerformanceTable({ depotData, mptData, performanceData }: PerformanceTableProps) {
  const decimal = 4;
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.tableRow}>
          <Text style={styles.rowTextLabel}></Text>
          <View style={styles.verticalSeparator}></View>
          <Text style={styles.rowTextCurrent}>Current</Text>
          <View style={styles.verticalSeparator}></View>
          <Text style={styles.rowTextOptimized}>Optimized</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.rowTextLabel}>Expected Return:</Text>
          <View style={styles.verticalSeparator}></View>
          <Text style={styles.rowText}>{performanceData.expected_return.toFixed(decimal)}</Text>
          <View style={styles.verticalSeparator}></View>
          <Text style={styles.rowText}>{mptData.expected_return.toFixed(decimal)}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.rowTextLabel}>Volatility:</Text>
          <View style={styles.verticalSeparator}></View>
          <Text style={styles.rowText}>{performanceData.volatility.toFixed(decimal)}</Text>
          <View style={styles.verticalSeparator}></View>
          <Text style={styles.rowText}>{mptData.volatility.toFixed(decimal)}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.rowTextLabel}>Sharpe Ratio:</Text>
          <View style={styles.verticalSeparator}></View>
          <Text style={styles.rowText}>{performanceData.sharpe_ratio.toFixed(decimal)}</Text>
          <View style={styles.verticalSeparator}></View>
          <Text style={styles.rowText}>{mptData.sharpe_ratio.toFixed(decimal)}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// Add some basic styling
const styles = StyleSheet.create({
  container: {
    flex: 3,
    padding: 10,
  },
  scrollContainer: {
    alignItems: 'center',
    padding: 5,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  rowTextLabel: {
    fontSize: 12,
    flex: 3,
    color: '#FFFFFF',
    paddingStart: 10,
  },
  rowText: {
    fontSize: 12,
    flex: 2,
    color: '#FFFFFF',
    paddingStart: 10,
  },
  rowTextCurrent: {
    fontSize: 12,
    fontWeight: 'bold',
    flex: 2,
    color: '#3f51b5',
    paddingStart: 10,
  },
  rowTextOptimized: {
    fontSize: 12,
    fontWeight: 'bold',
    flex: 2,
    color: '#f44336',
    paddingStart: 10,
  },
  subHeader: {
    fontWeight: 'bold',
    padding: 10,
    alignSelf: 'flex-start',
  },
  verticalSeparator: {
    height: '150%',
    width: 1,
    backgroundColor: '#FFFFFF',
  },
});

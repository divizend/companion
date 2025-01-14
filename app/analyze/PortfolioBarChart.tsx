import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

const transformDepotDataForChart = depotData => {
  if (Object.keys(depotData).length === 0) {
    return [];
  } else {
    const { weights, security_isins, security_names } = depotData;

    // Map the weights object to an array, matching each ISIN with its name
    return Object.keys(weights).map((isin, index) => {
      const label = security_names[security_isins.indexOf(isin)] || isin; // Match ISIN to name, or use ISIN if name is unavailable
      const value = parseFloat(weights[isin].toFixed(2));
      return { label, value };
    });
  }
};

export default function PortfolioBarChart({ depotData }) {
  const data = transformDepotDataForChart(depotData);

  // Find the maximum value in the dataset for scaling
  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <View style={styles.container}>
      {data.map((item, index) => (
        <View key={index} style={styles.barContainer}>
          {/* Label for each bar */}
          <Text style={styles.label}>{item.label}</Text>
          {/* Bar */}
          <View
            style={[
              styles.bar,
              {
                // Scale the height of each bar based on its value
                height: `${(item.value / maxValue) * 65}%`,
                backgroundColor: item.color || '#3f51b5', // Optional: custom color per bar
              },
            ]}
          />
          {/* Value above each bar */}
          <Text style={styles.value}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 20,
    margin: 0,
    height: 220,
    backgroundColor: '#222222',
  },
  barContainer: {
    alignItems: 'center',
    width: 45,
  },
  label: {
    color: '#EEEEEE',
    marginBottom: 5,
    fontSize: 6,
    textAlign: 'center',
  },
  bar: {
    width: 20,
    borderRadius: 2,
  },
  value: {
    fontSize: 10,
    color: '#EEEEEE',
    marginTop: 4,
  },
});

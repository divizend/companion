import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

const transformDepotDataForChart = (data: {}) => {
  const { weights, security_isins, security_names } = data;

  // Map the weights object to an array, matching each ISIN with its name
  return Object.keys(weights).map((isin, index) => {
    const label = security_names[security_isins.indexOf(isin)] || isin; // Match ISIN to name, or use ISIN if name is unavailable
    const value = parseFloat(weights[isin].toFixed(2));
    return { label, value };
  });
};

const transformMPTDataForChart = (mptData: {}, depotData: {}) => {
  const { weights } = mptData;
  const { security_isins, security_names } = depotData;

  // Map the weights object to an array, matching each ISIN with its name
  return Object.keys(weights).map((isin, index) => {
    const label = security_names[security_isins.indexOf(isin)] || isin; // Match ISIN to name, or use ISIN if name is unavailable
    const value = parseFloat(weights[isin].toFixed(2));
    return { label, value };
  });
};

export default function MPTBarChart({ mptData, depotData }) {
  portfolio1 = transformDepotDataForChart(depotData);
  portfolio2 = transformMPTDataForChart(mptData, depotData);

  // Find all unique securities
  const securities = [...new Set([...portfolio1.map(item => item.label), ...portfolio2.map(item => item.label)])];

  // Find the maximum value across both portfolios for scaling
  const maxValue = Math.max(...portfolio1.map(item => item.value), ...portfolio2.map(item => item.value));

  return (
    <View style={styles.container}>
      {securities.map((security, index) => {
        const portfolio1Data = portfolio1.find(item => item.label === security) || { value: 0 };
        const portfolio2Data = portfolio2.find(item => item.label === security) || { value: 0 };
        return (
          <View key={index} style={styles.barGroupContainer}>
            {/* Label for each security */}
            <Text style={styles.label}>{security}</Text>
            <View style={styles.barContainer}>
              {/* Bar for Portfolio 1 */}
              <View
                style={[
                  styles.bar,
                  {
                    height: `${(portfolio1Data.value / maxValue) * 97}%`,
                    backgroundColor: '#3f51b5', // Color for Portfolio 1
                  },
                ]}
              />
              {/* Space between the two bars */}
              <View style={styles.spacer} />
              {/* Bar for Portfolio 2 */}
              <View
                style={[
                  styles.bar,
                  {
                    height: `${(portfolio2Data.value / maxValue) * 97}%`,
                    backgroundColor: '#f44336', // Color for Portfolio 2
                  },
                ]}
              />
            </View>
            {/* Values below each bar */}
            <View style={styles.valueContainer}>
              <Text style={styles.value}>{portfolio1Data.value}</Text>
              <Text style={styles.value}>{portfolio2Data.value}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 20,
    marginVertical: 0,
    marginHorizontal: 40,
    height: 220,
    backgroundColor: '#222222',
  },
  barGroupContainer: {
    alignItems: 'center',
    width: 80,
  },
  label: {
    color: '#EEEEEE',
    marginBottom: 0,
    fontSize: 5,
    textAlign: 'center',
    width: '40%',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 180,
  },
  bar: {
    width: 12,
    borderRadius: 5,
  },
  spacer: {
    width: 2,
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '20%',
  },
  value: {
    fontSize: 5,
    color: '#EEEEEE',
    textAlign: 'center',
    marginTop: 4,
    marginLeft: 2,
    marginRight: 3,
  },
});

import React, { useEffect, useState } from 'react';

import { Alert, StyleSheet, View } from 'react-native';

import CustomBarChart from '@/app/analyze/bar_chart';
import { apiGet, apiPost } from '@/common/api';
import StyledButton from '@/components/StyledButton';
import { Text } from '@/components/base';
import { SafeAreaView } from '@/components/base/SafeAreaView';

import NavigationButtons from './navigationbuttons';

export default function PlotsView({ portfolioData }) {
  return (
    <View style={styles.plotcontainer}>
      {portfolioData ? (
        <CustomBarChart data={portfolioData} />
      ) : (
        <Text>No portfolio data available. Press the button to fetch data.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  plotcontainer: {
    flex: 1,
    margin: 20,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    //   borderWidth: 2,
    //   borderColor: "#FFFFFF",
  },
});

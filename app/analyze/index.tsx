import React, { useState } from 'react';

import { StyleSheet, View } from 'react-native';

import { SafeAreaView } from '@/components/base/SafeAreaView';

import ExplainView from './explainview';
import NavigationButtons from './navigationbuttons';
import PlotsView from './plotsview';

export default function AnalyzeScreen() {
  const [portfolioData, setPortfolioData] = useState(null);
  const [explainText, setExplainText] = useState(null);

  return (
    <SafeAreaView style={styles.container}>
      <NavigationButtons setPortfolioData={setPortfolioData} setExplainText={setExplainText} />
      <PlotsView portfolioData={portfolioData} />
      <ExplainView explainText={explainText} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
    margin: 0,
    backgroundColor: '#222222',
  },
});

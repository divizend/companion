import React, { useState } from 'react';

import { StyleSheet } from 'react-native';

import { SafeAreaView } from '@/components/base/SafeAreaView';

import ExplainView from './explainview';
import NavigationButtons from './navigationbuttons';
import PlotsView from './plotsview';

export default function AnalyzeScreen() {
  // const [depotID, setDepotID] = useState('671a81f4a36d31f8e9d4e820');
  const [depotID, setDepotID] = useState('672a47e0bae468d6209a8bcc');
  const [portfolioID, setPortfolioID] = useState('');
  const [depotData, setDepotData] = useState({});
  const [mptData, setMPTData] = useState({});
  const [explainText, setExplainText] = useState('');
  const [pageNumber, setPageNumber] = useState(1);

  return (
    <SafeAreaView style={styles.container}>
      <NavigationButtons
        depotID={depotID}
        portfolioID={portfolioID}
        setPortfolioID={setPortfolioID}
        depotData={depotData}
        setDepotData={setDepotData}
        mptData={mptData}
        setMPTData={setMPTData}
        setExplainText={setExplainText}
        pageNumber={pageNumber}
        setPageNumber={setPageNumber}
      />
      <PlotsView depotData={depotData} mptData={mptData} pageNumber={pageNumber} />
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

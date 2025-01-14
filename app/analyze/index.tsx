import React, { useState } from 'react';

import { StyleSheet, View } from 'react-native';
import { LogBox } from 'react-native';

import { SafeAreaView } from '@/components/base/SafeAreaView';

import ExplainView from './Explain';
import MPTButtons from './MPTButtons';
import PerformanceTable from './PerformanceTable';
import PlotsView from './Plots';

LogBox.ignoreLogs(['Image source "null" doesn\'t exist']);

export default function AnalyzeScreen() {
  // const [depotID, setDepotID] = useState('671a81f4a36d31f8e9d4e820'); // with nvidia and etfs
  // const [depotID, setDepotID] = useState('61029a442416930018344956'); // user depot 1
  // const [depotID, setDepotID] = useState('61b0f5bc48801f001b86425f'); // user depot 2
  const [depotID, setDepotID] = useState('672a47e0bae468d6209a8bcc'); // demo depot
  const [portfolioID, setPortfolioID] = useState('');

  const [depotData, setDepotData] = useState({});
  const [mptData, setMPTData] = useState({});
  const [performanceData, setPerformanceData] = useState({});

  const [targetReturn, setTargetReturn] = useState(0.27);
  const [returnRange, setReturnRange] = useState<number[]>([0.01, 1]);

  const [explainText, setExplainText] = useState('');
  const [explainTextLength, setExplainTextLength] = useState(2);

  const [pageNumber, setPageNumber] = useState(1);

  return (
    <SafeAreaView style={styles.container}>
      <MPTButtons
        depotID={depotID}
        portfolioID={portfolioID}
        setPortfolioID={setPortfolioID}
        depotData={depotData}
        setDepotData={setDepotData}
        mptData={mptData}
        setMPTData={setMPTData}
        performanceData={performanceData}
        setPerformanceData={setPerformanceData}
        targetReturn={targetReturn}
        setTargetReturn={setTargetReturn}
        returnRange={returnRange}
        setReturnRange={setReturnRange}
        setExplainText={setExplainText}
        explainTextLength={explainTextLength}
        setExplainTextLength={setExplainTextLength}
        pageNumber={pageNumber}
        setPageNumber={setPageNumber}
      />
      <PlotsView depotData={depotData} mptData={mptData} pageNumber={pageNumber} />
      {pageNumber === 1 || pageNumber === 2 || pageNumber === 3 ? (
        <ExplainView explainText={explainText} />
      ) : (
        <PerformanceTable depotData={depotData} mptData={mptData} performanceData={performanceData}></PerformanceTable>
      )}
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

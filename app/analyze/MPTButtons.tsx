import { useEffect, useState } from 'react';

import { Alert, StyleSheet, View } from 'react-native';

import { Text } from '@/components/base';

import { fetchExplainText } from './ExplainLogic';
import { mainButtonTitle, secondButtonTitle, thirdButtonTitle } from './MPTButtonsTitles';
import { fetchData, updateMPT } from './PortfolioRequests';
import CustomSlider from './Slider';
import StyledButton from './StyledButton';

interface MPTButtonsProps {
  depotID: string;
  portfolioID: string;
  setPortfolioID: (pageNumber: string) => void;
  depotData: {};
  setDepotData: (depotData: {}) => void;
  mptData: {};
  setMPTData: (mptData: {}) => void;
  performanceData: {};
  setPerformanceData: (performanceData: {}) => void;
  targetReturn: number;
  setTargetReturn: (targetReturn: number) => void;
  returnRange: number[];
  setReturnRange: (returnRange: number[]) => void;
  setExplainText: (explainText: string) => void;
  explainTextLength: number;
  setExplainTextLength: (explainTextLength: number) => void;
  pageNumber: number;
  setPageNumber: (pageNumber: number) => void;
}

export default function MPTButtons({
  depotID,
  portfolioID,
  setPortfolioID,
  depotData,
  setDepotData,
  mptData,
  setMPTData,
  performanceData,
  setPerformanceData,
  targetReturn,
  setTargetReturn,
  returnRange,
  setReturnRange,
  setExplainText,
  explainTextLength,
  setExplainTextLength,
  pageNumber,
  setPageNumber,
}: MPTButtonsProps) {
  const nextPage = async (): Promise<void> => {
    pageNumber = pageNumber < 5 ? pageNumber + 1 : 1;
    setPageNumber(pageNumber);
  };

  const handleNextPage = async (pageNumber: number) => {
    setExplainTextLength(2);
    fetchExplainText(setExplainText, pageNumber, depotData, mptData, 2);
    if (pageNumber == 1) {
      fetchData(
        depotID,
        targetReturn,
        setPortfolioID,
        setTargetReturn,
        setReturnRange,
        setDepotData,
        setMPTData,
        setPerformanceData,
      );
    }
  };

  useEffect(() => {
    handleNextPage(pageNumber);
  }, [pageNumber]);

  useEffect(() => {
    fetchExplainText(setExplainText, pageNumber, depotData, mptData, explainTextLength);
  }, [explainTextLength]);

  useEffect(() => {
    if (pageNumber == 4) {
      updateMPT(portfolioID, setMPTData, targetReturn);
    }
  }, [targetReturn]);

  const handleMainButtonPress = async () => {
    await nextPage();
  };
  const handleSecondButtonPress = () => {
    if (pageNumber == 1) {
      Alert.alert('Efficient Frontier is coming soon!');
    } else {
      setExplainTextLength(Math.min(explainTextLength * 2, 8));
      if (explainTextLength == 8) {
        Alert.alert('Reached maximum detail degree!');
      }
    }
  };
  const handleThirdButtonPress = async () => {
    Alert.alert('Simulation is coming soon!');
  };
  const handleSliderChange = async (value: number) => {
    setTargetReturn(value);
  };

  return (
    <View style={styles.buttonscontainer}>
      <Text style={styles.title}>Chose one of the following options:</Text>
      <StyledButton title={mainButtonTitle(pageNumber)} onPress={handleMainButtonPress} />
      {pageNumber < 4 ? <StyledButton title={secondButtonTitle(pageNumber)} onPress={handleSecondButtonPress} /> : null}
      {pageNumber === 1 || pageNumber === 4 ? (
        pageNumber === 4 ? (
          <View>
            <View style={styles.textRow}>
              <Text style={styles.sliderText}>Low Risk</Text>
              <Text style={styles.sliderText}>Target Return: {targetReturn.toFixed(2)}</Text>
              <Text style={styles.sliderText}>High Risk</Text>
            </View>
            <CustomSlider
              value={targetReturn}
              onSlidingComplete={handleSliderChange}
              thumbStyle={styles.thumb}
              trackStyle={styles.track}
              minimumValue={returnRange[0]}
              maximumValue={returnRange[1]}
            />
          </View>
        ) : (
          <StyledButton title={thirdButtonTitle(pageNumber)} onPress={handleThirdButtonPress} />
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  buttonscontainer: {
    flex: 1,
    marginTop: 80,
    marginHorizontal: 20,
    padding: 10,
    paddingBottom: 40,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    marginBottom: 2,
  },
  textRow: {
    margin: 0,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderText: {
    fontSize: 11,
    textAlign: 'center',
  },
  thumb: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: '#f44336',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  track: {
    width: 320,
    height: 3,
    borderRadius: 0,
  },
});

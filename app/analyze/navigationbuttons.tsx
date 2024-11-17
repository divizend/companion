import { useEffect, useState } from 'react';

import { Alert, StyleSheet, View } from 'react-native';

import { apiGet, apiPost } from '@/common/api';
import { Text } from '@/components/base';

import fetchExplainText from './explainTextLogic';
import StyledButton from './styled_button';

const mainButtonTitle = (page_number: number) => {
  if (page_number == 1) {
    return 'Modern Portfolio Theory';
  }
  if (page_number == 2) {
    return 'Show my Portfolio';
  }
  if (page_number == 3) {
    return 'Optimize my Portfolio';
  }
  if (page_number == 4) {
    return 'Start from the beginning';
  }
};

const secondButtonTitle = (page_number: number) => {
  if (page_number == 1) {
    return 'Efficient Frontier (Coming soon)';
  }
  if (page_number == 2) {
    return 'Explain Modern Portfolio Theory in more detail';
  }
  if (page_number == 3) {
    return 'Show my Portfolio in more detail';
  }
  if (page_number == 4) {
    return 'Explain portfolio optimization in more detail';
  }
};

const thirdButtonTitle = (page_number: number) => {
  if (page_number == 1) {
    return 'Simulate crashes (Coming soon)';
  }
  if (page_number == 2) {
    return 'Explain Diversification';
  }
  if (page_number == 3) {
    return 'Explain Risk managment';
  }
  if (page_number == 4) {
    return 'Explain Sharpe Ratio';
  }
};

interface NavigationButtonsProps {
  depotID: string;
  portfolioID: string;
  setPortfolioID: (pageNumber: string) => void;
  depotData: {};
  setDepotData: (depotData: {}) => void;
  mptData: {};
  setMPTData: (mptData: {}) => void;
  setExplainText: (explainText: string) => void;
  explainTextLength: number;
  setExplainTextLength: (explainTextLength: number) => void;
  pageNumber: number;
  setPageNumber: (pageNumber: number) => void;
}

export default function NavigationButtons({
  depotID,
  portfolioID,
  setPortfolioID,
  depotData,
  setDepotData,
  mptData,
  setMPTData,
  setExplainText,
  explainTextLength,
  setExplainTextLength,
  pageNumber,
  setPageNumber,
}: NavigationButtonsProps) {
  const nextPage = async (): Promise<void> => {
    pageNumber = pageNumber < 4 ? pageNumber + 1 : 1;
    setPageNumber(pageNumber);
  };

  const handleNextPage = async (pageNumber: number) => {
    setExplainTextLength(2);
    if (pageNumber == 2) {
      fetchPortfolio(setDepotData, setPortfolioID);
    }
    if (pageNumber == 3) {
      fetchMPT(setMPTData, depotData);
    }
  };

  const fetchPortfolio = async (setPortfolioData: {}, setPortfolioID: string) => {
    const postbody = { depot_id: depotID };
    const portfolioPostAnswer = await apiPost(`/companion/portfolio`, postbody);
    if (portfolioPostAnswer) {
      const { id } = portfolioPostAnswer;
      setPortfolioID(id);
      const queryParams = new URLSearchParams({ portfolio_id: id }).toString();
      const urlWithParams = `/companion/portfolio?${queryParams}`;
      const depot = await apiGet(urlWithParams);
      setPortfolioData(depot);
      const postbody = { portfolio_id: id };
      const mptPostAnswer = await apiPost(`/companion/mpt`, postbody);
    }
  };

  const fetchMPT = async (setMPTData: (mptData: {}) => void, depotData: {}) => {
    const queryParams = new URLSearchParams({ portfolio_id: portfolioID }).toString();
    const urlWithParams = `/companion/mpt?${queryParams}`;
    const mptData = await apiGet(urlWithParams);
    setMPTData(mptData);
  };

  useEffect(() => {
    handleNextPage(pageNumber);
  }, [pageNumber]);

  useEffect(() => {
    fetchExplainText(setExplainText, pageNumber, depotData, mptData, explainTextLength);
  }, [explainTextLength]);

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
  const handleThirdButtonPress = () => {
    Alert.alert('Simulation is coming soon!');
  };

  return (
    <View style={styles.buttonscontainer}>
      <Text style={styles.title}>Chose one of the following options:</Text>
      <StyledButton title={mainButtonTitle(pageNumber)} onPress={handleMainButtonPress} />
      <StyledButton title={secondButtonTitle(pageNumber)} onPress={handleSecondButtonPress} />
      {pageNumber == 1 ? <StyledButton title={thirdButtonTitle(pageNumber)} onPress={handleThirdButtonPress} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  buttonscontainer: {
    flex: 1,
    marginTop: 100,
    marginHorizontal: 20,
    padding: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    //   borderWidth: 2,
    //   borderColor: "#FFFFFF",
  },
  title: {
    fontSize: 14,
    marginBottom: 2,
  },
});

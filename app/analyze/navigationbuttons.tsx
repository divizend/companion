import { useEffect, useState } from 'react';

import { Alert, StyleSheet, View } from 'react-native';

import { apiGet, apiPost } from '@/common/api';
import { Text } from '@/components/base';

import fetchExplainText from './explainTextLogic';
import CustomSlider from './slider';
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
    return 'Recalculate';
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
  targetReturn: number;
  setTargetReturn: (targetReturn: number) => void;
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
  targetReturn,
  setTargetReturn,
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
    fetchExplainText(setExplainText, pageNumber, depotData, mptData, 2);
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
      const postbody = { portfolio_id: id, targetReturn: targetReturn };
      const mptPostAnswer = await apiPost(`/companion/mpt`, postbody);
    }
  };

  const fetchMPT = async (setMPTData: (mptData: {}) => void) => {
    const queryParams = new URLSearchParams({ portfolio_id: portfolioID }).toString();
    const urlWithParams = `/companion/mpt?${queryParams}`;
    const mptData = await apiGet(urlWithParams);
    setMPTData(mptData);
  };

  const updateMPT = async () => {
    const postbody = { portfolio_id: portfolioID, targetReturn: targetReturn };
    const mptPostAnswer = await apiPost(`/companion/mpt`, postbody);

    const pollMPTData = async () => {
      const queryParams = new URLSearchParams({ portfolio_id: portfolioID }).toString();
      const urlWithParams = `/companion/mpt?${queryParams}`;

      while (true) {
        const mptData = await apiGet(urlWithParams);

        // Check if the status is 'done'
        if (mptData.status === 'done') {
          setMPTData(mptData);
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    };
    pollMPTData();
  };

  useEffect(() => {
    handleNextPage(pageNumber);
  }, [pageNumber]);

  useEffect(() => {
    fetchExplainText(setExplainText, pageNumber, depotData, mptData, explainTextLength);
  }, [explainTextLength]);

  useEffect(() => {
    updateMPT();
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
  const handleSliderChange = async value => {
    setTargetReturn(value);
  };

  return (
    <View style={styles.buttonscontainer}>
      <Text style={styles.title}>Chose one of the following options:</Text>
      <StyledButton title={mainButtonTitle(pageNumber)} onPress={handleMainButtonPress} />
      <StyledButton title={secondButtonTitle(pageNumber)} onPress={handleSecondButtonPress} />
      {pageNumber === 1 || pageNumber === 4 ? (
        pageNumber === 4 ? (
          <View>
            <Text style={styles.sliderText}>Target Return: {targetReturn.toFixed(2)}</Text>
            <CustomSlider
              value={targetReturn}
              onSlidingComplete={handleSliderChange}
              thumbStyle={styles.thumb}
              trackStyle={styles.track}
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
    //   borderWidth: 2,
    //   borderColor: "#FFFFFF",
  },
  title: {
    fontSize: 14,
    marginBottom: 2,
  },
  sliderText: {
    fontSize: 12,
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

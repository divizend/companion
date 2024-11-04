import React, { useEffect, useState } from 'react';

import { Alert, StyleSheet, View } from 'react-native';

import CustomBarChart from '@/app/analyze/bar_chart';
import { apiGet, apiPost } from '@/common/api';
import { Text } from '@/components/base';
import { SafeAreaView } from '@/components/base/SafeAreaView';

import StyledButton from './styled_button';

const transformDataForChart = data => {
  const { weights, security_isins, security_names } = data;

  // Map the weights object to an array, matching each ISIN with its name
  return Object.keys(weights).map((isin, index) => {
    const label = security_names[security_isins.indexOf(isin)] || isin; // Match ISIN to name, or use ISIN if name is unavailable
    const value = parseFloat(weights[isin].toFixed(2));
    return { label, value };
  });
};

const mainButtonTitle = page_number => {
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

const secondButtonTitle = page_number => {
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

const thirdButtonTitle = page_number => {
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

export default function NavigationButtons({ setPortfolioData, setExplainText }) {
  const [pageNumber, setPageNumber] = useState(1);

  const nextPage = async () => {
    if (pageNumber < 4) {
      setPageNumber(pageNumber + 1);
    } else {
      setPageNumber(1);
    }
  };

  const fetchText = async topic => {
    const queryParams = new URLSearchParams({ topic: topic }).toString();
    const urlWithParams = `/companion/explain?${queryParams}`;
    const response = await apiGet(urlWithParams);
    const text = response.text;
    setExplainText(text);
  };

  const handleMainButtonPress = async () => {
    await nextPage();
    const topic = 'Modern Portfolio Theory';
    await fetchText(topic);
    const postbody = { depot_id: '671a81f4a36d31f8e9d4e820' };
    const taskAnswer = await apiPost(`/companion/portfolio`, postbody);
    if (taskAnswer) {
      const { id } = taskAnswer;
      const queryParams = new URLSearchParams({ portfolio_id: id }).toString();
      const urlWithParams = `/companion/portfolio?${queryParams}`;
      const portfolio = await apiGet(urlWithParams);
      const data = transformDataForChart(portfolio);
      setPortfolioData(data);
    }
  };
  const handleSecondButtonPress = () => {
    Alert.alert('Efficient Frontier is coming soon!');
  };
  const handleThirdButtonPress = () => {
    Alert.alert('Simulation is coming soon!');
  };

  return (
    <View style={styles.buttonscontainer}>
      <Text style={styles.title}>Chose one of the following options:</Text>
      <StyledButton
        containerStyle={styles.buttoncontainer}
        title={mainButtonTitle(pageNumber)}
        onPress={handleMainButtonPress}
      />
      <StyledButton
        containerStyle={styles.buttoncontainer}
        title={secondButtonTitle(pageNumber)}
        onPress={handleSecondButtonPress}
      />
      <StyledButton
        containerStyle={styles.buttoncontainer}
        title={thirdButtonTitle(pageNumber)}
        onPress={handleThirdButtonPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  buttonscontainer: {
    flex: 1,
    marginTop: 100,
    marginHorizontal: 20,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    //   borderWidth: 2,
    //   borderColor: "#FFFFFF",
  },
  title: {
    fontSize: 15,
    marginBottom: 2,
  },
});

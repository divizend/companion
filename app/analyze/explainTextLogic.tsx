import { apiGet } from '@/common/api';

function getNamesAndWeights(depotData) {
  const { security_isins, security_names, weights } = depotData;
  const namesAndWeights = {};

  // Loop through the security ISINs and map each to its name and weight
  security_isins.forEach((isin, index) => {
    const name = security_names[index];
    const weight = weights[isin];
    namesAndWeights[name] = weight;
  });
  return namesAndWeights;
}

function getNamesAndWeightsFromMPT(depotData, mptData) {
  const { security_isins, security_names } = depotData;
  const { weights: mptWeights } = mptData;
  const namesAndOptimizedWeights = {};

  security_isins.forEach((isin, index) => {
    const name = security_names[index];
    const optimizedWeight = mptWeights[isin];
    if (optimizedWeight !== undefined) {
      // Ensure there's a weight in MPT for this ISIN
      namesAndOptimizedWeights[name] = optimizedWeight;
    }
  });

  return namesAndOptimizedWeights;
}

export default async function fetchText(setExplainText, pageNumber, depotData, mptData) {
  if (pageNumber == 1) {
    setExplainText(null);
  } else if (pageNumber == 2) {
    const topic = 'Modern Portfolio Theory.';
    const queryParams = new URLSearchParams({ topic: topic }).toString();
    const urlWithParams = `/companion/explain?${queryParams}`;
    const response = await apiGet(urlWithParams);
    const text = response.text;
    setExplainText(text);
  } else if (pageNumber == 3) {
    const topic = `this portfolio ${JSON.stringify(getNamesAndWeights(depotData), null, 2)}. Please focus on the different stocks, which sectors they come from and tell me if this is a well balanced portfolio with a good diversification.`;
    const queryParams = new URLSearchParams({ topic: topic }).toString();
    const urlWithParams = `/companion/explain?${queryParams}`;
    const response = await apiGet(urlWithParams);
    const text = response.text;
    setExplainText(text);
  } else if (pageNumber == 4) {
    const depotWeights = JSON.stringify(getNamesAndWeights(depotData), null, 2);
    const optimizedWeights = JSON.stringify(getNamesAndWeightsFromMPT(depotData, mptData), null, 2);
    const topic = ` how the portfolio ${depotWeights} was optimized to ${optimizedWeights} and why the optimized version is better.`;
    console.log(topic);
    const queryParams = new URLSearchParams({ topic: topic }).toString();
    const urlWithParams = `/companion/explain?${queryParams}`;
    const response = await apiGet(urlWithParams);
    const text = response.text;
    setExplainText(text);
  }
}

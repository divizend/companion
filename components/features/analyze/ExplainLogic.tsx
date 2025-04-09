import { apiGet } from '@/common/api';

function getNamesAndWeights(depotData: any) {
  const { securities } = depotData;
  const namesAndWeights = {};

  securities.forEach(({ isin, name, weight }) => {
    namesAndWeights[name] = weight;
  });
  return namesAndWeights;
}

function getNamesAndWeightsFromMPT(depotData: any, mptData: any) {
  const { securities } = depotData;
  const { weights: mptWeights } = mptData;
  const namesAndOptimizedWeights = {};

  securities.forEach(({ isin, name, weight }) => {
    const optimizedWeight = mptWeights[isin];
    if (optimizedWeight !== undefined) {
      namesAndOptimizedWeights[name] = optimizedWeight;
    }
  });

  return namesAndOptimizedWeights;
}

export async function fetchExplainText(
  setExplainText: any,
  pageNumber: any,
  depotData: any,
  mptData: any,
  explainTextLength: any,
) {
  if (pageNumber == 1) {
    setExplainText(null);
  } else if (pageNumber == 2) {
    const topic = 'Modern Portfolio Theory.';
    const queryParams = new URLSearchParams({ topic: topic, length: explainTextLength }).toString();
    const urlWithParams = `/companion/explain?${queryParams}`;
    const response = await apiGet(urlWithParams);
    const text = response.text;
    setExplainText(text);
  } else if (pageNumber == 3) {
    const topic = `this portfolio ${JSON.stringify(getNamesAndWeights(depotData), null, 2)}. 
    Please focus on the different stocks, which sectors they come from and tell me if this is a well balanced portfolio with a good diversification.`;
    const queryParams = new URLSearchParams({ topic: topic, length: explainTextLength }).toString();
    const urlWithParams = `/companion/explain?${queryParams}`;
    const response = await apiGet(urlWithParams);
    const text = response.text;
    setExplainText(text);
  } else if (pageNumber == 4) {
    // const depotWeights = JSON.stringify(getNamesAndWeights(depotData), null, 2);
    // const optimizedWeights = JSON.stringify(getNamesAndWeightsFromMPT(depotData, mptData), null, 2);
    // const topic = ` how the portfolio ${depotWeights} was optimized to ${optimizedWeights} and why the optimized version is better.`;
    // const queryParams = new URLSearchParams({ topic: topic, length: explainTextLength }).toString();
    // const urlWithParams = `/companion/explain?${queryParams}`;
    // const response = await apiGet(urlWithParams);
    // const text = response.text;
    setExplainText('');
  } else if (pageNumber == 5) {
    const depotWeights = JSON.stringify(getNamesAndWeights(depotData), null, 2);
    const optimizedWeights = JSON.stringify(getNamesAndWeightsFromMPT(depotData, mptData), null, 2);
    const topic = `
    The current portfolio ${depotWeights} was optimized to ${optimizedWeights} using Modern Portfolio Theory (MPT), 
    aiming to reduce risk for a given target return. This optimization is based on one year of historical daily data 
    and reflects asset correlations and volatilities over that period. 
    Provide a clear, step-by-step recommendation on which assets to sell and which to buy, 
    focusing on minimizing transaction costs by suggesting only the most impactful trades. 
    Explain how these changes reduce risk or improve diversification based on asset correlations. 
    Also, clarify that this is a model-based suggestion and should be double-checked with sound judgment, 
    as past performance does not guarantee future results. 
    Make the explanation simple, actionable, and easy to understand.`;
    const queryParams = new URLSearchParams({ topic: topic, length: explainTextLength + 2 }).toString();
    const urlWithParams = `/companion/explain?${queryParams}`;
    const response = await apiGet(urlWithParams);
    const text = response.text;
    setExplainText(text);
  }
}

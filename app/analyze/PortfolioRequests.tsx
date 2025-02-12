import { get } from 'lodash';

import { apiGet, apiPost } from '@/common/api';

async function pollRequest<T>(
  requestFunction: () => Promise<T>,
  conditionFunction: (data: T) => boolean,
  interval: number = 100,
  maxAttempts: number = 20,
): Promise<T> {
  let attempts = 0;

  const executePoll = async (resolve: Function, reject: Function): Promise<void> => {
    try {
      const result = await requestFunction();
      if (conditionFunction(result)) {
        resolve(result);
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(() => executePoll(resolve, reject), interval);
      } else {
        reject(new Error('Max polling attempts reached'));
      }
    } catch (error) {
      reject(error);
    }
  };

  return new Promise((resolve, reject) => {
    executePoll(resolve, reject);
  });
}

const createPortfolio = async (depotID: string): Promise<string> => {
  const postbody = { depot_id: depotID };
  const response = await apiPost(`/companion/portfolio`, postbody);
  if (response) {
    return response.id;
  } else {
    return '';
  }
};

const getPortfolioData = async (portfolioID: string): Promise<any> => {
  const queryParams = new URLSearchParams({ portfolio_id: portfolioID }).toString();
  const urlWithParams = `/companion/portfolio?${queryParams}`;
  const depotData = pollRequest(
    () => apiGet(urlWithParams),
    data => data.status === 'done',
    50,
    100,
  );
  return depotData;
};

const createMPT = async (portfolioID: string, targetReturn: number): Promise<void> => {
  const postbody = { portfolio_id: portfolioID, targetReturn: targetReturn };
  const mptPostAnswer = await apiPost(`/companion/mpt`, postbody);
  return mptPostAnswer;
};

const getMPTData = async (portfolioID: string): Promise<any> => {
  const queryParams = new URLSearchParams({ portfolio_id: portfolioID }).toString();
  const urlWithParams = `/companion/mpt?${queryParams}`;
  const mptData = pollRequest(
    () => apiGet(urlWithParams),
    data => data.status === 'done',
    50,
    100,
  );
  return mptData;
};

const createEF = async (portfolioID: string, targetReturn: number): Promise<void> => {
  const postbody = { portfolio_id: portfolioID, targetReturn: targetReturn };
  const efPostAnswer = await apiPost(`/companion/ef`, postbody);
  return efPostAnswer;
};

const getEFData = async (portfolioID: string): Promise<any> => {
  const queryParams = new URLSearchParams({ portfolio_id: portfolioID }).toString();
  const efUrlWithParams = `/companion/ef?${queryParams}`;
  const efData = pollRequest(
    () => apiGet(efUrlWithParams),
    data => data.status === 'done',
    100,
    100,
  );
  return efData;
};

const createPerformance = async (portfolioID: string): Promise<void> => {
  const postbody = { portfolio_id: portfolioID };
  const performancePostAnswer = await apiPost(`/companion/performance`, postbody);
  return performancePostAnswer;
};

const getPerformanceData = async (portfolioID: string): Promise<any> => {
  const queryParams = new URLSearchParams({ portfolio_id: portfolioID }).toString();
  const performanceUrlWithParams = `/companion/performance?${queryParams}`;
  const performanceData = pollRequest(
    () => apiGet(performanceUrlWithParams),
    data => data.status === 'done',
    50,
    100,
  );
  return performanceData;
};

const createCorrelationMatrix = async (portfolioID: string): Promise<void> => {
  const postbody = { portfolio_id: portfolioID };
  const cmPostAnswer = await apiPost(`/companion/cm`, postbody);
  return cmPostAnswer;
};

const getCorrelationMatrix = async (portfolioID: string): Promise<any> => {
  const queryParams = new URLSearchParams({ portfolio_id: portfolioID }).toString();
  const cmUrlWithParams = `/companion/cm?${queryParams}`;
  const cmData = pollRequest(
    () => apiGet(cmUrlWithParams),
    data => data.status === 'done',
    50,
    100,
  );
  return cmData;
};

const createHRP = async (portfolioID: string, total_liquidity: number): Promise<void> => {
  const postbody = { portfolio_id: portfolioID, total_liquidity: total_liquidity };
  const hrpPostAnswer = await apiPost(`/companion/hrp`, postbody);
  return hrpPostAnswer;
};

const getHRP = async (portfolioID: string): Promise<any> => {
  const queryParams = new URLSearchParams({ portfolio_id: portfolioID }).toString();
  const hrpUrlWithParams = `/companion/hrp?${queryParams}`;
  const hrpData = pollRequest(
    () => apiGet(hrpUrlWithParams),
    data => data.status === 'done',
    50,
    20,
  );
  return hrpData;
};

export const fetchData = async (
  depotID: string,
  targetReturn: number,
  setPortfolioID: (pageNumber: string) => void,
  setTargetReturn: (targetReturn: number) => void,
  setReturnRange: (returnRange: number[]) => void,
  setDepotData: (depotData: {}) => void,
  setMPTData: (mptData: {}) => void,
  setPerformanceData: (performanceData: {}) => void,
) => {
  const portfolioID = await createPortfolio(depotID);
  setPortfolioID(portfolioID);
  console.log('portfolio created, start data loading process');
  const portfolioData = await getPortfolioData(portfolioID);
  setDepotData(portfolioData);

  // const cmAnswer = await createCorrelationMatrix(portfolioID);
  // const cmData = await getCorrelationMatrix(portfolioID);

  // const hrpAnswer = await createHRP(portfolioID, 100)
  // console.log(hrpAnswer)
  // const hrpData = await getHRP(portfolioID)
  // console.log(hrpData)

  await createEF(portfolioID, targetReturn);
  const efData = await getEFData(portfolioID);
  const min_return = efData['minimized_volatility']['performance']['expected_return'];
  const max_return = efData['maximized_return']['performance']['expected_return'];
  const sharpe_return = efData['maximized_sharpe_ratio']['performance']['expected_return'];
  const return_range = [min_return, max_return];
  setReturnRange(return_range);
  setTargetReturn(sharpe_return);

  await createMPT(portfolioID, sharpe_return);
  const mptData = await getMPTData(portfolioID);
  setMPTData(mptData);

  await createPerformance(portfolioID);
  const performanceData = await getPerformanceData(portfolioID);
  setPerformanceData(performanceData);

  console.log('finished data loading process');
};

export const updateMPT = async (portfolioID: string, setMPTData: (mptData: {}) => void, targetReturn: number) => {
  await createMPT(portfolioID, targetReturn);

  const mptData = await getMPTData(portfolioID);
  setMPTData(mptData);
};

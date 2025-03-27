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

const createPortfolio = async (depotIDs: string[]): Promise<string> => {
  const postbody = { depot_ids: depotIDs };
  const response = await apiPost(`/companion/portfolio`, postbody);
  if (response) {
    return response.id;
  } else {
    return '';
  }
};

const getPortfolioData = async (portfolioID: string): Promise<any> => {
  const urlWithParams = `/companion/portfolio/${portfolioID}`;
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
  const urlWithParams = `/companion/mpt/${portfolioID}`;
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
  const efUrlWithParams = `/companion/ef/${portfolioID}`;
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
  const performanceUrlWithParams = `/companion/performance/${portfolioID}`;
  const performanceData = pollRequest(
    () => apiGet(performanceUrlWithParams),
    data => data.status === 'done',
    50,
    100,
  );
  return performanceData;
};

const createSimulation = async (portfolioID: string, scenario: string): Promise<void> => {
  const postbody = { portfolio_id: portfolioID, scenario: scenario };
  const simulationPostAnswer = await apiPost(`/companion/simulation`, postbody);
  return simulationPostAnswer;
};

const getSimulation = async (portfolioID: string, duration_months: number): Promise<any> => {
  const queryParams = new URLSearchParams({
    duration_months: duration_months.toString(),
  }).toString();
  const simUrlWithParams = `/companion/simulation/${portfolioID}?${queryParams}`;
  const simData = await pollRequest(
    () => apiGet(simUrlWithParams),
    data => data && (data.status === 'done' || data.status === 'insufficient_data'),
    500,
    50,
  );
  if (simData.status === 'insufficient_data') {
    console.error('Error fetching simulation data:', simData);
    return null;
  } else {
    return simData;
  }
};

const createCorrelationMatrix = async (portfolioID: string): Promise<void> => {
  const postbody = { portfolio_id: portfolioID };
  const cmPostAnswer = await apiPost(`/companion/cm`, postbody);
  return cmPostAnswer;
};

const getCorrelationMatrix = async (portfolioID: string): Promise<any> => {
  const cmUrlWithParams = `/companion/cm/${portfolioID}`;
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
  const hrpUrlWithParams = `/companion/hrp/${portfolioID}`;
  const hrpData = pollRequest(
    () => apiGet(hrpUrlWithParams),
    data => data && data.status === 'done',
    50,
    20,
  );
  return hrpData;
};

export const fetchSimulationData = async (depotIDs: string[], range: number, scenario: string) => {
  const portfolioID = await createPortfolio(depotIDs);
  const portfolioData = await getPortfolioData(portfolioID);

  const simulationAnswer = await createSimulation(portfolioID, scenario);
  return { simulationData: await getSimulation(portfolioID, range), depotData: portfolioData, simulationAnswer };
};

export const fetchData = async (
  depotIDs: string[],
  targetReturn: number,
  setPortfolioID: (pageNumber: string) => void,
  setTargetReturn: (targetReturn: number) => void,
  setReturnRange: (returnRange: number[]) => void,
  setDepotData: (depotData: {}) => void,
  setMPTData: (mptData: {}) => void,
  setPerformanceData: (performanceData: {}) => void,
) => {
  const portfolioID = await createPortfolio(depotIDs);
  setPortfolioID(portfolioID);
  const portfolioData = await getPortfolioData(portfolioID);
  setDepotData(portfolioData);

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

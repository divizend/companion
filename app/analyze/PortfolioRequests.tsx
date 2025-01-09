import { apiGet, apiPost } from '@/common/api';

async function pollRequest<T>(
  requestFunction: () => Promise<T>,
  conditionFunction: (data: T) => boolean,
  interval: number = 500,
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
    500,
    20,
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
    500,
    20,
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
    500,
    50,
  );
  return efData;
};

export const fetchDepot = async (
  depotID: string,
  targetReturn: number,
  setDepotData: (depotData: {}) => void,
  setPortfolioID: (pageNumber: string) => void,
) => {
  const portfolioID = await createPortfolio(depotID);
  setPortfolioID(portfolioID);

  const portfolioData = await getPortfolioData(portfolioID);
  setDepotData(portfolioData);

  await createMPT(portfolioID, targetReturn);
};

export const fetchMPT = async (
  portfolioID: string,
  targetReturn: number,
  setMPTData: (mptData: {}) => void,
  setTargetReturn: (targetReturn: number) => void,
  setReturnRange: (returnRange: number[]) => void,
) => {
  const mptData = await getMPTData(portfolioID);
  setMPTData(mptData);

  await createEF(portfolioID, targetReturn);

  const efData = await getEFData(portfolioID);
  const min_return = efData['minimized_volatility']['performance']['expected_return'];
  const max_return = efData['maximized_return']['performance']['expected_return'];
  const sharpe_return = efData['maximized_sharpe_ratio']['performance']['expected_return'];
  const return_range = [min_return, max_return];
  setReturnRange(return_range);
  setTargetReturn(sharpe_return);
};

export const updateMPT = async (portfolioID: string, setMPTData: (mptData: {}) => void, targetReturn: number) => {
  const postbody = { portfolio_id: portfolioID, targetReturn: targetReturn };
  const mptPostAnswer = await apiPost(`/companion/mpt`, postbody);
  const pollMPTData = async () => {
    const queryParams = new URLSearchParams({ portfolio_id: portfolioID }).toString();
    const urlWithParams = `/companion/mpt?${queryParams}`;
    while (true) {
      const mptData = await apiGet(urlWithParams);
      if (mptData.status === 'done') {
        setMPTData(mptData);
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };
  pollMPTData();
};

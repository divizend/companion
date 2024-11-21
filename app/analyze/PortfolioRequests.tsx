import { apiGet, apiPost } from '@/common/api';

export const fetchDepot = async (
  depotID: string,
  setDepotData: (depotData: {}) => void,
  setPortfolioID: (pageNumber: string) => void,
  targetReturn: number,
) => {
  const postbody = { depot_id: depotID };
  const portfolioPostAnswer = await apiPost(`/companion/portfolio`, postbody);
  if (portfolioPostAnswer) {
    const { id: portfolioID } = portfolioPostAnswer;
    setPortfolioID(portfolioID);
    const queryParams = new URLSearchParams({ portfolio_id: portfolioID }).toString();
    const urlWithParams = `/companion/portfolio?${queryParams}`;
    const depot = await apiGet(urlWithParams);
    setDepotData(depot);
    const postbody = { portfolio_id: portfolioID, targetReturn: targetReturn };
    const mptPostAnswer = await apiPost(`/companion/mpt`, postbody);
  }
};

export const fetchMPT = async (
  portfolioID: string,
  setMPTData: (mptData: {}) => void,
  targetReturn: number,
  setTargetReturn: (targetReturn: number) => void,
  setReturnRange: (returnRange: number[]) => void,
) => {
  const queryParams = new URLSearchParams({ portfolio_id: portfolioID }).toString();
  const urlWithParams = `/companion/mpt?${queryParams}`;
  const mptData = await apiGet(urlWithParams);
  setMPTData(mptData);
  const postbody = { portfolio_id: portfolioID, targetReturn: targetReturn };
  const efPostAnswer = await apiPost(`/companion/ef`, postbody);
  const efurlWithParams = `/companion/ef?${queryParams}`;
  const pollEfData = async () => {
    const maxRetries = 30; // Maximum number of retries (e.g., 30 seconds)
    let retries = 0;
    while (retries < maxRetries) {
      const efData = await apiGet(efurlWithParams);
      if (efData.status === 'done') {
        console.log('Efficient frontier computation completed!');
        return efData;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      retries++;
    }
    console.error("Polling timed out. Status did not reach 'done' in time.");
    throw new Error('Efficient frontier computation timed out.');
  };

  try {
    const finalEfData = await pollEfData();
    const min_return = finalEfData['minimized_volatility']['performance']['expected_return'];
    const max_return = finalEfData['maximized_return']['performance']['expected_return'];
    const sharpe_return = finalEfData['maximized_sharpe_ratio']['performance']['expected_return'];
    const return_range = [min_return, max_return];
    console.log(return_range);
    setReturnRange(return_range);
    setTargetReturn(sharpe_return);
  } catch (error) {
    console.error('Error during polling:', error);
  }
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

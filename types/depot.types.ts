export interface UserProfileDepot {
  id: string;
  isClone?: boolean;
  bankName?: string;
  bankType?: string;
  bankId?: string;
  bankInterface?: string;
  number?: string;
  description?: string;
  createdAt: Date;
  syncedAt: Date;
  ownerLists: {
    shareOwned: number;
    owners: {
      legalEntityId: string;
    }[];
  }[];
  tooltipName?: string;
  accountStatements: {
    id: string;
    start: Date;
    end: Date;
  }[];
  portfolioStatements: {
    id: string;
    date: Date;
  }[];
  stocks: UserProfileDepotStocks;
  unassignedOrganization?: string;
}

export type UserProfileDepotStocks = {
  [isin: string]: {
    transactionReceipts: {
      id: string;
      date: Date;
    }[];
  };
};

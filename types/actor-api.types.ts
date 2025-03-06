export interface ActorRequest {
  id?: string;
  type: ActorRequestType;
}

export enum ActorRequestType {
  __INTERNAL_REQUEST,
  INITIALIZE_REQUEST,
  GET_QUOTES_REQUEST,
  GET_QUOTE_REQUEST,
  SUBSCRIBE_QUOTE_REQUEST,
  GET_TOP_THREE_REQUEST,
  GET_PERFORMANCE_REQUEST,
  GET_CALENDAR_REQUEST,
  GET_PORTFOLIO_STATS_REQUEST,
  GET_TOP_THREE_WORST_THREE_REQUEST,
  GET_CURRENCY_QUOTE_REQUEST,
  GET_CALENDAR_DIVIDEND_DETAILS_REQUEST,
  GET_CALENDAR_DAY_DETAILS_REQUEST,
  GET_COMPANY_PERFORMANCE_REQUEST,
  GET_COMPANY_QUOTES_REQUEST,
  GET_COMPANY_DIVIDEND_HISTORY_REQUEST,
  GET_COMPANY_FINANCIALS_REQUEST,
  GET_COMPANY_SECTOR_REQUEST,
  GET_SECTOR_REQUEST,
}

export interface ActorResponse {
  id?: string;
  type: ActorResponseType;
}

export enum ActorResponseType {
  __INTERNAL_RESPONSE,
  INITIALIZE_RESPONSE,
  QUOTES_RESPONSE,
  QUOTE_RESPONSE,
  TOP_THREE_RESPONSE,
  PERFORMANCE_RESPONSE,
  CALENDAR_RESPONSE,
  PORTFOLIO_STATS_RESPONSE,
  TOP_THREE_WORST_THREE_RESPONSE,
  CURRENCY_QUOTE_RESPONSE,
  CALENDAR_DIVIDEND_DETAILS_RESPONSE,
  GET_CALENDAR_DAY_DETAILS_RESPONSE,
  COMPANY_PERFORMCE_RESPONSE,
  COMPANY_QUOTES_RESPONSE,
  COMPANY_DIVIDEND_HISTORY_RESPONSE,
  GET_COMPANY_FINANCIALS_RESPONSE,
  GET_SECTOR_RESPONSE,
  ERROR_RESPONSE,
}

export type Yield = {
  amount: number;
  unit: string;
  frequency?: string; // TODO: FetchedDividendYieldFrequency
};

/*
 * __INTERNAL_REQUEST
 */

export interface InternalRequest extends ActorRequest {
  type: ActorRequestType.__INTERNAL_REQUEST;
  method: string;
  data: any;
}

export interface InternalResponse extends ActorResponse {
  type: ActorResponseType.__INTERNAL_RESPONSE;
  data: any;
}

/*
 * INITIALIZE_REQUEST
 */

export interface InitializeRequest extends ActorRequest {
  type: ActorRequestType.INITIALIZE_REQUEST;
  data: SecurityAccount & {
    currency: string;
  };
}

export interface InitializeResponse extends ActorResponse {
  type: ActorResponseType.INITIALIZE_RESPONSE;
  success: boolean;
}

/*
 * GET_QUOTES_REQUEST
 */

export interface GetQuotesRequest extends ActorRequest {
  type: ActorRequestType.GET_QUOTES_REQUEST;
  isin: string;
  range: QuoteRange;
}

export interface QuotesResponse extends ActorResponse {
  type: ActorResponseType.QUOTES_RESPONSE;
  quotes: Quote[];
}

export interface GetCompanyQuotesRequest extends ActorRequest {
  type: ActorRequestType.GET_COMPANY_QUOTES_REQUEST;
  security: SecurityAccountSecurity;
  range: QuoteRange;
  currency?: string;
}

/*
 * GET_QUOTE_REQUEST
 */

export interface GetQuoteRequest extends ActorRequest {
  type: ActorRequestType.GET_QUOTE_REQUEST;
  isin: string;
  time: number;
}

/*
 * SUBSCRIBE_QUOTE_REQUEST
 */

export interface SubscribeQuoteRequest extends ActorRequest {
  type: ActorRequestType.SUBSCRIBE_QUOTE_REQUEST;
  isin: string;
}

export interface QuoteResponse extends ActorResponse {
  type: ActorResponseType.QUOTE_RESPONSE;
  quote: Quote;
}

export interface Quote {
  price: number;
  currency: string;
  time: number;
}

export enum QuoteRange {
  'D' = 0,
  'W' = 1,
  'M' = 2,
  'Y' = 3,
  'ALL' = 4,
}

/*
 * GET_PERFORMANCE_REQUEST
 */

export interface GetPerformanceRequest extends ActorRequest {
  type: ActorRequestType.GET_PERFORMANCE_REQUEST;
}

export interface PerformanceResponse extends ActorResponse {
  type: ActorResponseType.PERFORMANCE_RESPONSE;
  totalAmount: number;
  entries: PerformanceEntry[];
}

export interface GetPerformanceCompanyRequest extends ActorRequest {
  type: ActorRequestType.GET_COMPANY_PERFORMANCE_REQUEST;
  security: SecurityAccountSecurity;
  currency?: string;
}
export interface PerformanceCompanyResponse extends ActorResponse {
  type: ActorResponseType.COMPANY_PERFORMCE_RESPONSE;
  quote?: Quote;
  lastDividend?: SecurityAccountSecurityDividend;
  yearChange?: {
    low?: Quote;
    high?: Quote;
  };
  currentYield?: number;
  nextPayment?: CalendarDayDividend;
  wkn?: string;
  valor?: string;
}

export interface SectorResponse extends ActorResponse {
  type: ActorResponseType.GET_SECTOR_RESPONSE;
  entries: { [key: string]: SectorFeature };
}

export interface GetCompanyFinancialsRequest extends ActorRequest {
  type: ActorRequestType.GET_COMPANY_FINANCIALS_REQUEST;
  security: SecurityAccountSecurity;
  currency?: string;
}

export interface GetCompanySectorRequest extends ActorRequest {
  type: ActorRequestType.GET_COMPANY_SECTOR_REQUEST;
  isins: string[];
}

export interface GetSectorRequest extends ActorRequest {
  type: ActorRequestType.GET_SECTOR_REQUEST;
}
export interface CompanyFinancialsResponse extends ActorResponse {
  type: ActorResponseType.GET_COMPANY_FINANCIALS_RESPONSE;
  data: {
    isin: string;
    currency: string;
    cashflowYoy: number;
    profitYoy: number;
    revenueYoy: number;
    netIncomeYoy: number;
    reports: Array<{
      cashflow: Yield;
      profit: Yield;
      revenue: Yield;
      netIncome: Yield;
      totalAssets: Yield;
      commonStock: number;
      shareholderEquity: number;
      date: string;
    }>;
  };
}

export interface GetQuotesCompanyRequest extends ActorRequest {
  type: ActorRequestType.GET_COMPANY_QUOTES_REQUEST;
  isin: string;
  range: QuoteRange;
}

export interface QuotesCompanyResponse extends ActorResponse {
  type: ActorResponseType.COMPANY_QUOTES_RESPONSE;
  quotes: Quote[];
}

export enum DividendDisplayOption {
  ABSOLUTE = 'ABSOLUTE',
  ABSOLUTESPLITADJUSTED = 'ABSOLUTESPLITADJUSTED',
  YIELDS = 'YIELDS',
}

export interface CompanyDividendHistory extends CompanySecurityAccountSecurityDividend {
  absoluteSplitAdjusted: Yield;
  dividendSplits?: SecurityAccountSecuritySplit;
}

export interface CompanyDividendYield {
  date: string;
  dividendYield?: number;
  quote: Quote;
}

export interface CompanyDividendData {
  dividends?: CompanyDividendHistory[];
  dividendYields?: CompanyDividendYield[];
}

export interface GetDividendCompanyRequest extends ActorRequest {
  type: ActorRequestType.GET_COMPANY_DIVIDEND_HISTORY_REQUEST;
  security: CompanySecurityAccountSecurity;
  option: DividendDisplayOption;
}

export interface DividendCompanyResponse extends ActorResponse {
  type: ActorResponseType.COMPANY_DIVIDEND_HISTORY_RESPONSE;
  companyDividendData: CompanyDividendData;
}

/*
 * GET_PORTFOLIOSTATS_REQUEST
 */

export interface GetPortfolioStatsRequest extends ActorRequest {
  type: ActorRequestType.GET_PORTFOLIO_STATS_REQUEST;
}

export interface PortfolioStatsResponse extends ActorResponse {
  type: ActorResponseType.PORTFOLIO_STATS_RESPONSE;
  // assets: {
  //   amount: number;
  //   unit: string;
  //   yearChange: number;
  // };
  grossDividends: {
    amount: number;
    unit: string;
    yearChange: number;
  };
  nextDividend?: CalendarDayDividend;
}

export interface DividendNewsResponse {
  body: string;
  title: string;
  isin: string;
}

/*
 * GET_TOP_THREE_WORST_THREE_REQUEST
 */

export interface GetTopAndWorstThreeRequest extends ActorRequest {
  type: ActorRequestType.GET_TOP_THREE_WORST_THREE_REQUEST;
}

export interface GetTopAndWorstThreeResponse extends ActorResponse {
  type: ActorResponseType.TOP_THREE_WORST_THREE_RESPONSE;
  topThreeSecuritiesByShare: TopThreeWorstThreeFeatureEntry[];
  worstThreeSecuritiesByShare: TopThreeWorstThreeFeatureEntry[];
  topThreeSecuritiesByQuantity: TopThreeWorstThreeFeatureEntry[];
  worstThreeSecuritiesByQuantity: TopThreeWorstThreeFeatureEntry[];
}

/*
 * GET_PERFORMANCE_REQUESTl
 */

export interface GetCalendarRequest extends ActorRequest {
  type: ActorRequestType.GET_CALENDAR_REQUEST;
  start: string;
  end: string;
}

export interface CalendarResponse extends ActorResponse {
  type: ActorResponseType.CALENDAR_RESPONSE;
  entries: CalendarDay[];
}

export interface GetCalendarDayDividendWithDetailsRequest extends ActorRequest {
  type: ActorRequestType.GET_CALENDAR_DIVIDEND_DETAILS_REQUEST;
  dividend: CalendarDayDividend;
}

export interface GetCalendarDayDividendWithDetailsResponse extends ActorResponse {
  type: ActorResponseType.CALENDAR_DIVIDEND_DETAILS_RESPONSE;
  dividend: CalendarDayDividend;
}

export interface GetCalendarDayDetailsRequest extends ActorRequest {
  type: ActorRequestType.GET_CALENDAR_DAY_DETAILS_REQUEST;
  calendarDay: CalendarDay;
}

export interface GetCalendarDayDetailsResponse extends ActorResponse {
  type: ActorResponseType.GET_CALENDAR_DAY_DETAILS_RESPONSE;
  calendarDay: CalendarDay;
}

export interface ErrorResponse extends ActorResponse {
  type: ActorResponseType.ERROR_RESPONSE;
  message: string;
}

export interface CalendarDay {
  date: string;
  dividends: CalendarDayDividend[];
}

export interface CalendarDayDividend {
  isin: string;
  wkn: string;
  valor?: string;
  type: 'FACT' | 'PREDICTION';
  date: string;
  paymentDate?: string;
  yield: Yield;
  company: {
    name: string;
    description?: string;
    country: string;
  };
  yieldHistory: {
    year: number;
    yield: Yield;
  }[];
  indices: {
    isin: string;
    name: string;
  }[];
  statistics: {
    yearsWithContinuousYieldIncrease: number;
    yearsWithoutYieldReduction: number;
  };
  quote?: Yield;
  dividendYield?: number;
}

export interface PerformanceEntry extends CompanyOverview {
  quote: number;
  quantity: number;
  amount: number;
  performance: number;
  dividendYield?: number;
  dayChange?: number;
  currency: string;
  lastDividend?: SecurityAccountSecurityDividend;
  yearChange: {
    low?: Quote;
    high?: Quote;
  };
}

export interface CompanyOverview {
  isin: string;
  name: string;
}

/**
 * GET_CURRENCY_QUOTE_REQUEST
 */

export interface GetCurrencyQuoteRequest extends ActorRequest {
  type: ActorRequestType.GET_CURRENCY_QUOTE_REQUEST;
  from: string;
  to: string;
  date: string;
}

export interface GetCurrencyQuoteResponse extends ActorResponse {
  type: ActorResponseType.CURRENCY_QUOTE_RESPONSE;
  quote: number;
}

export interface SecurityAccount {
  id: string;
  description?: string;
  profile: SecurityAccountProfile;
  securities: SecurityAccountSecurities;
  documents: { [id: string]: SecurityAccountDocument };
}

export interface SecurityAccountProfile {
  address?: SecurityAccountAddress;
}

export interface SecurityAccountAddress {
  street: string;
  houseNumber: string;
  zip: string;
  city: string;
  country: string;
}

export interface SecurityAccountDocument {
  name: string;
  date: string;
  type: SecurityAccountDocumentType;
  format: string;
  url: string;
}

export type SecurityAccountDocuments = { [id: string]: SecurityAccountDocument };

export enum SecurityAccountDocumentType {
  ACCOUNT_STATEMENT = 'ACCOUNT_STATEMENT',
  SECURITY_DIVIDEND = 'SECURITY_DIVIDEND',
  SECURITY_TRANSACTION = 'SECURITY_TRANSACTION',
  NOT_USED = 'NOT_USED',
}

export type SecurityAccountSecurities = { [isin: string]: SecurityAccountSecurity };

export interface SecurityAccountSecurity {
  name: string;
  country: string;
  isin: string;
  wkn?: string;
  quantity?: number;
  price?: Yield;
  dividends: SecurityAccountSecurityDividend[];
  splits: SecurityAccountSecuritySplit[];
  transactions: SecurityAccountSecurityTransaction[];
}

export interface CompanySecurityAccountSecurity extends SecurityAccountSecurity {
  dividends: CompanySecurityAccountSecurityDividend[];
}
export interface SecurityAccountSecurityDividend {
  date: string;
  quantity?: number;
  frequency?: FetchedDividendYieldFrequency;
  tax?: SecurityAccountSecurityDividendTax;
  franked?: number;
  yield: {
    amount: number;
    unit: string;
  };
  documents?: string[];
}

export interface CompanySecurityAccountSecurityDividend extends SecurityAccountSecurityDividend {
  originalYield: {
    amount: number;
    unit: string;
  };
}

export enum FetchedDividendYieldFrequency {
  ANNUAL = 'ANNUAL',
  SEMI_ANNUAL = 'SEMI_ANNUAL',
  TRIMESTERLY = 'TRIMESTERLY',
  QUARTERLY = 'QUARTERLY',
  MONTHLY = 'MONTHLY',
  BI_MONTHLY = 'BI_MONTHLY',
  WEEKLY = 'WEEKLY',
  IRREGULAR = 'IRREGULAR',
  UNSPECIFIED = 'UNSPECIFIED',
}

export enum SecurityAccountSecurityDividendTax {
  TAXED = 'TAXED',
  UNTAXED = 'UNTAXED',
  REDEMPTION = 'REDEMPTION',
}

export interface SecurityAccountSecuritySplit {
  date: string;
  from: number;
  to: number;
}

export interface SecurityAccountSecurityTransaction {
  date: string;
  type: TransactionType;
  quantity?: number;
  price?: Yield;
}

export interface TopThreeWorstThreeFeatureEntry {
  isin: string;
  name: string;
  country: string;
  yearChange: number;
  quantity: number;
  absoluteChange: number;
  quotes: Quote[];
}

export enum TransactionType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  DIVIDEND = 'DIVIDEND',
}

export interface FirstStageFeature<T> {
  type: FeatureType;
  provider: number;
  state: FeatureState;
  date: string;
  id: string;
  value: T;
}

export enum FeatureState {
  APPROVED = 0,
  UNCONFIRMED = 1,
  REJECTED = 2,
}

export enum FeatureType {
  NAME = 0,
  SYMBOL = 1,
  STOCK_PROFILE = 2,
  DIVIDEND = 3,
  ISSUED_SHARES = 4,
  ANALYST_RATING = 5,
  NATIONAL_SELECTOR = 6,
  TYPE = 7,
  ETF_PROFILE = 8,
  STOCK_LOGO = 9,
  INDUSTRY = 10,
  INDEX_CONSTITUENTS = 11,
  BALANCE_SHEET = 12,
  ISIN_CHANGE = 13,
  BOND_PROFILE = 14,
}

export interface BondProfile {
  primaryType: PrimaryBondProfileType;
  secondaryType: SecondaryBondProfileType;
  country: string;
  interest: number;
  endDate: string;
  duration: number;
  yield: number;
}

enum PrimaryBondProfileType {
  GOVERNMENT_BONDS,
  CORPORATE_BONDS,
  COVERED_BONDS,
  FIXED_COUPON_BONDS,
  FLOATER_BONDS,
  ZERO_BONDS,
  SUBORDINATED_BONDS,
  CONVERTIBLE_BONDS,
  OPTION_BONDS,
  JUNK_BONDS,
  CURRENCY_BONDS,
  CANTONAL_REGIONAL_BONDS,
  CITY_MUNICIPAL_BONDS,
}

enum SecondaryBondProfileType {
  BANKS,
  BUILDING_MATERIALS,
  CHEMICALS,
  ENERGY,
  FINANCIAL_SERVICES,
  HEALTH,
  REAL_ESTATE,
  FOOD,
  PHARMA,
  INSURANCE,
}

export enum SortBy {
  ABSOLUTE_CHANGE = 'ABSOLUTE_CHANGE',
  RELATIVE_CHANGE = 'RELATIVE_CHANGE',
}

export enum DisplayValue {
  WKN = 'WKN',
  VALOR = 'VALOR',
}

export type TopThreeWorstThreeSettings = {
  sortBy: TopThreeWorstThreeSortBy;
};

export type TopThreeWorstThreeSortBy = SortBy.RELATIVE_CHANGE | SortBy.ABSOLUTE_CHANGE;

export enum ShownDividends {
  ALL = 'ALL',
  MY_DIVIDENDS = 'MY_DIVIDENDS',
}

export type CalendarSettings = {
  shownDividends: ShownDividends;
};

export type IsinWknSettings = {
  displayValue: DisplayValue;
};

export type DividendHistorySettings = {
  displayOption: DividendDisplayOption;
};

export interface ActorSettings {
  topThreeWidget: TopThreeWorstThreeSettings;
  worstThreeWidget: TopThreeWorstThreeSettings;
  calendarWidget: CalendarSettings;
  isinWknWidget: IsinWknSettings;
  companyDividendHistoryWidget: DividendHistorySettings;
}

export interface SecondStageFeature<T> {
  type: FeatureType;
  provider: number;
  date: string;
  id: string;
  value: T;
}

export interface ThirdStageFeature<T> {
  type: number;
  date: string;
  id: string;
  value: T;
}

export interface NationalSelector {
  wkn?: string;
  valor?: string;
}

export interface CompanyFinancials {
  isin: string;
  reportDate: string;
  currency: string;
  totalRevenue: number;
  grossProfit: number;
  netIncome: number;
  cashFlow: number;
  commonStock: number;
  shareholderEquity: number;
  totalAssets: number;
}

export interface SectorFeatureEntry {
  isin: string;
  country: string;
  sector: string | undefined;
  share: number;
}

export type SectorFeature = SectorFeatureEntry[];

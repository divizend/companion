/*
SecDB
 */

export interface CalendarComparisonDividend {
  isin: string;
  date: string;
}

export interface CalendarDividendDay {
  date: string;
  dividends: FetchedDividend[];
}

export interface FetchedDividend extends FetchedDividendFirstStage, FetchedDividendSecondStage {}

export interface FetchedDividendFirstStage {
  isin: string;
  type: FetchedDividendType;
  date: string;
  paymentDate?: string;
  yield: FetchedDividendYield;
}

type QuantityCalculationKind = 'transaction' | 'split';

interface QuantityCalculationInformation {
  kind: QuantityCalculationKind;
  parsedDate: Date;
}

type QuantityCalculationEntry = (SecurityAccountSecurityTransaction | SecurityAccountSecuritySplit) &
  QuantityCalculationInformation;

function fround(value: number, decimals = 6) {
  return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
}

/**
 *
 * @param transactions Transaktionen, müssen nicht sortiert sein.
 * @param splits Splits, müssen nicht sortiert sein.
 * @param quantity Stückzahl
 * @param quantityDate Datum der Stückzahl
 * @param requestedDate Datum, an dem die Stückzahl berechnet werden soll.
 *
 * Es wird davon ausgegangen, dass Splits um 00:00:00.000 stattfinden, während Transaktionen WÄHREND des Tages stattfinden, d. h. nach allen Splits mit demselben Datum.
 * Es wird effektiv berechnet, wie viele Wertpapiere am Tag VOR dem Datum gehalten wurden, d.h. es wird die Stückzahl um 23:59:59.999 des vorherigen Tags berechnet.
 * Es wird ausgegangen, dass quantityDate die Stückzahl am Ende des Tages angibt, also anschließend keine Transaktionen mehr stattfanden.
 */
export function getSecurityQuantity(
  transactions: SecurityAccountSecurityTransaction[],
  splits: SecurityAccountSecuritySplit[],
  quantity: number | undefined,
  quantityDate: Date,
  requestedDate: Date,
): number | undefined {
  // Wir erstellen ein neues Array, welches alle Transaktionen und Splits beinhaltet.
  const entries: QuantityCalculationEntry[] = [
    ...transactions
      .map(transaction => {
        return {
          ...transaction,
          kind: 'transaction' as QuantityCalculationKind,
          parsedDate: new Date(transaction.date),
        };
      })
      .reverse(),
    ...splits.map(split => {
      return {
        ...split,
        kind: 'split' as QuantityCalculationKind,
        parsedDate: new Date(split.date),
      };
    }),
  ];

  // Falls das angefragte Datum vor oder am Datum der übergebenen Stückzahl liegt, rechnen wir rückwärts.
  // Dafür benötigen wir nur die Einträge, die nach oder am angefragten Datum und vor oder am Datum der übergebenen Stückzahl liegen, absteigend sortiert.
  if (requestedDate.getTime() <= quantityDate.getTime()) {
    const filteredEntries = entries
      .filter(entry => entry.parsedDate >= requestedDate && entry.parsedDate <= quantityDate)
      .sort((a, b) => {
        if (a.parsedDate.getTime() === b.parsedDate.getTime()) {
          if (a.kind === 'split' && b.kind === 'transaction') {
            return 1;
          } else if (a.kind === 'transaction' && b.kind === 'split') {
            return -1;
          } else {
            return 0;
          }
        }

        return b.parsedDate.getTime() - a.parsedDate.getTime();
      });

    let currentQuantity = quantity;

    for (const entry of filteredEntries) {
      switch (entry.kind) {
        case 'transaction': {
          const transaction = entry as SecurityAccountSecurityTransaction & QuantityCalculationInformation;
          switch (transaction.type) {
            case TransactionType.PURCHASE: {
              // Wenn currentQuantity undefined ist, überspringen wir den Kauf, wir warten auf eine Dividende mit Stückzahl.
              if (currentQuantity === undefined) {
                continue;
              }
              // Der Verlauf der Stückzahl ist nicht eindeutig ermittelbar, wir setzen currentQuantity auf undefined, wir warten auf eine Dividende mit Stückzahl.
              if (transaction.quantity === undefined) {
                currentQuantity = undefined;
                continue;
              }

              currentQuantity = currentQuantity - transaction.quantity; // Da wir rückwärts iterieren, müssen wir die Anzahl abziehen und nicht addieren.
              currentQuantity = fround(currentQuantity);
              if (currentQuantity < 0) {
                // Irgendetwas ist bei der Berechnung fehlgeschlagen, wir warten auf eine Dividende mit Stückzahl.
                currentQuantity = undefined;
                continue;
              }
              continue;
            }
            case TransactionType.SALE: {
              // Wenn currentQuantity undefined ist, überspringen wir den Verkauf, wir warten auf eine Dividende mit Stückzahl.
              if (currentQuantity === undefined) {
                continue;
              }
              // Der Verlauf der Stückzahl ist nicht eindeutig ermittelbar, wir setzen currentQuantity auf undefined, wir warten auf eine Dividende mit Stückzahl.
              if (transaction.quantity === undefined) {
                currentQuantity = undefined;
                continue;
              }

              currentQuantity = currentQuantity + transaction.quantity; // Da wir rückwärts iterieren, müssen wir die Anzahl addieren und nicht abziehen.
              currentQuantity = fround(currentQuantity);
              continue;
            }
            case TransactionType.DIVIDEND: {
              if (transaction.quantity === undefined) {
                continue;
              }

              currentQuantity = transaction.quantity;
              continue;
            }
          }
        }
        case 'split': {
          // Wenn currentQuantity undefined ist, überspringen wir die Berechnung, wir können den Split sowieso nicht anwenden.
          if (currentQuantity === undefined) {
            continue;
          }

          const split = entry as SecurityAccountSecuritySplit & QuantityCalculationInformation;
          currentQuantity = fround((currentQuantity / split.to) * split.from);
        }
      }
    }

    return currentQuantity;
  }

  // Falls das angefragte Datum nach dem dem Datum der übergebenen Stückzahl liegt, rechnen wir vorwärts.
  // Dafür benötigen wir nur die Einträge, die vor dem angefragten Datum und nach dem Datum der übergebenen Stückzahl liegen, aufsteigend sortiert.
  if (requestedDate.getTime() > quantityDate.getTime()) {
    const filteredEntries = entries
      .filter(entry => entry.parsedDate < requestedDate && entry.parsedDate > quantityDate)
      .sort((a, b) => {
        if (a.parsedDate.getTime() === b.parsedDate.getTime()) {
          if (a.kind === 'split' && b.kind === 'transaction') {
            return -1;
          } else if (a.kind === 'transaction' && b.kind === 'split') {
            return 1;
          } else {
            return 0;
          }
        }

        return a.parsedDate.getTime() - b.parsedDate.getTime();
      });

    let currentQuantity = quantity;

    for (const entry of filteredEntries) {
      switch (entry.kind) {
        case 'transaction': {
          const transaction = entry as SecurityAccountSecurityTransaction & QuantityCalculationInformation;
          switch (transaction.type) {
            case TransactionType.PURCHASE: {
              // Wenn currentQuantity undefined ist, überspringen wir den Kauf, wir warten auf eine Dividende mit Stückzahl.
              if (currentQuantity === undefined) {
                continue;
              }
              // Der Verlauf der Stückzahl ist nicht eindeutig ermittelbar, wir setzen currentQuantity auf undefined, wir warten auf eine Dividende mit Stückzahl.
              if (transaction.quantity === undefined) {
                currentQuantity = undefined;
                continue;
              }

              currentQuantity = currentQuantity + transaction.quantity; // Da wir rückwärts iterieren, müssen wir die Anzahl abziehen und nicht addieren.
              continue;
            }
            case TransactionType.SALE: {
              // Wenn currentQuantity undefined ist, überspringen wir den Verkauf, wir warten auf eine Dividende mit Stückzahl.
              if (currentQuantity === undefined) {
                continue;
              }
              // Der Verlauf der Stückzahl ist nicht eindeutig ermittelbar, wir setzen currentQuantity auf undefined, wir warten auf eine Dividende mit Stückzahl.
              if (transaction.quantity === undefined) {
                currentQuantity = undefined;
                continue;
              }

              currentQuantity = currentQuantity - transaction.quantity; // Da wir rückwärts iterieren, müssen wir die Anzahl addieren und nicht abziehen.
              if (currentQuantity < 0) {
                // Irgendetwas ist bei der Berechnung fehlgeschlagen, wir warten auf eine Dividende mit Stückzahl.
                currentQuantity = undefined;
                continue;
              }
              continue;
            }
            case TransactionType.DIVIDEND: {
              if (transaction.quantity === undefined) {
                continue;
              }

              currentQuantity = transaction.quantity;
              continue;
            }
          }
        }
        case 'split': {
          // Wenn currentQuantity undefined ist, überspringen wir die Berechnung, wir können den Split sowieso nicht anwenden.
          if (currentQuantity === undefined) {
            continue;
          }

          const split = entry as SecurityAccountSecuritySplit & QuantityCalculationInformation;
          currentQuantity = Math.floor((currentQuantity / split.from) * split.to);
        }
      }
    }

    return currentQuantity;
  }
}

export function splitBankId(bankId: string): SessionBankId {
  const chunks = bankId.split('-');
  if (chunks.length !== 3) {
    throw new Error('Bank id ' + bankId + ' is not in the correct format.');
  }

  return {
    type: Number(chunks[0]),
    parent: chunks[1],
    child: chunks[2],
  };
}

export function getDividendFrequency(frequency: FetchedDividendYieldFrequency) {
  switch (frequency) {
    case FetchedDividendYieldFrequency.WEEKLY:
      return 52;
    case FetchedDividendYieldFrequency.MONTHLY:
      return 12;
    case FetchedDividendYieldFrequency.BI_MONTHLY:
      return 24;
    case FetchedDividendYieldFrequency.QUARTERLY:
      return 4;
    case FetchedDividendYieldFrequency.SEMI_ANNUAL:
      return 2;
    case FetchedDividendYieldFrequency.ANNUAL:
      return 1;
    default:
      throw new Error('Frequenz ' + frequency + ' is not supported.');
  }
}

export function getDividendFrequencyEnum(frequency: number) {
  switch (frequency) {
    case 52:
      return FetchedDividendYieldFrequency.WEEKLY;
    case 12:
      return FetchedDividendYieldFrequency.MONTHLY;
    case 24:
      return FetchedDividendYieldFrequency.BI_MONTHLY;
    case 4:
      return FetchedDividendYieldFrequency.QUARTERLY;
    case 2:
      return FetchedDividendYieldFrequency.SEMI_ANNUAL;
    case 1:
      return FetchedDividendYieldFrequency.ANNUAL;
    default:
      throw new Error('Frequency ' + frequency + ' is not supported.');
  }
}

export function getDividendFrequencyString(frequency: string): FetchedDividendYieldFrequency {
  switch (frequency.toLowerCase()) {
    case 'weekly':
      return FetchedDividendYieldFrequency.WEEKLY;
    case 'monthly':
      return FetchedDividendYieldFrequency.MONTHLY;
    case 'bimonthly':
      return FetchedDividendYieldFrequency.BI_MONTHLY;
    case 'quarterly':
      return FetchedDividendYieldFrequency.QUARTERLY;
    case 'trimesterly':
      return FetchedDividendYieldFrequency.TRIMESTERLY;
    case 'semi-annual':
    case 'interim':
      return FetchedDividendYieldFrequency.SEMI_ANNUAL;
    case 'annual':
      return FetchedDividendYieldFrequency.ANNUAL;
    case 'irregular':
      return FetchedDividendYieldFrequency.IRREGULAR;
    default:
      // throw new Error('Frequenz ' + frequency + ' is not supported.');
      return FetchedDividendYieldFrequency.IRREGULAR;
  }
}

export function getDividendInterval(frequency: FetchedDividendYieldFrequency) {
  switch (frequency) {
    case FetchedDividendYieldFrequency.WEEKLY:
      return 7;
    case FetchedDividendYieldFrequency.MONTHLY:
      return 31;
    case FetchedDividendYieldFrequency.BI_MONTHLY:
      return 15;
    case FetchedDividendYieldFrequency.QUARTERLY:
      return 92;
    case FetchedDividendYieldFrequency.SEMI_ANNUAL:
      return 183;
    case FetchedDividendYieldFrequency.ANNUAL:
      return 366;
    default:
      throw new Error('Frequenz ' + frequency + ' is not supported.');
  }
}

export interface FetchedDividendSecondStage {
  wkn?: string;
  valor?: string;
  yieldHistory: FetchedDividendYieldYear[];
  company: {
    name: string;
    description?: string;
    country: string;
    industry?: string;
    sector?: string;
    employees?: number;
    sharesOutstanding?: number;
    marketCap?: number;
    urls?: {
      landingPage?: string;
    };
  };
  indices?: FetchedDividendIndex[];
  quotes?: FetchedDividendQuote[];
  statistics: FetchedDividendStatistics;
}

export interface OverviewCalendarDividendDay {
  date: string;
  dividends: OverviewCalendarDividend[];
}

export interface OverviewCalendarDividend {
  isin: string;
  type: FetchedDividendType;
  date: string;
  yield: FetchedDividendYield;
  company: {
    name: string;
    description?: string;
  };
}

export interface FetchedDividendFilter {
  key: string;
  type: FetchedDividendFilterType;
  operator: FetchedDividendFilterOperator;
  value: any;
}

export interface FetchedDividendIndex {
  isin: string;
  name: string;
}

export interface FetchedDividendQuote {
  year: string;
  quote: number;
}

export enum FetchedDividendType {
  FACT = 'FACT',
  PREDICTION = 'PREDICTION',
  ND = 'ND',
  PREDICTION_FACTSET = 'PREDICTION_FACTSET',
  BO = 'BO',
}

export function getFetchedDividendTypePriority(dividendType: FetchedDividendType): number {
  switch (dividendType) {
    case FetchedDividendType.FACT:
      return 100;
    case FetchedDividendType.BO:
      return 55;
    case FetchedDividendType.ND:
      return 50;
    case FetchedDividendType.PREDICTION_FACTSET:
      return 35;
    case FetchedDividendType.PREDICTION:
      return 30;
  }
}

export enum FetchedDividendFilterType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
}

export enum FetchedDividendFilterOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',

  BETWEEN = 'BETWEEN',
  NOT_BETWEEN = 'NOT_BETWEEN',
  AT_LEAST = 'AT_LEAST',
  AT_MOST = 'AT_MOST',
  MORE_THAN = 'MORE_THAN',
  LESS_THAN = 'LESS_THAN',

  IN_NEXT = 'IN_NEXT',
  IN_LAST = 'IN_LAST',
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

export interface FetchedDividendYield {
  amount: number;
  unit: string;
  frequency?: string; // TODO: FetchedDividendYieldFrequency
}

export interface FetchedDividendYieldYear {
  year: string;
  yield: FetchedDividendYield;
}

export interface FetchedDividendStatistics {
  yearsWithContinuousYieldIncrease?: number;
  yearsWithoutYieldReduction?: number;
  returnOfInvestment?: number;
}

export interface FetchedQuote {
  open?: number;
  close: number;
  low?: number;
  high?: number;
  fixing?: number;
}

export interface FetchedSecurity {
  isin: string;
  name: string;
}

export interface FetchedScreenerSecurity {
  isin: string;
  wkn?: string;
  name: string;
  normalizedName: string;
  date: string | undefined;
}

export interface FetchedSatellite {
  date: string;
  company: {
    name: string;
    logo: string;
  };
  yield: FetchedDividendYield;
  yieldHistory: FetchedDividendYieldYear[];
  statistics: FetchedDividendStatistics;
}

/*
  Session
   */
export enum SessionState {
  WAITING_FOR_AUTHENTICATION = 'WAITING_FOR_AUTHENTICATION',
  WAITING_FOR_AUTHENTICATION_APPROVAL = 'WAITING_FOR_AUTHENTICATION_APPROVAL',
  WAITING_FOR_EXTERNAL_APPROVAL = 'WAITING_FOR_EXTERNAL_APPROVAL',
  WAITING_FOR_QR_SCAN = 'WAITING_FOR_QR_SCAN',
  WAITING_FOR_AGGREGATION = 'WAITING_FOR_AGGREGATION',
  AGGREGATION_FINALIZED = 'AGGREGATION_FINALIZED',
  AGGREGATION_FAILED = 'AGGREGATION_FAILED',
}

export interface SessionBankId {
  type: BankType;
  parent: string;
  child: string;
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

export type SecurityAccountDocument = {
  name: string;
  date: string;
  format: string;
  url: string;
} & (
  | {
      type: SecurityAccountDocumentType.ACCOUNT_STATEMENT | SecurityAccountDocumentType.TAX_VOUCHER;
      from?: string;
      to?: string;
    }
  | {
      type:
        | SecurityAccountDocumentType.SECURITY_DIVIDEND
        | SecurityAccountDocumentType.SECURITY_TRANSACTION
        | SecurityAccountDocumentType.NOT_USED;
    }
);

export type SecurityAccountDocuments = { [id: string]: SecurityAccountDocument };

export enum SecurityAccountDocumentType {
  ACCOUNT_STATEMENT = 'ACCOUNT_STATEMENT',
  SECURITY_DIVIDEND = 'SECURITY_DIVIDEND',
  SECURITY_TRANSACTION = 'SECURITY_TRANSACTION',
  TAX_VOUCHER = 'TAX_VOUCHER',
  NOT_USED = 'NOT_USED',
}

export type SecurityAccountSecurities = { [isin: string]: SecurityAccountSecurity };
export interface ISINChange {
  date: string;
  changedISIN: string;
  isNewerISIN: boolean;
}
export interface SecurityAccountSecurity {
  name: string;
  country: string;
  isin: string;
  wkn?: string;
  quantity?: number;
  price?: {
    amount: number;
    unit: string;
  };
  type: SecurityAccountSecurityType;
  dividends: SecurityAccountSecurityDividend[];
  splits: SecurityAccountSecuritySplit[];
  transactions: SecurityAccountSecurityTransaction[];
  isinChange?: SecurityAccountSecurityISINChange;
}

export interface SecurityAccountSecurityISINChange {
  oldISIN?: string;
  oldISINDate?: string;
  oldFactor?: number;
  newISIN?: string;
  newISINDate?: string;
  newFactor?: number;
}

export enum SecurityAccountSecurityType {
  STOCK = 'STOCK',
  ETF = 'ETF',
  FUND = 'FUND',
  DR = 'DR',
  BOND = 'BOND',
  OPTION = 'OPTION',
  CRYPTO = 'CRYPTO',
  TRUST = 'TRUST',
  CERTIFICATE = 'CERTIFICATE',
  OTHER = 'OTHER',
}

export interface SecurityAccountSecurityDividend {
  date: string;
  paymentDate?: string;
  quantity?: number;
  frequency?: FetchedDividendYieldFrequency;
  tax?: SecurityAccountSecurityDividendTax;
  franked?: number;
  originalYield?: {
    amount: number;
    unit: string;
  };
  conversionRate?: number;
  yield: {
    amount: number;
    unit: string;
  };
  documents?: string[];
  dividendDocumentId?: string;
  taxVoucherDocumentId?: string;
  accountStatementDocumentId?: string;
  whtRate?: number;
  refundRate?: number;
  defaultWhtRate?: number;
  defaultRefundRate?: number;
}

export enum SecurityAccountSecurityDividendTax {
  TAXED = 'TAXED',
  UNTAXED = 'UNTAXED',
  REDEMPTION = 'REDEMPTION',
}

export function getDividendTax(tax: string): SecurityAccountSecurityDividendTax {
  switch (tax) {
    case 'taxed':
      return SecurityAccountSecurityDividendTax.TAXED;
    case 'untaxed':
      return SecurityAccountSecurityDividendTax.UNTAXED;
    case 'redemption':
      return SecurityAccountSecurityDividendTax.REDEMPTION;
    default:
      throw new Error('Tax ' + tax + ' is not supported.');
  }
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
  price?: {
    amount: number;
    unit: string;
    fees?: number;
  };
}

export enum TransactionType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  DIVIDEND = 'DIVIDEND',
}

export type ProgressMessageType = {
  loadingMessage: string;
  completedMessage: string;
};

export interface ConnectionDetails {
  bank: {
    id: string;
    name: string;
    description?: string;
  };
  state: SessionState;
  progress: number;
  flags: ConnectionFlags;
  properties: BankProperty[];
  progressMessage?: ProgressMessageType;
}

export type ConnectionProperties = { [key: string]: any };

export interface ConnectionStateResponse {
  state: SessionState;
  progress: number;
  flags: ConnectionFlags;
  progressMessage?: ProgressMessageType;
}

export interface DividendResponse {
  dividends: SecurityAccountSecurityDividend[];
  splits: SecurityAccountSecuritySplit[];
  type: SecurityAccountSecurityType;
  country: string;
  name?: string;
  isinChange?: SecurityAccountSecurityISINChange;
}

export interface DividendsResponse {
  [isin: string]: DividendResponse;
}

export enum ConnectionFlag {
  'AUTHENTICATION_FAILED' = 'AUTHENTICATION_FAILED',
  'AUTHENTICATION_TIMEOUT' = 'AUTHENTICATION_TIMEOUT',
  'SECURITY_AGGREGATION_FAILED' = 'SECURITY_AGGREGATION_FAILED',
  'DIVIDEND_AGGREGATION_FAILED' = 'DIVIDEND_AGGREGATION_FAILED',
  'ALLOW_BACKGROUND' = 'ALLOW_BACKGROUND',
}

export interface ConnectionFlags {
  [ConnectionFlag.ALLOW_BACKGROUND]?: boolean;
  [ConnectionFlag.AUTHENTICATION_FAILED]?: string[]; // Alle Nachrichten, die die Bank zurückgegeben hat.
  [ConnectionFlag.SECURITY_AGGREGATION_FAILED]?: ConnectionFlagAggregationFailedEntry[]; // Alle Wertpapiere, bei denen das Unternehmen nicht erkannt wurde.
  [ConnectionFlag.DIVIDEND_AGGREGATION_FAILED]?: ConnectionFlagAggregationFailedEntry[]; // Alle Wertpapiere, bei denen keine Dividenden verfügbar sind.
  // DIVIDEND_QUANTITY_ESTIMATED
  [ConnectionFlag.AUTHENTICATION_TIMEOUT]?: string[];
}

export interface ConnectionFlagAggregationFailedEntry {
  name: string;
  isin?: string;
  wkn?: string;
  valor?: string;
}

export enum ConnectionAuthenticationMethod {
  EXTERNAL = 'EXTERNAL',
  MOBILE_TAN = 'MOBILE_TAN',
  PHOTO_TAN = 'PHOTO_TAN',
  PUSH_TAN = 'PUSH_TAN',
}

export interface Bank {
  id: string;
  name: string;
  type: BankType;
  parent: BankParent;
  description?: string;
  bic: string;
  blz?: string;
  multiAccount?: boolean;
}

export interface MetaBank {
  id: string;
  name: string;
  parent: BankParent;
  bic: string;
  blz?: string;
  interfaces: MetaBankInterface[];
  multiAccount?: boolean;
}

export interface MetaBankInterface {
  id: string;
  type: BankType;
  description?: string;
  disabled?: boolean;
}

export type BankOrder = { [parent in BankParent]: BankType[] };

export enum BankType {
  DEMO = 0,
  NATIVE = 1,
  FINAPI = 2,
  DOCAPI = 3,
  FINTS = 4,
  POCAPI = 5,
  SCRAPER = 6,
  ESTA = 8,
  FLANKS = 9,
  SFTP = 10,
}

/**
 * Represents a bank property.
 */
export interface BankProperty {
  /**
   * The key of the property.
   */
  key: string;
  /**
   * The name of the property.
   */
  name: string;
  /**
   * The type of the property.
   */
  type: BankPropertyType;
  /**
   * The placeholder text for the property.
   */
  placeholder?: string;
  /**
   * The description of the property.
   */
  description?: string;
  /**
   * The data associated with the property.
   */
  data?: string;
  dataDescription?: string;
  /**
   * The options available for the property.
   */
  options?: BankPropertyOption[];
  /**
   * Determines whether multiple options can be selected.
   */
  multiSelect?: boolean;

  /**
   * Determines whether the property should be considered as a credential.
   * Credentials are personal information that should never be shared or stored.
   * @example "credentials include usernames and passwords."
   * @example "non-credentials include 2FA Pins and TANs."
   */
  credentials: boolean;

  /**
   * Width of the property input field. This can be defined as a percentage (e.g., '50%') or other CSS width values.
   */
  width?: string;

  /**
   * The default value for the property input field.
   */
  defaultValue?: string;

  /**
   * allowed extensions for file upload
   */
  allowedExtensions?: string[];
}

export interface BankPropertyOption {
  key: string;
  name: string;
}

export enum BankPropertyType {
  TEXT = 'TEXT',
  PHONE_NUMBER = 'PHONE_NUMBER',
  PASSWORD = 'PASSWORD',
  FILE = 'FILE',
  QR_CODE = 'QR_CODE',
  FILE_MULTIPLE = 'FILE_MULTIPLE',
  EXTRA_BUTTON = 'EXTRA_BUTTON',
  SELECT = 'SELECT',
}

export enum BankFlag {
  NO_POLLING = 'NO_POLLING',
}

export enum BankParent {
  DE_SPARKASSE = 'DE_SPARKASSE',
  DE_ING = 'DE_ING',
  DE_CONSORSBANK = 'DE_CONSORSBANK',
  DE_COMMERZBANK = 'DE_COMMERZBANK',
  DE_VOLKSBANK_RAIFFEISENBANK = 'DE_VOLKSBANK_RAIFFEISENBANK',
  DE_DEUTSCHE_BANK = 'DE_DEUTSCHE_BANK',
  DE_COMDIRECT = 'DE_COMDIRECT',
  DE_TRADE_REPUBLIC = 'DE_TRADE_REPUBLIC',
  DE_POSTBANK = 'DE_POSTBANK',
  DE_SCALABLE_CAPITAL = 'DE_SCALABLE_CAPITAL',
  DE_1822DIREKT = 'DE_1822DIREKT',
  DE_SMARTBROKER = 'DE_SMARTBROKER',
  DE_SMARTBROKER_PLUS = 'DE_SMARTBROKER_PLUS',
  DE_DKB = 'DE_DKB',
  DE_ONVISTA = 'DE_ONVISTA',
  DE_SBROKER = 'DE_SBROKER',
  DE_FLATEX = 'DE_FLATEX',
  DE_TARGOBANK = 'DE_TARGOBANK',
  DE_HYPOVEREINSBANK = 'DE_HYPOVEREINSBANK',
  DE_INTERACTIVE_BROKERS = 'DE_INTERACTIVE_BROKERS',
  DE_DAB_BANK = 'DE_DAB_BANK',
  DE_FINANZEN_NET_ZERO = 'DE_FINANZEN_NET_ZERO',
  DE_DEGUSSA_BANK = 'DE_DEGUSSA_BANK',
  DE_GENO_BROKER = 'DE_GENO_BROKER',
  DE_DEGIRO = 'DE_DEGIRO',
  DE_BUX = 'DE_BUX',
  DE_UBS = 'DE_UBS',
  DE_VBANK = 'DE_VBANK',
  DE_UNKNOWN = 'DE_UNKNOWN',

  AT_ERSTE_BANK = 'AT_ERSTE_BANK',
  AT_EASYBANK = 'AT_EASYBANK',
  AT_VOLKSBANK = 'AT_VOLKSBANK',
  AT_RAIFFEISENBANK = 'AT_RAIFFEISENBANK',
  AT_SPARKASSE = 'AT_SPARKASSE',
  AT_TRADE_REPUBLIC = 'AT_TRADE_REPUBLIC',
  AT_INTERACTIVE_BROKERS = 'AT_INTERACTIVE_BROKERS',
  AT_FLATEX = 'AT_FLATEX',
  AT_DADAT = 'AT_DADAT',
  AT_SCALABLE_CAPITAL = 'AT_SCALABLE_CAPITAL',
  AT_UNKNOWN = 'AT_UNKNOWN',

  CH_VONTOBEL = 'CH_VONTOBEL',
  CH_BLKB = 'CH_BLKB',
  CH_BSKB = 'CH_BSKB',
  CH_BEKB = 'CH_BEKB',
  CH_CREDIT_SUISSE = 'CH_CREDIT_SUISSE',
  CH_GLKB = 'CH_GLKB',
  CH_JP_MORGAN = 'CH_JP_MORGAN',
  CH_JULIUS_BAER = 'CH_JULIUS_BAER',
  CH_SAXOBANK = 'CH_SAXOBANK',
  CH_SGKB = 'CH_SGKB',
  CH_SWISSQUOTE = 'CH_SWISSQUOTE',
  CH_POSTFINANCE = 'CH_POSTFINANCE',
  CH_UBS = 'CH_UBS',
  CH_VP_BANK = 'CH_VP_BANK',
  CH_ZGKB = 'CH_ZGKB',
  CH_ZKB = 'CH_ZKB',
  CH_INTERACTIVE_BROKERS = 'CH_INTERACTIVE_BROKERS',
  CH_UNKNOWN = 'CH_UNKNOWN',

  LU_TRADE_REPUBLIC = 'LU_TRADE_REPUBLIC',
  LU_INTERACTIVE_BROKERS = 'LU_INTERACTIVE_BROKERS',
  LU_SWISSQUOTE = 'LU_SWISSQUOTE',
  LU_UNKNOWN = 'LU_UNKNOWN',

  ES_ABANCA = 'ES_ABANCA',
  ES_ACTIVOBANK = 'ES_ACTIVOBANK',
  ES_ANDBANK = 'ES_ANDBANK',
  ES_ARQUIA = 'ES_ARQUIA',
  ES_BANCA_MARCH = 'ES_BANCA_MARCH',
  ES_BANCO_ALCALA = 'ES_BANCO_ALCALA',
  ES_BANCO_CAMINOS = 'ES_BANCO_CAMINOS',
  ES_BANKINTER = 'ES_BANKINTER',
  ES_BBVA = 'ES_BBVA',
  ES_BNP_PARIBAS = 'ES_BNP_PARIBAS',
  ES_CAIXABANK = 'ES_CAIXABANK',
  ES_DEUTSCHE_BANK = 'ES_DEUTSCHE_BANK',
  ES_ING = 'ES_ING',
  ES_JP_MORGAN = 'ES_JP_MORGAN',
  ES_KUTXABANK = 'ES_KUTXABANK',
  ES_LIBERBANK = 'ES_LIBERBANK',
  ES_LOMBARD_ODIER = 'ES_LOMBARD_ODIER',
  ES_NATIXIS = 'ES_NATIXIS',
  ES_SANTANDER = 'ES_SANTANDER',
  ES_SOCIETE_GENERALE = 'ES_SOCIETE_GENERALE',
  ES_UBS = 'ES_UBS',
  ES_BANCO_SABADELL = 'ES_BANCO_SABADELL',
  ES_UNICAJA_BANCO = 'ES_UNICAJA_BANCO',
  ES_INTERACTIVE_BROKERS = 'ES_INTERACTIVE_BROKERS',
  ES_SCALABLE_CAPITAL = 'ES_SCALABLE_CAPITAL',
  ES_TRADE_REPUBLIC = 'ES_TRADE_REPUBLIC',
  ES_UNKNOWN = 'ES_UNKNOWN',

  FR_SCALABLE_CAPITAL = 'FR_SCALABLE_CAPITAL',
  FR_TRADE_REPUBLIC = 'FR_TRADE_REPUBLIC',
  FR_INTERACTIVE_BROKERS = 'FR_INTERACTIVE_BROKERS',
  FR_UNKNOWN = 'FR_UNKNOWN',

  BE_TRADE_REPUBLIC = 'BE_TRADE_REPUBLIC',
  BE_INTERACTIVE_BROKERS = 'BE_INTERACTIVE_BROKERS',
  BE_SWISSQUOTE = 'BE_SWISSQUOTE',
  BE_UNKNOWN = 'BE_UNKNOWN',

  CY_INTERACTIVE_BROKERS = 'CY_INTERACTIVE_BROKERS',

  PT_TRADE_REPUBLIC = 'PT_TRADE_REPUBLIC',
  PT_INTERACTIVE_BROKERS = 'PT_INTERACTIVE_BROKERS',
  PT_UNKNOWN = 'PT_UNKNOWN',

  NL_SCALABLE_CAPITAL = 'NL_SCALABLE_CAPITAL',
  NL_TRADE_REPUBLIC = 'NL_TRADE_REPUBLIC',
  NL_INTERACTIVE_BROKERS = 'NL_INTERACTIVE_BROKERS',
  NL_UNKNOWN = 'NL_UNKNOWN',

  IT_SCALABLE_CAPITAL = 'IT_SCALABLE_CAPITAL',
  IT_TRADE_REPUBLIC = 'IT_TRADE_REPUBLIC',
  IT_INTERACTIVE_BROKERS = 'IT_INTERACTIVE_BROKERS',
  IT_UNKNOWN = 'IT_UNKNOWN',

  DK_INTERACTIVE_BROKERS = 'DK_INTERACTIVE_BROKERS',
  DK_UNKNOWN = 'DK_UNKNOWN',

  SG_INTERACTIVE_BROKERS = 'SG_INTERACTIVE_BROKERS',
  SG_SAP = 'SG_SAP',
  SG_UNKNOWN = 'SG_UNKNOWN',

  CA_UNKNOWN = 'CA_UNKNOWN',

  LI_UNKNOWN = 'LI_UNKNOWN',

  SE_UNKNOWN = 'SE_UNKNOWN',
  NO_UNKNOWN = 'NO_UNKNOWN',
  FI_UNKNOWN = 'FI_UNKNOWN',
  IS_UNKNOWN = 'IS_UNKNOWN',
  GB_UNKOWN = 'GB_UNKNOWN',

  US_INTERACTIVE_BROKERS = 'US_INTERACTIVE_BROKERS',
  US_UNKNOWN = 'US_UNKNOWN',

  WW_EQUATEX = 'WW_EQUATEX',

  WW_INTERACTIVE_BROKERS = 'WW_INTERACTIVE_BROKERS',

  XX_DEMO = 'XX_DEMO',
}

export interface EndpointErrorOptions {
  // The context is sent to Sentry and is used to help diagnosing the error.
  context?: { [key: string]: any };
  // The properties are returned and allow for a business classification of the error.
  properties?: { [key: string]: any };

  code?: EndpointErrorCode;

  // Is the error user-friendly (i.e., not too technical or sensitive)?
  friendly?: boolean;
}

export enum EndpointErrorCode {
  SECDB_SECURITY_AGGREGATION_FAILED = 1,
  SECDB_DIVIDEND_AGGREGATION_FAILED = 2,
  SECDB_GENERIC = 3,
  GENERIC_SESSION_EXPIRED = 4,
}

export enum DepotImportStep {
  INTRO,
  COUNTRY,
  BANK,
  BANK_BRANCH,
  INTERFACE,
  AUTHENTICATE,
}

export enum DepotImportEventType {
  OPEN_IMPORT_MODAL = 'OPEN_IMPORT_MODAL',
  CONTINUE_INTRO = 'CONTINUE_INTRO',
  SELECT_COUNTRY = 'SELECT_COUNTRY',
  SELECT_BANK = 'SELECT_BANK',
  SELECT_BANK_BRANCH = 'SELECT_BANK_BRANCH',
  SELECT_INTERFACE = 'SELECT_INTERFACE',
  AUTHENTICATE = 'AUTHENTICATE',
  IMPORT_STARTED = 'IMPORT_STARTED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  MANUAL_IMPORT = 'MANUAL_IMPORT',
  SECAPI_IMPORT_ERROR = 'SECAPI_IMPORT_ERROR',
  SUCCESSFUL_IMPORT = 'SUCCESSFUL_IMPORT',
  GO_BACK = 'GO_BACK',
  CLOSE_IMPORT_MODAL = 'CLOSE_IMPORT_MODAL',
}

export interface DepotImportSessionWithRelations {
  id: string;
  createdAt: Date;
  userId: string;
  userAgent?: string;
  depotImportId?: string;
  depotImportEvents: DepotImportEvent[];
}

export interface DepotImportEvent {
  id: string;
  createdAt: Date;
  depotImportSessionId: string;
  type: DepotImportEventType;
  data: {
    [key: string]: any;
  };
}

export interface DepotImportSessionAction {
  id: string;
  sessionId: string;
  description: string;
  checked: boolean;
  createdAt: Date;
}

export type BankParentImporters = { bankParent: BankParent } & {
  [key in keyof typeof BankType]?: number;
};

type InterfaceDetail = {
  type: BankType;
  disabled?: boolean;
};

export type ImporterOverride = {
  id: string;
  bankParent: string;
  supportedInterfaces: InterfaceDetail[];
};

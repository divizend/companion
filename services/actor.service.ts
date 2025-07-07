import axios from 'axios';
import dayjs from 'dayjs';

import { usedConfig } from '@/common/config';
import { parseISODate } from '@/common/date-helper';
import SocketHandler from '@/socket/socket-handler';
import {
  ActorRequestType,
  CalendarDay,
  CalendarResponse,
  CompanyDividendData,
  CompanyFinancialsResponse,
  DividendCompanyResponse,
  DividendDisplayOption,
  DividendNewsResponse,
  GetCalendarDayDetailsResponse,
  GetCurrencyQuoteResponse,
  GetTopAndWorstThreeResponse,
  InitializeResponse,
  PerformanceCompanyResponse,
  PerformanceResponse,
  PortfolioStatsResponse,
  QuoteRange,
  QuotesResponse,
  SectorFeature,
  SectorResponse,
  SecurityAccountSecurity,
  SecurityAccountSecuritySplit,
} from '@/types/actor-api.types';
import { SecurityAccount, SecurityAccountSecurityDividend } from '@/types/secapi.types';

export class ActorService {
  private static actorApi = usedConfig.actorApi;
  private static initializingHash: string | undefined;
  private static initializingPromise: Promise<InitializeResponse> | undefined;

  private static restApi = axios.create({
    baseURL: this.actorApi?.url + '/api/' + this.actorApi?.versionCode,
  });

  public static async initializeRequest(data: SecurityAccount & { currency?: string }) {
    const hash = JSON.stringify(data);

    if (this.initializingHash === hash && this.initializingPromise) {
      console.log('Already initializing actor');
      return this.initializingPromise;
    }

    this.initializingHash = hash;
    this.initializingPromise = SocketHandler.request<InitializeResponse>({
      type: ActorRequestType.INITIALIZE_REQUEST,
      data,
    })
      .then(res => {
        if (!res.success) {
          throw new Error('Unable to initialize actor');
        }
        return res;
      })
      .finally(() => {
        this.initializingHash = undefined;
        this.initializingPromise = undefined;
      });

    return this.initializingPromise;
  }

  public static async getPerformanceQuotes(range: QuoteRange) {
    return (
      await SocketHandler.request<QuotesResponse>({
        type: ActorRequestType.GET_QUOTES_REQUEST,
        range: range,
      })
    ).quotes;
  }

  public static async getPerformance() {
    return await SocketHandler.request<PerformanceResponse>({
      type: ActorRequestType.GET_PERFORMANCE_REQUEST,
    });
  }

  public static async getPortfolioStats() {
    return await SocketHandler.request<PortfolioStatsResponse>({
      type: ActorRequestType.GET_PORTFOLIO_STATS_REQUEST,
    });
  }

  public static getDividendCalendar(year: number, month: number) {
    const startDate = dayjs(new Date(year, month - 1, 1));
    const endDate = startDate.endOf('month');

    return SocketHandler.request<CalendarResponse>({
      type: ActorRequestType.GET_CALENDAR_REQUEST,
      start: startDate.format('YYYY-MM-DD'),
      end: endDate.format('YYYY-MM-DD'),
    });
  }

  public static async getTopThreeWorstThree() {
    const data = await SocketHandler.request<GetTopAndWorstThreeResponse>({
      type: ActorRequestType.GET_TOP_THREE_WORST_THREE_REQUEST,
    });
    return data;
  }

  public static async getCurrencyQuote(from: string, to: string, date: string) {
    return SocketHandler.request<GetCurrencyQuoteResponse>({
      type: ActorRequestType.GET_CURRENCY_QUOTE_REQUEST,
      from,
      to,
      date,
    });
  }

  public static async getCompanyPerformance(security: SecurityAccountSecurity, currency?: string) {
    const data = await SocketHandler.request<PerformanceCompanyResponse>({
      type: ActorRequestType.GET_COMPANY_PERFORMANCE_REQUEST,
      security,
      currency,
    });
    return data;
  }

  public static async getCompanyQuotes(security: SecurityAccountSecurity, range: QuoteRange, currency?: string) {
    const data = await SocketHandler.request<QuotesResponse>({
      type: ActorRequestType.GET_COMPANY_QUOTES_REQUEST,
      security,
      currency,
      range,
    });
    return data.quotes;
  }

  public static async getCalendarDayDetails(calendarDay: CalendarDay) {
    return SocketHandler.request<GetCalendarDayDetailsResponse>({
      type: ActorRequestType.GET_CALENDAR_DAY_DETAILS_REQUEST,
      calendarDay,
    });
  }

  public static calculateSplitAdjustedDividend(
    dividend: SecurityAccountSecurityDividend,
    splits: SecurityAccountSecuritySplit[],
  ) {
    const dividendDate = parseISODate(dividend.date).unix();

    const relevantSplits = splits.filter(split => parseISODate(split.date).unix() >= dividendDate);

    const adjustedAmount = relevantSplits.reduceRight((amount, split) => {
      amount /= split.to / split.from;
      return amount;
    }, dividend.originalYield!.amount);

    return {
      price: adjustedAmount,
      currency: dividend.originalYield!.unit,
      time: Number(dividend.date),
    };
  }

  public static async getCompanyDividendsHistory(
    security: SecurityAccountSecurity,
    _: DividendDisplayOption,
  ): Promise<CompanyDividendData> {
    return await SocketHandler.request<DividendCompanyResponse>({
      type: ActorRequestType.GET_COMPANY_DIVIDEND_HISTORY_REQUEST,
      security,
    }).then(res => res.companyDividendData);
  }

  public static getDividendsPerYear(security: SecurityAccountSecurity) {
    const dividendsPerYear = {} as { [year: string]: number };
    security.dividends.forEach(dividend => {
      const year = dayjs(dividend.date).year();
      if (!dividendsPerYear[year]) {
        dividendsPerYear[year] = 0;
      }
      dividendsPerYear[year] += this.calculateSplitAdjustedDividend(dividend, security.splits).price;
    });
    const sortedYears = Object.keys(dividendsPerYear)
      .map(Number)
      .sort((a, b) => a - b);
    const sortedDividendsPerYear = Object.fromEntries(
      sortedYears.map(year => [String(year), dividendsPerYear[String(year)]]),
    );
    return sortedDividendsPerYear;
  }

  public static getContinuousDividendIncreases(security: SecurityAccountSecurity) {
    const dividendsPerYear = this.getDividendsPerYear(security);
    let startYear: number | null = null;
    let continuousIncreases: number[][] = [];
    console.log(dividendsPerYear);
    Object.entries(dividendsPerYear).forEach(([year, amount]) => {
      const currentYear = parseInt(year);
      if (startYear === null) {
        startYear = currentYear;
      } else if (
        (amount > dividendsPerYear[startYear] && continuousIncreases.length == 0) ||
        (amount > dividendsPerYear[startYear] &&
          continuousIncreases.length > 0 &&
          startYear != continuousIncreases[continuousIncreases.length - 1]?.[0]) ||
        (continuousIncreases && amount > dividendsPerYear[continuousIncreases[continuousIncreases.length - 1]?.[1]])
      ) {
        if (continuousIncreases.length > 0 && continuousIncreases[continuousIncreases.length - 1]?.[0] === startYear) {
          continuousIncreases[continuousIncreases.length - 1][1] = currentYear;
        } else {
          continuousIncreases.push([startYear, currentYear]);
        }
      } else {
        startYear = currentYear;
      }
    });

    return continuousIncreases.length > 0 ? continuousIncreases : undefined;
  }

  public static getYearsWithNoDividendCuts(security: SecurityAccountSecurity) {
    const dividendsPerYear = this.getDividendsPerYear(security);
    let startYear: number | null = null;
    let yearsWithNoCuts: number[][] = [];
    const years = Object.keys(dividendsPerYear).map(Number);
    const lastYear = Math.max(...years);

    let i = 0;
    for (const [year, amount] of Object.entries(dividendsPerYear)) {
      const currentYear = parseInt(year);

      if (amount === undefined || amount === 0) {
        if (startYear !== null) {
          const previousYear = years[i - 1];
          yearsWithNoCuts.push([startYear, previousYear]);
          startYear = null;
        }
      } else if (startYear === null) {
        startYear = currentYear;
      }
      i++;
    }

    if (startYear !== null) {
      yearsWithNoCuts.push([startYear, lastYear]);
    }

    return yearsWithNoCuts.length > 0 ? yearsWithNoCuts : undefined;
  }

  public static async getCompanyFinancials(security: SecurityAccountSecurity, currency: string) {
    return await SocketHandler.request<CompanyFinancialsResponse>({
      type: ActorRequestType.GET_COMPANY_FINANCIALS_REQUEST,
      security,
      currency,
    });
  }

  public static async getDividendNews(date?: string, lang?: string): Promise<DividendNewsResponse[]> {
    const response = await this.restApi.get('/news', {
      params: {
        startDate: date,
        endDate: date,
        daysLimit: 1,
        lang,
        format: 'json',
      },
    });
    const articles = response.data
      .map((item: any) => ({
        title: item.article?.title,
        body: item.article?.body,
        isin: item.company?.isin,
      }))
      .filter((article: any) => article.title && article.body);
    return articles;
  }

  private static normalizeSectorShares(sectors: Record<string, SectorFeature>) {
    const isins = Object.keys(sectors);
    for (const isin of isins) {
      const sector = sectors[isin];
      // Accumulate totalShares only if the sector property exists
      const totalShares = sector.reduce((acc, s) => acc + s.share, 0);
      if (totalShares < 100) {
        sector.push({
          share: 100 - totalShares,
          sector: 'other',
          country: sector.at(0)?.country ?? 'DE',
          isin,
        });
      }
    }

    return sectors;
  }

  public static async getCompanySectors(isin: string) {
    const response = await SocketHandler.request<SectorResponse>({
      type: ActorRequestType.GET_COMPANY_SECTOR_REQUEST,
      isins: [isin],
    });

    return this.normalizeSectorShares(response.entries)[isin];
  }

  public static async getPortfolioSectors() {
    const response = await SocketHandler.request<SectorResponse>({
      type: ActorRequestType.GET_SECTOR_REQUEST,
    });

    return this.normalizeSectorShares(response.entries);
  }
}

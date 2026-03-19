// In-memory cache with 5min TTL
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry || Date.now() - entry.ts > CACHE_TTL) return null;
  return entry.data as T;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, ts: Date.now() });
}

export interface MFNavResult {
  nav: number;
  date: string;
  schemeName: string;
}

export async function fetchMFNav(schemeCode: string): Promise<MFNavResult> {
  const cacheKey = `mf:${schemeCode}`;
  const cached = getCached<MFNavResult>(cacheKey);
  if (cached) return cached;

  const res = await fetch(`https://api.mfapi.in/mf/${schemeCode}`);
  if (!res.ok) throw new Error(`MF API error: ${res.status}`);
  const json = await res.json();

  if (!json.data || json.data.length === 0) {
    throw new Error(`No NAV data for scheme ${schemeCode}`);
  }

  const latest = json.data[0];
  const result: MFNavResult = {
    nav: parseFloat(latest.nav),
    date: latest.date,
    schemeName: json.meta?.scheme_name ?? `Scheme ${schemeCode}`,
  };
  setCache(cacheKey, result);
  return result;
}

export interface StockPriceResult {
  price: number;
  change: number;
  changePercent: number;
  currency: string;
}

export async function fetchStockPrice(ticker: string): Promise<StockPriceResult> {
  const cacheKey = `stock:${ticker}`;
  const cached = getCached<StockPriceResult>(cacheKey);
  if (cached) return cached;

  const res = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`,
    { headers: { 'User-Agent': 'Mozilla/5.0' } }
  );
  if (!res.ok) throw new Error(`Yahoo Finance error: ${res.status}`);
  const json = await res.json();

  const meta = json.chart?.result?.[0]?.meta;
  if (!meta) throw new Error(`No data for ticker ${ticker}`);

  const result: StockPriceResult = {
    price: meta.regularMarketPrice ?? 0,
    change: (meta.regularMarketPrice ?? 0) - (meta.previousClose ?? 0),
    changePercent: meta.previousClose
      ? (((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100)
      : 0,
    currency: meta.currency ?? 'INR',
  };
  setCache(cacheKey, result);
  return result;
}

export interface InvestmentHolding {
  id: string;
  type: 'MF' | 'Stock';
  name: string;
  schemeCodeOrTicker: string;
  units: number;
  avgBuyPrice: number;
  livePrice: number;
  currentValue: number;
  invested: number;
  gainLoss: number;
  gainLossPercent: number;
}

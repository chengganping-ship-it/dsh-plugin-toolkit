/**
 * Real Historical Data Fetcher
 *
 * Pulls real funding rate history from exchanges for accurate backtesting.
 *
 * Binance: /fapi/v1/fundingRate (historical, up to 1000 records)
 * Bybit: /v5/market/funding/history
 * OKX: /api/v5/public/funding-rate-history
 *
 * Breakthrough: Real backtesting with actual historical rates proves
 * whether strategies actually work (synthetic data is meaningless).
 */

export interface HistoricalFundingRate {
  symbol: string;
  exchange: string;
  fundingRate: number;
  fundingTime: number;
  markPrice?: number;
}

async function fetchJson(url: string, timeoutMs = 15000): Promise<any> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'funding-mirror/2.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally { clearTimeout(t); }
}

/**
 * Fetch real historical funding rates from Binance.
 * Returns up to 1000 most recent rates (~125 days at 8h intervals).
 */
export async function fetchBinanceHistory(symbol: string, limit = 500): Promise<HistoricalFundingRate[]> {
  try {
    const data = await fetchJson(
      `https://fapi.binance.com/fapi/v1/fundingRate?symbol=${symbol}&limit=${limit}`
    );
    return (data || []).map((d: any) => ({
      symbol,
      exchange: 'Binance',
      fundingRate: parseFloat(d.fundingRate),
      fundingTime: parseInt(d.fundingTime),
      markPrice: d.markPrice ? parseFloat(d.markPrice) : undefined,
    }));
  } catch (err: any) {
    console.error(`History fetch Binance: ${err.message}`);
    return [];
  }
}

/**
 * Fetch real historical funding rates from Bybit.
 */
export async function fetchBybitHistory(symbol: string, limit = 200): Promise<HistoricalFundingRate[]> {
  try {
    const data = await fetchJson(
      `https://api.bybit.com/v5/market/funding/history?category=linear&symbol=${symbol}&limit=${limit}`
    );
    return (data.result?.list || []).map((d: any) => ({
      symbol,
      exchange: 'Bybit',
      fundingRate: parseFloat(d.fundingRate),
      fundingTime: parseInt(d.fundingTime),
    }));
  } catch (err: any) {
    console.error(`History fetch Bybit: ${err.message}`);
    return [];
  }
}

/**
 * Fetch real historical funding rates from OKX.
 */
export async function fetchOKXHistory(symbol: string, limit = 100): Promise<HistoricalFundingRate[]> {
  try {
    const instId = `${symbol.replace('USDT', '')}-USDT-SWAP`;
    const data = await fetchJson(
      `https://www.okx.com/api/v5/public/funding-rate-history?instId=${instId}&limit=${limit}`
    );
    return (data.data || []).map((d: any) => ({
      symbol,
      exchange: 'OKX',
      fundingRate: parseFloat(d.fundingRate),
      fundingTime: parseInt(d.fundingTime),
      markPrice: d.markPrice ? parseFloat(d.markPrice) : undefined,
    }));
  } catch (err: any) {
    console.error(`History fetch OKX: ${err.message}`);
    return [];
  }
}

/**
 * Fetch history from all 3 major exchanges for a symbol.
 */
export async function fetchAllHistory(symbol: string): Promise<{
  rates: HistoricalFundingRate[];
  errors: Record<string, string>;
}> {
  const results = await Promise.allSettled([
    fetchBinanceHistory(symbol),
    fetchBybitHistory(symbol),
    fetchOKXHistory(symbol),
  ]);

  const rates: HistoricalFundingRate[] = [];
  const errors: Record<string, string> = {};

  if (results[0].status === 'fulfilled') rates.push(...results[0].value);
  else errors.Binance = String(results[0].reason?.message || 'unknown');

  if (results[1].status === 'fulfilled') rates.push(...results[1].value);
  else errors.Bybit = String(results[1].reason?.message || 'unknown');

  if (results[2].status === 'fulfilled') rates.push(...results[2].value);
  else errors.OKX = String(results[2].reason?.message || 'unknown');

  rates.sort((a, b) => a.fundingTime - b.fundingTime);
  return { rates, errors };
}

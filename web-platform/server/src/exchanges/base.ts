/**
 * Exchange connector base + all 5 exchange implementations.
 * Binance / Bybit / OKX / Gate / Bitget
 */

export interface FundingRate {
  exchange: string;
  symbol: string;
  fundingRate: number;
  markPrice: number;
  indexPrice?: number;
  openInterest: number;
  volume24h: number;
  nextFundingTime?: number;
  fetchedAt: number;
}

export interface OrderBookLevel {
  price: number;
  size: number;
}

export interface OrderBook {
  exchange: string;
  symbol: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  fetchedAt: number;
}

async function getJson(url: string, timeoutMs = 12000): Promise<any> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'funding-mirror/1.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally { clearTimeout(t); }
}

// ==================== BINANCE ========================

export async function fetchBinance(): Promise<FundingRate[]> {
  const [prem, tick] = await Promise.all([
    getJson('https://fapi.binance.com/fapi/v1/premiumIndex'),
    getJson('https://fapi.binance.com/fapi/v1/ticker/24hr'),
  ]);
  const vol = new Map<string, { oi: number; vol: number; nextTs: number }>();
  for (const t of tick) {
    vol.set(t.symbol, { oi: +t.openInterest || 0, vol: +t.quoteVolume || 0, nextTs: t.nextFundingTime || 0 });
  }
  return (prem as any[])
    .filter((p: any) => p.symbol.endsWith('USDT'))
    .map((p: any) => {
      const v = vol.get(p.symbol) || { oi: 0, vol: 0, nextTs: 0 };
      return {
        exchange: 'Binance', symbol: p.symbol,
        fundingRate: +p.lastFundingRate || 0,
        markPrice: +p.markPrice || 0,
        indexPrice: +p.indexPrice || 0,
        openInterest: v.oi, volume24h: v.vol,
        nextFundingTime: v.nextTs, fetchedAt: Date.now(),
      } as FundingRate;
    });
}

export async function fetchBinanceOrderBook(symbol: string): Promise<OrderBook> {
  const data = await getJson(`https://fapi.binance.com/fapi/v1/depth?symbol=${symbol}&limit=20`);
  return {
    exchange: 'Binance', symbol,
    bids: (data.bids || []).map((x: string[]) => ({ price: +x[0], size: +x[1] })),
    asks: (data.asks || []).map((x: string[]) => ({ price: +x[0], size: +x[1] })),
    fetchedAt: Date.now(),
  };
}

// ==================== BYBIT ==========================

export async function fetchBybit(): Promise<FundingRate[]> {
  const data = await getJson('https://api.bybit.com/v5/market/tickers?category=linear');
  return (data.result?.list || [])
    .filter((t: any) => t.symbol.endsWith('USDT'))
    .map((t: any) => ({
      exchange: 'Bybit', symbol: t.symbol,
      fundingRate: +t.fundingRate || 0,
      markPrice: +t.markPrice || 0,
      openInterest: +t.openInterest || 0,
      volume24h: +t.turnover24h || 0,
      nextFundingTime: +t.nextFundingTime || 0,
      fetchedAt: Date.now(),
    } as FundingRate));
}

export async function fetchBybitOrderBook(symbol: string): Promise<OrderBook> {
  const data = await getJson(`https://api.bybit.com/v5/market/orderbook?category=linear&symbol=${symbol}&limit=20`);
  return {
    exchange: 'Bybit', symbol,
    bids: (data.result?.b || []).map((x: string[]) => ({ price: +x[0], size: +x[1] })),
    asks: (data.result?.a || []).map((x: string[]) => ({ price: +x[0], size: +x[1] })),
    fetchedAt: Date.now(),
  };
}

// ==================== OKX ============================

export async function fetchOKX(): Promise<FundingRate[]> {
  const insts = await getJson('https://www.okx.com/api/v5/public/instruments?instType=SWAP');
  const swaps = (insts.data || []).filter((i: any) => i.instId?.endsWith('-USDT-SWAP')).slice(0, 50);
  const out: FundingRate[] = [];
  for (let i = 0; i < swaps.length; i += 5) {
    const batch = swaps.slice(i, i + 5);
    const results = await Promise.all(batch.map(async (inst: any) => {
      try {
        const [rateRes, tickerRes] = await Promise.all([
          getJson(`https://www.okx.com/api/v5/public/funding-rate?instId=${inst.instId}`, 8000),
          getJson(`https://www.okx.com/api/v5/market/ticker?instId=${inst.instId}`, 8000),
        ]);
        const rate = rateRes.data?.[0];
        const tk = tickerRes.data?.[0];
        if (rate) {
          return {
            exchange: 'OKX',
            symbol: inst.instId.replace('-USDT-SWAP', 'USDT'),
            fundingRate: +rate.fundingRate || 0,
            markPrice: +tk?.last || +rate.markPrice || 0,
            openInterest: +rate.openInterest || 0,
            volume24h: +tk?.volCcy24h || 0,
            nextFundingTime: +rate.fundingTime || 0,
            fetchedAt: Date.now(),
          } as FundingRate;
        }
      } catch { /* skip */ }
      return null;
    }));
    for (const r of results) if (r) out.push(r);
  }
  return out;
}

// ==================== GATE ============================

export async function fetchGate(): Promise<FundingRate[]> {
  const data = await getJson('https://api.gateio.ws/api/v4/futures/usdt/contracts');
  return (data || [])
    .filter((c: any) => c.name?.endsWith('_USDT'))
    .map((c: any) => ({
      exchange: 'Gate',
      symbol: c.name.replace('_USDT', 'USDT'),
      fundingRate: +c.funding_rate || 0,
      markPrice: +c.mark_price || 0,
      indexPrice: +c.index_price || 0,
      openInterest: +c.quanto_base_rate || 0,
      volume24h: +c.volume_24h_quote || 0,
      fetchedAt: Date.now(),
    } as FundingRate));
}

// ==================== BITGET ==========================

export async function fetchBitget(): Promise<FundingRate[]> {
  const data = await getJson('https://api.bitget.com/api/v2/mix/market/tickers?productType=usdt-futures');
  return (data.data || [])
    .filter((t: any) => t.symbol?.endsWith('USDT'))
    .map((t: any) => ({
      exchange: 'Bitget',
      symbol: t.symbol,
      fundingRate: +t.fundingRate || 0,
      markPrice: +t.markPrice || 0,
      openInterest: +t.openInterest || 0,
      volume24h: +t.baseVolume || 0,
      nextFundingTime: +t.nextSettleTime || 0,
      fetchedAt: Date.now(),
    } as FundingRate));
}

// ==================== UNIFIED =========================

export const ALL_FETCHERS = [
  { name: 'Binance', fn: fetchBinance },
  { name: 'Bybit', fn: fetchBybit },
  { name: 'OKX', fn: fetchOKX },
  { name: 'Gate', fn: fetchGate },
  { name: 'Bitget', fn: fetchBitget },
];

export async function fetchAllRates(): Promise<{ rates: FundingRate[]; errors: Record<string, string> }> {
  const results = await Promise.allSettled(ALL_FETCHERS.map(f => f.fn()));
  const rates: FundingRate[] = [];
  const errors: Record<string, string> = {};
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') rates.push(...r.value);
    else errors[ALL_FETCHERS[i].name] = String(r.reason?.message || r.reason);
  });
  return { rates, errors };
}

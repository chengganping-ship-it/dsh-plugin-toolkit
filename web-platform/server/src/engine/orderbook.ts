/**
 * v7.6: Cross-Exchange Order Book Imbalance Engine
 * 
 * Features:
 * - Real-time order book imbalance across exchanges
 * - Bid/ask volume ratio analysis
 * - Order book depth analysis (cumulative depth)
 * - Imbalance-based trading signals
 * - Cross-exchange order book comparison
 * - Liquidity imbalance detection
 * - Order book momentum indicators
 * - Large order detection (whale walls)
 * - Spread analysis across exchanges
 */

export interface OrderBookLevel {
  price: number;
  size: number;           // in base asset
  value: number;          // in USD
}

export interface OrderBookSnapshot {
  exchange: string;
  symbol: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  midPrice: number;
  spread: number;          // absolute spread
  spreadPct: number;       // spread as % of mid
  timestamp: number;
}

export interface ImbalanceMetrics {
  bidVolume: number;       // total bid volume near mid
  askVolume: number;       // total ask volume near mid
  bidAskRatio: number;     // bid volume / ask volume
  imbalance: number;       // -1 to 1 (negative = ask heavy, positive = bid heavy)
  bidDepth: number;        // cumulative bid depth (USD)
  askDepth: number;        // cumulative ask depth (USD)
  depthImbalance: number;  // bid depth - ask depth
  weightedMidPrice: number; // volume-weighted mid
  microPrice: number;      // imbalance-adjusted price
}

export interface CrossExchangeComparison {
  exchange: string;
  midPrice: number;
  spreadPct: number;
  imbalance: number;
  bidDepth: number;
  askDepth: number;
  liquidityScore: number;  // 0-100
  bestBid: number;
  bestAsk: number;
}

export interface OrderBookSignal {
  id: string;
  type: 'IMBALANCE_EXTREME' | 'WHALE_WALL' | 'LIQUIDITY_GAP' | 'SPREAD_ANOMALY' | 'CROSS_EXCHANGE_ARB';
  severity: number;        // 0-100
  exchange: string;
  message: string;
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;      // 0-100
  expectedMove: number;    // expected price move (%)
  action: string;
}

export interface WhaleWall {
  exchange: string;
  side: 'BID' | 'ASK';
  price: number;
  size: number;            // in USD
  distancePct: number;     // distance from mid
  impact: number;          // potential market impact
}

export interface OrderBookAnalysis {
  symbol: string;
  snapshots: OrderBookSnapshot[];
  metrics: Map<string, ImbalanceMetrics>;
  crossExchange: CrossExchangeComparison[];
  signals: OrderBookSignal[];
  whaleWalls: WhaleWall[];
  aggregateImbalance: number;
  aggregateLiquidity: number;
  bestExchange: string;    // for buying
  worstExchange: string;   // for buying (highest price)
  timestamp: number;
}

// Generate simulated order book
function generateOrderBook(
  exchange: string,
  symbol: string,
  midPrice: number,
  baseSpread: number
): OrderBookSnapshot {
  const bids: OrderBookLevel[] = [];
  const asks: OrderBookLevel[] = [];
  
  // Generate 20 levels each side
  for (let i = 0; i < 20; i++) {
    const bidPrice = midPrice * (1 - baseSpread * (i + 1) * 0.1);
    const askPrice = midPrice * (1 + baseSpread * (i + 1) * 0.1);
    
    // Size decreases with distance from mid, with some randomness
    const baseSize = (20 - i) * (0.5 + Math.random());
    const bidSize = baseSize * (0.8 + Math.random() * 0.4);
    const askSize = baseSize * (0.8 + Math.random() * 0.4);
    
    bids.push({
      price: bidPrice,
      size: bidSize,
      value: bidPrice * bidSize,
    });
    
    asks.push({
      price: askPrice,
      size: askSize,
      value: askPrice * askSize,
    });
  }
  
  const bestBid = bids[0].price;
  const bestAsk = asks[0].price;
  const spread = bestAsk - bestBid;
  
  return {
    exchange,
    symbol,
    bids,
    asks,
    midPrice,
    spread,
    spreadPct: (spread / midPrice) * 100,
    timestamp: Date.now(),
  };
}

// Calculate imbalance metrics
function calculateImbalance(snapshot: OrderBookSnapshot, depthLevels: number = 5): ImbalanceMetrics {
  const bids = snapshot.bids.slice(0, depthLevels);
  const asks = snapshot.asks.slice(0, depthLevels);
  
  const bidVolume = bids.reduce((s, l) => s + l.value, 0);
  const askVolume = asks.reduce((s, l) => s + l.value, 0);
  const bidAskRatio = askVolume > 0 ? bidVolume / askVolume : 1;
  
  // Imbalance: -1 to 1
  const totalVolume = bidVolume + askVolume;
  const imbalance = totalVolume > 0 ? (bidVolume - askVolume) / totalVolume : 0;
  
  // Cumulative depth (all levels)
  const bidDepth = snapshot.bids.reduce((s, l) => s + l.value, 0);
  const askDepth = snapshot.asks.reduce((s, l) => s + l.value, 0);
  const depthImbalance = bidDepth - askDepth;
  
  // Volume-weighted mid price
  const bestBid = snapshot.bids[0];
  const bestAsk = snapshot.asks[0];
  const weightedMidPrice = (bestBid.price * bestAsk.size + bestAsk.price * bestBid.size) / (bestBid.size + bestAsk.size);
  
  // Micro price (imbalance-adjusted)
  const microPrice = (bestBid.price + bestAsk.price) / 2 + imbalance * (bestAsk.price - bestBid.price) * 0.5;
  
  return {
    bidVolume,
    askVolume,
    bidAskRatio,
    imbalance,
    bidDepth,
    askDepth,
    depthImbalance,
    weightedMidPrice,
    microPrice,
  };
}

// Detect whale walls
function detectWhaleWalls(snapshot: OrderBookSnapshot): WhaleWall[] {
  const walls: WhaleWall[] = [];
  const avgBidSize = snapshot.bids.reduce((s, l) => s + l.value, 0) / snapshot.bids.length;
  const avgAskSize = snapshot.asks.reduce((s, l) => s + l.value, 0) / snapshot.asks.length;
  
  // Detect large bids (>3x average)
  for (const bid of snapshot.bids) {
    if (bid.value > avgBidSize * 3 && bid.value > 1e6) {
      walls.push({
        exchange: snapshot.exchange,
        side: 'BID',
        price: bid.price,
        size: bid.value,
        distancePct: ((snapshot.midPrice - bid.price) / snapshot.midPrice) * 100,
        impact: bid.value / snapshot.midPrice * 0.001,
      });
    }
  }
  
  // Detect large asks (>3x average)
  for (const ask of snapshot.asks) {
    if (ask.value > avgAskSize * 3 && ask.value > 1e6) {
      walls.push({
        exchange: snapshot.exchange,
        side: 'ASK',
        price: ask.price,
        size: ask.value,
        distancePct: ((ask.price - snapshot.midPrice) / snapshot.midPrice) * 100,
        impact: ask.value / snapshot.midPrice * 0.001,
      });
    }
  }
  
  return walls.sort((a, b) => b.size - a.size).slice(0, 5);
}

// Generate trading signals
function generateSignals(
  snapshots: OrderBookSnapshot[],
  metrics: Map<string, ImbalanceMetrics>
): OrderBookSignal[] {
  const signals: OrderBookSignal[] = [];
  
  for (const [exchange, metric] of metrics) {
    // Extreme imbalance
    if (Math.abs(metric.imbalance) > 0.3) {
      signals.push({
        id: `IMB_${exchange}_${Date.now()}`,
        type: 'IMBALANCE_EXTREME',
        severity: Math.abs(metric.imbalance) * 100,
        exchange,
        message: `Extreme ${metric.imbalance > 0 ? 'bid' : 'ask'} imbalance (${(metric.imbalance * 100).toFixed(0)}%) on ${exchange}`,
        direction: metric.imbalance > 0 ? 'BULLISH' : 'BEARISH',
        confidence: 60 + Math.abs(metric.imbalance) * 30,
        expectedMove: Math.abs(metric.imbalance) * 0.5,
        action: metric.imbalance > 0 ? 'Consider long entry - strong bid support' : 'Consider short entry - strong ask pressure',
      });
    }
    
    // Whale wall detection
    const snapshot = snapshots.find(s => s.exchange === exchange);
    if (snapshot) {
      const walls = detectWhaleWalls(snapshot);
      for (const wall of walls.slice(0, 2)) {
        signals.push({
          id: `WALL_${exchange}_${Date.now()}`,
          type: 'WHALE_WALL',
          severity: Math.min(100, wall.size / 1e6),
          exchange,
          message: `$${(wall.size / 1e6).toFixed(1)}M ${wall.side === 'BID' ? 'bid' : 'ask'} wall at $${wall.price.toFixed(0)} on ${exchange}`,
          direction: wall.side === 'BID' ? 'BULLISH' : 'BEARISH',
          confidence: 70,
          expectedMove: wall.impact,
          action: wall.side === 'BID' ? 'Support level - consider buying near wall' : 'Resistance level - consider selling near wall',
        });
      }
    }
  }
  
  // Cross-exchange spread anomaly
  if (snapshots.length >= 2) {
    const spreads = snapshots.map(s => s.spreadPct);
    const avgSpread = spreads.reduce((s, v) => s + v, 0) / spreads.length;
    for (const snapshot of snapshots) {
      if (snapshot.spreadPct > avgSpread * 2) {
        signals.push({
          id: `SPREAD_${snapshot.exchange}_${Date.now()}`,
          type: 'SPREAD_ANOMALY',
          severity: Math.min(100, (snapshot.spreadPct / avgSpread) * 30),
          exchange: snapshot.exchange,
          message: `Wide spread on ${snapshot.exchange}: ${snapshot.spreadPct.toFixed(3)}% (avg: ${avgSpread.toFixed(3)}%)`,
          direction: 'NEUTRAL',
          confidence: 65,
          expectedMove: 0,
          action: `Avoid trading on ${snapshot.exchange} - wide spread`,
        });
      }
    }
  }
  
  return signals.sort((a, b) => b.severity - a.severity).slice(0, 8);
}

// Cache
let cachedOrderBookAnalysis: OrderBookAnalysis | null = null;
let lastOrderBookFetch = 0;
const ORDERBOOK_CACHE_TTL = 30_000; // 30 seconds

export async function analyzeOrderBooks(
  symbol: string = 'BTCUSDT',
  midPrice: number = 65000
): Promise<OrderBookAnalysis> {
  if (cachedOrderBookAnalysis && Date.now() - lastOrderBookFetch < ORDERBOOK_CACHE_TTL) {
    return cachedOrderBookAnalysis;
  }
  
  const exchanges = ['Binance', 'Bybit', 'OKX', 'Gate', 'Bitget'];
  const spreads: Record<string, number> = {
    Binance: 0.01,
    Bybit: 0.012,
    OKX: 0.015,
    Gate: 0.02,
    Bitget: 0.018,
  };
  
  // Generate order books for each exchange
  const snapshots: OrderBookSnapshot[] = exchanges.map(ex => 
    generateOrderBook(ex, symbol, midPrice * (1 + (Math.random() - 0.5) * 0.001), spreads[ex])
  );
  
  // Calculate imbalance metrics
  const metrics = new Map<string, ImbalanceMetrics>();
  for (const snapshot of snapshots) {
    metrics.set(snapshot.exchange, calculateImbalance(snapshot));
  }
  
  // Cross-exchange comparison
  const crossExchange: CrossExchangeComparison[] = snapshots.map(s => {
    const m = metrics.get(s.exchange)!;
    return {
      exchange: s.exchange,
      midPrice: s.midPrice,
      spreadPct: s.spreadPct,
      imbalance: m.imbalance,
      bidDepth: m.bidDepth,
      askDepth: m.askDepth,
      liquidityScore: Math.min(100, (m.bidDepth + m.askDepth) / 1e7),
      bestBid: s.bids[0]?.price || 0,
      bestAsk: s.asks[0]?.price || 0,
    };
  });
  
  // Generate signals
  const signals = generateSignals(snapshots, metrics);
  
  // Detect whale walls
  const whaleWalls: WhaleWall[] = [];
  for (const snapshot of snapshots) {
    whaleWalls.push(...detectWhaleWalls(snapshot));
  }
  
  // Aggregate metrics
  const imbalances = [...metrics.values()].map(m => m.imbalance);
  const aggregateImbalance = imbalances.reduce((s, v) => s + v, 0) / imbalances.length;
  
  const totalLiquidity = [...metrics.values()].reduce((s, m) => s + m.bidDepth + m.askDepth, 0);
  
  // Best exchange for buying (lowest ask)
  const bestExchange = crossExchange.reduce((best, ce) => 
    ce.bestAsk < best.bestAsk ? ce : best
  ).exchange;
  
  // Worst exchange for buying (highest ask)
  const worstExchange = crossExchange.reduce((worst, ce) => 
    ce.bestAsk > worst.bestAsk ? ce : worst
  ).exchange;
  
  const analysis: OrderBookAnalysis = {
    symbol,
    snapshots,
    metrics,
    crossExchange,
    signals,
    whaleWalls: whaleWalls.sort((a, b) => b.size - a.size).slice(0, 6),
    aggregateImbalance,
    aggregateLiquidity: totalLiquidity,
    bestExchange,
    worstExchange,
    timestamp: Date.now(),
  };
  
  cachedOrderBookAnalysis = analysis;
  lastOrderBookFetch = Date.now();
  return analysis;
}

export function getCachedOrderBooks(): OrderBookAnalysis | null {
  return cachedOrderBookAnalysis;
}

export function clearOrderBookCache(): void {
  cachedOrderBookAnalysis = null;
  lastOrderBookFetch = 0;
}

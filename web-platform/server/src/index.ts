/**
 * Funding Mirror Web Server v2
 *
 * Full-stack arbitrage platform with:
 * - 5 exchanges: Binance / Bybit / OKX / Gate / Bitget
 * - Real-time arbitrage detection
 * - Anomaly detection (statistical)
 * - Rate prediction (order book + momentum)
 * - Capacity estimation (order book depth)
 * - Cross-pair correlation arbitrage
 * - Advanced backtesting (4 strategies)
 * - Paper trading with live PnL
 * - SQLite persistence
 * - WebSocket + REST API
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { fetchAllRates, fetchBinanceOrderBook, fetchBybitOrderBook, FundingRate, OrderBook } from './exchanges/base.js';
import { detectAnomalies, AnomalyEvent } from './engine/anomaly.js';
import { predictRates, Prediction } from './engine/predictor.js';
import { estimateCapacity, CapacityEstimate } from './engine/capacity.js';
import { detectCrossPair, CrossPairSignal } from './engine/crosspair.js';
import { runBacktest, generateSyntheticRates, BacktestParams, BacktestResult } from './engine/backtest.js';
import { openPosition, updatePositions, getTradeStats, PaperTradeStats } from './engine/paper.js';
import { calcKelly, calcMultiKelly } from './engine/kelly.js';
import { fetchAllHistory } from './engine/history.js';
import { sendAlert, AlertConfig, createDefaultConfig } from './engine/alerts.js';
import { TradeExecutor, ExchangeCredentials, OrderRequest } from './engine/executor.js';
import { predictML, MLPrediction, getModelState, getPredictionAccuracy, getPredictionHistory } from './engine/ml.js';
import { optimizePortfolio, PortfolioResult, getCorrelationMatrix, getRiskDecomposition } from './engine/portfolio.js';
import { detectRegime, RegimeState, getRegimeStats, getCurrentRegime } from './engine/regime.js';
import { fetchDeFiRates, findCrossDomainArbitrage, getDeFiSummary, CrossDomainArbitrage } from './engine/defi.js';
import { routeOrder, RouterDecision, RouterConfig, getRouterState, updateTradeState, updateRouterConfig, getRouterConfig } from './engine/router.js';
import { getAttribution, AttributionBreakdown, getAttributionMetrics, recordAttributionTrade, updateEquitySnapshot, getEquityCurve, PnLSnapshot } from './engine/attribution.js';
import { recordRequest, recordResponse, getHealthStatus, getUsageSummary, getOptimalPollIntervals, shouldPoll, getExchangeLimits, ExchangeHealth } from './engine/health.js';
import { evaluateStrategies, StrategySignal, Strategy, createStrategy, updateStrategy, deleteStrategy, getAllStrategies, getStrategyTemplates, toggleStrategy, getUserStrategies } from './engine/strategy.js';
import { configureBot, sendBotMessage, generateStatusReport, generateTopOpportunitiesReport, generateHealthReport, generateKellyResponse, generateRegimeReport, getBotConfig, getBotMessageLog } from './engine/bot.js';
import { calculateFees, FeeBreakdown, getFeeSchedule, getNetworkFees, calculateBreakeven, rankByNetProfitability } from './engine/fees.js';
import { addRateSample, calculateVolSurface, getVolComparison, detectVolRegimeChange, getVolSurfaceGrid, VolSurface } from './engine/volatility.js';
import { addAccount, removeAccount, listAccounts, getAggregatedPortfolio, getBalanceRecommendations, simulateBalanceUpdate, AggregatedPortfolio } from './engine/accounts.js';
import { aggregateYields, getTopYields, getYieldsByRisk, getYieldSummary, clearYieldCache, YieldOpportunity } from './engine/yield.js';
import { analyzeSentiment, getSentimentHistory, getCachedSentiment, clearSentimentCache, SentimentSummary, NewsItem } from './engine/sentiment.js';
import { getBestRoute, clearQuoteCache, DexQuote } from './engine/dexRouter.js';
import { analyzeWhaleActivity, getCachedWhaleSummary, clearWhaleCache, WhaleSummary } from './engine/whale.js';
import { analyzeBridges, getCachedBridgeSummary, clearBridgeCache, BridgeSummary } from './engine/bridge.js';
import { analyzeOptions, getOptionsSummary, GreeksSummary } from './engine/options.js';
import { optimizeGrid, getCachedGrids, clearGridCache, GridOptimization } from './engine/grid.js';
import { analyzeLiquidations, getCachedLiquidations, clearLiquidationCache, LiquidationAnalysis } from './engine/liquidation.js';
import { analyzeTermStructure, getCachedTermStructures, clearTermStructureCache, TermStructureAnalysis } from './engine/termstructure.js';
import { analyzeExecution, getActiveOrders, getExecutionHistory, clearExecutionHistory, ExecutionAnalysis } from './engine/execution.js';
import { analyzeRisk, getCachedRisk, clearRiskCache, RiskAnalysis } from './engine/risk.js';
import { analyzeOrderBooks, getCachedOrderBooks, clearOrderBookCache, OrderBookAnalysis } from './engine/orderbook.js';
import { analyzeRebalance, getCachedRebalance, clearRebalanceCache, RebalanceAnalysis } from './engine/rebalance.js';
import { analyzeCrossBorderAlerts, getCachedAlerts, clearAlertCache, CrossBorderAlertSummary } from './engine/crossBorderAlert.js';
import { optimizeResume, getCachedResumeOptimization, clearResumeCache, ResumeOptimization, JobDescription } from './engine/resumeOptimizer.js';
import { analyzeNFTArbitrage, getCachedNFTSummary, clearNFTCache, NFTArbitrageSummary } from './engine/nftArbitrage.js';
import { analyzeRWA, getCachedRWA, clearRWACache, RWASummary } from './engine/rwaTracker.js';
import { getTemplateStore, getCachedStore, clearStoreCache, TemplateStore } from './engine/templateStore.js';
import { analyzeAirdropFarm, getCachedAirdropFarm, clearAirdropCache, AirdropFarmSummary } from './engine/airdropFarm.js';
import { analyzePerpDex, getCachedPerpDex, clearPerpCache, PerpDexSummary } from './engine/perpetualDex.js';
import { analyzeSecurity, getCachedSecurity, clearSecurityCache, SecurityScanSummary } from './engine/securityScanner.js';
import { analyzeSmartMoney, getCachedSmartMoney, clearSmartMoneyCache, SmartMoneySummary } from './engine/smartMoney.js';
import { analyzeMEVProtection, getCachedMEV, clearMEVCache, MEVAnalysis } from './engine/mevProtection.js';
import { analyzeBridgeMonitor, getCachedBridge, clearBridgeMonitorCache, BridgeMonitorData } from './engine/bridgeMonitor.js';
import { analyzeYieldAggregator, getCachedYield, clearYieldAggCache, YieldAggregatorData } from './engine/yieldAggregator.js';
import { analyzeNFTPredictions, getCachedNFT, clearNFTPredictorCache, NFTPredictionData } from './engine/nftPricePredictor.js';
import { analyzeOnChainAnalytics, getCachedOnChain, clearOnChainCache, OnChainAnalyticsData } from './engine/onChainAnalytics.js';
import { analyzeDaoGovernance, getCachedDao, clearDaoCache, DaoGovernanceData } from './engine/daoGovernance.js';
import { analyzeRWAYield, getCachedRWA as getCachedRWAYield, clearRWAYieldCache, RWAYieldData } from './engine/rwaYieldMonitor.js';
import { analyzePredictionArb, getCachedPredArb, clearPredArbCache, PredictionArbData } from './engine/predictionArb.js';
import { analyzeOptionGreeks, getCachedOptionGreeks, clearOptionGreeksCache, OptionGreeksData } from './engine/optionGreeks.js';
import { analyzeFundingBacktest, getCachedFundingBacktest, clearFundingBacktestCache, FundingBacktestData } from './engine/fundingBacktester.js';
import { analyzeExchangeSpreads, getCachedExchangeSpreads, clearExchangeSpreadCache, SpreadAlertData } from './engine/exchangeSpreadAlert.js';
import { analyzeGasOptimizer, getCachedGasOptimizer, clearGasOptimizerCache, GasOptimizerData } from './engine/gasOptimizer.js';
import { analyzeReputation, getCachedReputation, clearReputationCache, OnChainReputationData } from './engine/onChainReputation.js';
import { analyzeCrossChainDex, getCachedCrossChainDex, clearCrossChainDexCache, CrossChainDexData } from './engine/crossChainDex.js';
import { analyzeDerivativesLiquidity, getCachedDerivativesLiquidity, clearDerivativesLiquidityCache, DerivativesLiquidityData } from './engine/derivativesLiquidity.js';
import { analyzeContractUpgrades, getCachedContractUpgrades, clearContractUpgradeCache, ContractUpgradeData } from './engine/contractUpgrade.js';
import { analyzeStablecoinDepeg, StablecoinDepegData } from './engine/stablecoinDepeg.js';
import { analyzeDeFiPoints, DeFiPointsData } from './engine/deFiPoints.js';
import { analyzeIntentTrading, IntentTradingData } from './engine/intentTrading.js';
import { analyzeInsurance, InsuranceData } from './engine/insurance.js';
import { analyzeCryptoMacro, MacroData } from './engine/cryptoMacro.js';
import { analyzeLayerZero, LayerZeroData } from './engine/layerZeroTracker.js';
import { generateApiKey, validateApiKey, checkPermission, listApiKeys, revokeApiKey, ApiKey } from './auth/auth.js';
import { initDb, insertRates, insertOpportunity, getDbStats, getTopOpportunities, getAnomalySummary } from './store/db.js';
import * as path from 'path';
import * as url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8771;
const POLL_INTERVAL = 30000;

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(express.json());

// ==================== AUTH MIDDLEWARE ====================

function authMiddleware(requiredPerm: string = 'read') {
  return (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization || '';
    const apiKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : req.query.api_key as string;

    if (!apiKey) {
      // Allow read without auth in development
      if (process.env.NODE_ENV !== 'production' && requiredPerm === 'read') return next();
      return res.status(401).json({ error: 'API key required' });
    }

    const key = validateApiKey(apiKey);
    if (!key) return res.status(403).json({ error: 'Invalid API key or rate limited' });
    if (!checkPermission(key, requiredPerm)) return res.status(403).json({ error: 'Insufficient permissions' });

    (req as any).apiKey = key;
    next();
  };
}

// ==================== STATE ====================

interface ArbitrageOpportunity {
  symbol: string; longEx: string; shortEx: string;
  spreadPct: number; netAnnualized: number;
  longRate: number; shortRate: number;
  riskScore: number; capacity?: CapacityEstimate;
}

let latestRates: FundingRate[] = [];
let latestOpportunities: ArbitrageOpportunity[] = [];
let latestAnomalies: AnomalyEvent[] = [];
let latestPredictions: Prediction[] = [];
let latestCrossPair: CrossPairSignal[] = [];
let latestErrors: Record<string, string> = {};
let lastPollTime = 0;
let pollCount = 0;
let startTime = Date.now();
let alertConfig: AlertConfig = createDefaultConfig();

// ==================== v4.0 ENGINE STATE ====================
let latestMLPredictions: MLPrediction[] = [];
let latestPortfolio: PortfolioResult | null = null;
let latestRegime: RegimeState | null = null;
let latestCrossDomain: CrossDomainArbitrage[] = [];
let defiRatesLoaded = false;

// ==================== v5.0 ENGINE STATE ====================
let latestRouterDecisions: RouterDecision[] = [];
let equityCurveData: PnLSnapshot[] = [];
let initialEquity = 100000;
let currentEquity = 100000;

// ==================== v6.0 ENGINE STATE ====================
let latestStrategySignals: StrategySignal[] = [];
let latestFeeBreakdowns: FeeBreakdown[] = [];
let latestVolSurface: VolSurface | null = null;
let aggregatedPortfolio: AggregatedPortfolio | null = null;
let botMessageCount = 0;

// ==================== v7.0 ENGINE STATE ====================
let latestYields: YieldOpportunity[] = [];
let lastYieldFetch = 0;
let latestSentiment: SentimentSummary | null = null;
let lastSentimentFetch = 0;
let latestDexQuote: DexQuote | null = null;
let latestWhaleSummary: WhaleSummary | null = null;
let lastWhaleFetch = 0;
let latestBridgeSummary: BridgeSummary | null = null;
let lastBridgeFetch = 0;
let latestOptions: GreeksSummary[] = [];
let lastOptionsFetch = 0;
let latestGridOptimizations: GridOptimization[] = [];
let lastGridFetch = 0;
let latestLiquidation: LiquidationAnalysis | null = null;
let lastLiquidationFetch = 0;
let latestTermStructures: Map<string, TermStructureAnalysis> = new Map();
let lastTermStructureFetch = 0;
let latestExecution: ExecutionAnalysis | null = null;
let lastExecutionFetch = 0;
let latestRisk: RiskAnalysis | null = null;
let lastRiskFetch = 0;
let latestOrderBook: OrderBookAnalysis | null = null;
let lastOrderBookFetch = 0;
let latestRebalance: RebalanceAnalysis | null = null;
let lastRebalanceFetch = 0;
let latestCrossBorderAlerts: CrossBorderAlertSummary | null = null;
let lastCrossBorderFetch = 0;
let latestResumeOpt: ResumeOptimization | null = null;
let lastResumeFetch = 0;
let latestNFTSummary: NFTArbitrageSummary | null = null;
let lastNFTFetch = 0;
let latestRWA: RWASummary | null = null;
let lastRWAFetch = 0;
let latestTemplateStore: TemplateStore | null = null;
let lastTemplateStoreFetch = 0;
let latestAirdropFarm: AirdropFarmSummary | null = null;
let lastAirdropFetch = 0;
let latestPerpDex: PerpDexSummary | null = null;
let lastPerpFetch = 0;
let latestSecurity: SecurityScanSummary | null = null;
let lastSecurityFetch = 0;
let latestSmartMoney: SmartMoneySummary | null = null;
let lastSmartMoneyFetch = 0;
let latestMEV: MEVAnalysis | null = null;
let lastMEVFetch = 0;
let latestBridge: BridgeMonitorData | null = null;
let lastBridgeMonitorFetch = 0;
let latestYieldAgg: YieldAggregatorData | null = null;
let lastYieldAggFetch = 0;
let latestNFTPrediction: NFTPredictionData | null = null;
let lastNFTPredictionFetch = 0;
let latestOnChain: OnChainAnalyticsData | null = null;
let lastOnChainFetch = 0;
let latestDao: DaoGovernanceData | null = null;
let lastDaoFetch = 0;
let latestRWAYield: RWAYieldData | null = null;
let lastRWAYieldFetch = 0;
let latestPredArb: PredictionArbData | null = null;
let lastPredArbFetch = 0;
let latestOptionGreeks: OptionGreeksData | null = null;
let lastOptionGreeksFetch = 0;
let latestFundingBacktest: FundingBacktestData | null = null;
let lastFundingBacktestFetch = 0;
let latestExchangeSpreads: SpreadAlertData | null = null;
let lastExchangeSpreadsFetch = 0;
let latestGasOptimizer: GasOptimizerData | null = null;
let lastGasOptimizerFetch = 0;
let latestReputation: OnChainReputationData | null = null;
let lastReputationFetch = 0;
let latestCrossChainDex: CrossChainDexData | null = null;
let lastCrossChainDexFetch = 0;
let latestDerivativesLiq: DerivativesLiquidityData | null = null;
let lastDerivativesLiqFetch = 0;
let latestContractUpgrades: ContractUpgradeData | null = null;
let lastContractUpgradeFetch = 0;

// ==================== v10.0-v10.5 ENGINE STATE ====================
let latestStablecoinDepeg: StablecoinDepegData | null = null;
let lastStablecoinDepegFetch = 0;
let latestDeFiPoints: DeFiPointsData | null = null;
let lastDeFiPointsFetch = 0;
let latestIntentTrading: IntentTradingData | null = null;
let lastIntentTradingFetch = 0;
let latestInsurance: InsuranceData | null = null;
let lastInsuranceFetch = 0;
let latestMacro: MacroData | null = null;
let lastMacroFetch = 0;
let latestLayerZero: LayerZeroData | null = null;
let lastLayerZeroFetch = 0;

// ==================== POLLING ====================

async function poll() {
  pollCount++;
  const t0 = Date.now();

  try {
    const { rates, errors } = await fetchAllRates();
    latestRates = rates;
    latestErrors = errors;
    lastPollTime = Date.now();

    insertRates(rates.map(r => ({
      exchange: r.exchange, symbol: r.symbol, fundingRate: r.fundingRate,
      markPrice: r.markPrice, openInterest: r.openInterest,
      volume24h: r.volume24h, nextFundingTs: r.nextFundingTime,
      fetchedAt: r.fetchedAt,
    })));

    latestAnomalies = detectAnomalies(rates);
    latestCrossPair = detectCrossPair(rates);
    latestOpportunities = findOpportunities(rates);

    const topSymbols = [...new Set(latestOpportunities.slice(0, 5).map(o => o.symbol))].slice(0, 3);
    const orderBooks = new Map<string, OrderBook>();
    for (const sym of topSymbols) {
      const [bb, bob] = await Promise.allSettled([
        fetchBinanceOrderBook(sym),
        fetchBybitOrderBook(sym),
      ]);
      if (bb.status === 'fulfilled') orderBooks.set(`Binance:${sym}`, bb.value);
      if (bob.status === 'fulfilled') orderBooks.set(`Bybit:${sym}`, bob.value);
    }

    latestPredictions = predictRates(rates, orderBooks).filter(p => p.confidence >= 45).slice(0, 20);

    // v4.0: ML ensemble prediction
    latestMLPredictions = predictML(rates, orderBooks).filter(p => p.confidence >= 40).slice(0, 15);

    // v4.0: Regime detection
    const regimeInput = latestOpportunities.slice(0, 30).map(o => ({
      spread: o.spreadPct / 100,
      volatility: 0.0003 + Math.random() * 0.0002,
      fundingRate: o.longRate,
    }));
    if (regimeInput.length >= 3) {
      latestRegime = detectRegime(regimeInput);
    }

    // v4.0: Portfolio optimization
    if (latestOpportunities.length >= 2) {
      const portfolioInput = latestOpportunities.slice(0, 10).map(o => ({
        symbol: o.symbol,
        longExchange: o.longEx,
        shortExchange: o.shortEx,
        spreadPct: o.spreadPct / 100,
        netAnnualized: o.netAnnualized / 100,
        volatility: 0.0003 + Math.random() * 0.0002,
        winRate: 0.55 + Math.random() * 0.1,
        sharpe: o.netAnnualized / 10,
      }));
      latestPortfolio = optimizePortfolio(portfolioInput, 100000);
      if (latestRegime) {
        // Apply regime risk multiplier
        for (const pos of latestPortfolio.positions) {
          pos.recommendedSize = Math.round(pos.recommendedSize * latestRegime.riskMultiplier);
          pos.kellyFraction = +(pos.kellyFraction * latestRegime.riskMultiplier).toFixed(3);
        }
        latestPortfolio.totalAllocation = latestPortfolio.positions.reduce((s, p) => s + p.recommendedSize, 0);
      }
    }

    for (const opp of latestOpportunities.slice(0, 5)) {
      opp.capacity = estimateCapacity(opp.symbol, opp.longEx, opp.shortEx, opp.spreadPct,
        orderBooks.get(`${opp.longEx}:${opp.symbol}`), orderBooks.get(`${opp.shortEx}:${opp.symbol}`));
      insertOpportunity({
        symbol: opp.symbol, longEx: opp.longEx, shortEx: opp.shortEx,
        spreadPct: opp.spreadPct, netAnnualized: opp.netAnnualized,
        riskScore: opp.riskScore, capacityUsd: opp.capacity?.maxCapacityUsd,
        detectedAt: Date.now(),
      });
    }

    const rateMap = new Map<string, { fundingRate: number; markPrice: number }>();
    for (const r of rates) rateMap.set(`${r.exchange}:${r.symbol}`, { fundingRate: r.fundingRate, markPrice: r.markPrice || 0 });
    updatePositions(rateMap);

    // Send alerts
    for (const anom of latestAnomalies.slice(0, 3)) {
      sendAlert(alertConfig, {
        type: 'ANOMALY', symbol: anom.symbol, severity: anom.severity,
        title: `${anom.type} - ${anom.symbol}`, message: anom.description,
      });
    }
    for (const opp of latestOpportunities.slice(0, 2)) {
      if (opp.spreadPct > 0.05) {
        sendAlert(alertConfig, {
          type: 'OPPORTUNITY', symbol: opp.symbol,
          severity: Math.min(100, Math.round(opp.spreadPct * 1000)),
          title: `Arb ${opp.symbol} ${opp.netAnnualized}%`,
          message: `Spread ${opp.spreadPct}% | Long ${opp.longEx} / Short ${opp.shortEx}`,
        });
      }
    }

    // v4.0: Cross-domain arbitrage (DeFi vs CeFi)
    if (defiRatesLoaded) {
      latestCrossDomain = findCrossDomainArbitrage(
        latestRates.slice(0, 50).map(r => ({ symbol: r.symbol, fundingRate: r.fundingRate, exchange: r.exchange }))
      ).slice(0, 5);
    }

    // v5.0: Smart Order Router - fuse all signals into execution decisions
    const capMap = new Map<string, CapacityEstimate>();
    for (const opp of latestOpportunities.slice(0, 10)) {
      if (opp.capacity) {
        capMap.set(`${opp.longEx}:${opp.symbol}`, opp.capacity);
        capMap.set(`${opp.shortEx}:${opp.symbol}`, opp.capacity);
      }
    }
    const paperStats = getTradeStats();
    latestRouterDecisions = routeOrder(
      latestMLPredictions, latestPortfolio, latestRegime, capMap, paperStats.totalPnlPct
    );

    // v5.0: P&L tracking
    const totalPnl = paperStats.totalPnlPct / 100 * currentEquity;
    equityCurveData.push({
      timestamp: Date.now(),
      totalEquity: currentEquity + totalPnl,
      totalReturn: paperStats.totalPnlPct,
      unrealizedPnl: 0,
      realizedPnl: totalPnl,
      fundingEarned: 0,
      tradingPnl: totalPnl,
      fees: 0,
      drawdown: paperStats.maxDrawdown,
    });
    if (equityCurveData.length > 2000) equityCurveData.shift();
    currentEquity = initialEquity + totalPnl;

    // v6.0: Sample rates for volatility surface
    if (pollCount % 6 === 0) { // every ~2 min
      for (const r of latestRates.slice(0, 30)) {
        addRateSample(r.exchange, r.symbol, r.fundingRate, r.volume24h);
      }
    }

    // v6.0: Strategy evaluation
    if (latestOpportunities.length > 0) {
      const stratData = latestOpportunities.slice(0, 20).map(o => ({
        symbol: o.symbol,
        longEx: o.longEx,
        shortEx: o.shortEx,
        spreadPct: o.spreadPct / 100,
        netAnnualized: o.netAnnualized / 100,
        volatility: 0.0003,
        mlConfidence: 60,
        regime: latestRegime?.current || 'TRANSITION',
        momentumBps: Math.random() * 2,
        holdHours: 0,
        pnlPct: 0,
        drawdownPct: 0,
      }));
      latestStrategySignals = evaluateStrategies(stratData).slice(0, 10);
    }

    // v6.0: Fee analysis for top opportunities
    if (latestOpportunities.length > 0) {
      latestFeeBreakdowns = latestOpportunities.slice(0, 5).map(opp =>
        calculateFees({
          symbol: opp.symbol,
          longExchange: opp.longEx,
          shortExchange: opp.shortEx,
          spreadPct: opp.spreadPct / 100,
          size: 100000,
          fundingRate: opp.netAnnualized / 100,
        })
      );
    }

    // v6.0: Volatility surface for BTC every 5 min
    if (pollCount % 30 === 0) {
      latestVolSurface = calculateVolSurface('BTCUSDT', 'Binance');
    }

    // v6.0: Multi-account aggregation
    aggregatedPortfolio = getAggregatedPortfolio();

    // v7.0: Yield farm aggregation (every 5 minutes)
    if (pollCount % 10 === 0 || latestYields.length === 0) {
      try {
        const cexRates = latestOpportunities.slice(0, 10).map(o => ({
          symbol: o.symbol,
          rate: o.netAnnualized / 100 / 1095, // convert annual to per-8h
          exchange: o.longEx,
        }));
        latestYields = await aggregateYields(cexRates);
        lastYieldFetch = Date.now();
      } catch (e) {
        // Yield fetch failed, keep cached data
      }
    }

    // v7.0: Sentiment analysis (every 3 minutes)
    if (pollCount % 6 === 0 || !latestSentiment) {
      try {
        latestSentiment = await analyzeSentiment();
        lastSentimentFetch = Date.now();
      } catch (e) {
        // Sentiment fetch failed, keep cached data
      }
    }

    // v7.1: Whale tracking (every 4 minutes)
    if (pollCount % 8 === 0 || !latestWhaleSummary) {
      try {
        latestWhaleSummary = await analyzeWhaleActivity(['BTC', 'ETH', 'SOL']);
        lastWhaleFetch = Date.now();
      } catch (e) {
        // Whale fetch failed, keep cached data
      }
    }

    // v7.1: Cross-bridge monitoring (every 5 minutes)
    if (pollCount % 10 === 0 || !latestBridgeSummary) {
      try {
        // Get funding rates organized by chain for cross-chain arb
        const chainRates = latestOpportunities.slice(0, 20).map(o => ({
          chain: o.longEx === 'Binance' ? 'Ethereum' : o.longEx === 'Bybit' ? 'Arbitrum' : 'Optimism',
          symbol: o.symbol,
          rate: o.netAnnualized / 100 / 1095,
        }));
        latestBridgeSummary = await analyzeBridges(chainRates);
        lastBridgeFetch = Date.now();
      } catch (e) {
        // Bridge fetch failed, keep cached data
      }
    }

    // v7.1: Options Greeks analysis (every 5 minutes)
    if (pollCount % 10 === 0 || latestOptions.length === 0) {
      try {
        const fundingRates = latestOpportunities.slice(0, 5).map(o => ({
          symbol: o.symbol,
          rate: o.netAnnualized / 100 / 1095,
        }));
        latestOptions = await analyzeOptions(['BTC', 'ETH'], fundingRates);
        lastOptionsFetch = Date.now();
      } catch (e) {
        // Options analysis failed
      }
    }

    // v7.1: Grid optimization (every 10 minutes)
    if (pollCount % 20 === 0 || latestGridOptimizations.length === 0) {
      try {
        const symbols = ['BTCUSDT', 'ETHUSDT'];
        const optimizations: GridOptimization[] = [];
        for (const sym of symbols) {
          const rate = latestRates.find(r => r.symbol === sym);
          if (rate) {
            const opt = await optimizeGrid(
              sym.replace('USDT', ''),
              rate.markPrice || 65000,
              10000,
              latestRegime?.current || 'SIDEWAYS'
            );
            optimizations.push(opt);
          }
        }
        latestGridOptimizations = optimizations;
        lastGridFetch = Date.now();
      } catch (e) {
        // Grid optimization failed
      }
    }

    // v7.2: Liquidation cascade prediction (every 5 minutes)
    if (pollCount % 10 === 0 || !latestLiquidation) {
      try {
        const btcRate = latestRates.find(r => r.symbol === 'BTCUSDT');
        const ethRate = latestRates.find(r => r.symbol === 'ETHUSDT');
        if (btcRate) {
          latestLiquidation = await analyzeLiquidations(
            'BTC',
            btcRate.markPrice || 65000,
            btcRate.openInterest || 15e9,
            0.03
          );
          lastLiquidationFetch = Date.now();
        }
      } catch (e) {
        // Liquidation analysis failed
      }
    }

    // v7.3: Term structure analysis (every 15 minutes)
    if (pollCount % 30 === 0 || latestTermStructures.size === 0) {
      try {
        const btcRate = latestRates.find(r => r.symbol === 'BTCUSDT');
        if (btcRate) {
          const ts = await analyzeTermStructure(
            'BTC',
            btcRate.markPrice || 65000,
            btcRate.fundingRate || 0.01,
            btcRate.exchange || 'Binance'
          );
          latestTermStructures.set('BTC_Binance', ts);
          lastTermStructureFetch = Date.now();
        }
      } catch (e) {
        // Term structure analysis failed
      }
    }

    // v7.4: Execution analysis (every 10 minutes)
    if (pollCount % 20 === 0 || !latestExecution) {
      try {
        const btcRate = latestRates.find(r => r.symbol === 'BTCUSDT');
        if (btcRate) {
          latestExecution = await analyzeExecution(
            'BTC',
            'BUY',
            0.5,
            'TWAP',
            btcRate.markPrice || 65000,
            btcRate.volume24h || 1e9,
            0.03,
            0.02
          );
          lastExecutionFetch = Date.now();
        }
      } catch (e) {
        // Execution analysis failed
      }
    }

    // v7.5: Risk analysis (every 5 minutes)
    if (pollCount % 10 === 0 || !latestRisk) {
      try {
        latestRisk = await analyzeRisk();
        lastRiskFetch = Date.now();
      } catch (e) {
        // Risk analysis failed
      }
    }

    // v7.6: Order book analysis (every 2 minutes)
    if (pollCount % 4 === 0 || !latestOrderBook) {
      try {
        const btcRate = latestRates.find(r => r.symbol === 'BTCUSDT');
        if (btcRate) {
          latestOrderBook = await analyzeOrderBooks('BTCUSDT', btcRate.markPrice || 65000);
          lastOrderBookFetch = Date.now();
        }
      } catch (e) {
        // Order book analysis failed
      }
    }

    // v7.7: Rebalance analysis (every 30 minutes)
    if (pollCount % 60 === 0 || !latestRebalance) {
      try {
        latestRebalance = await analyzeRebalance(currentEquity || 100000);
        lastRebalanceFetch = Date.now();
      } catch (e) {
        // Rebalance analysis failed
      }
    }

    // v8.0: Cross-border e-commerce alerts (every 15 minutes)
    if (pollCount % 30 === 0 || !latestCrossBorderAlerts) {
      try {
        latestCrossBorderAlerts = await analyzeCrossBorderAlerts();
        lastCrossBorderFetch = Date.now();
      } catch (e) {
        // Cross-border alert analysis failed
      }
    }

    // v8.2: NFT arbitrage monitoring (every 5 minutes)
    if (pollCount % 10 === 0 || !latestNFTSummary) {
      try {
        latestNFTSummary = await analyzeNFTArbitrage();
        lastNFTFetch = Date.now();
      } catch (e) {
        // NFT analysis failed
      }
    }

    // v8.3: RWA tracking (every 15 minutes)
    if (pollCount % 30 === 0 || !latestRWA) {
      try {
        latestRWA = await analyzeRWA();
        lastRWAFetch = Date.now();
      } catch (e) {
        // RWA analysis failed
      }
    }

    // v8.4: Template store (every 30 minutes)
    if (pollCount % 60 === 0 || !latestTemplateStore) {
      try {
        latestTemplateStore = await getTemplateStore();
        lastTemplateStoreFetch = Date.now();
      } catch (e) {
        // Template store fetch failed
      }
    }

    // v9.0: Airdrop farming (every 15 minutes)
    if (pollCount % 30 === 0 || !latestAirdropFarm) {
      try {
        latestAirdropFarm = await analyzeAirdropFarm();
        lastAirdropFetch = Date.now();
      } catch (e) {
        // Airdrop analysis failed
      }
    }

    // v9.1: Perpetual DEX (every 5 minutes)
    if (pollCount % 10 === 0 || !latestPerpDex) {
      try {
        latestPerpDex = await analyzePerpDex();
        lastPerpFetch = Date.now();
      } catch (e) {
        // Perp DEX analysis failed
      }
    }

    // v9.2: Security scanning (every 30 minutes)
    if (pollCount % 60 === 0 || !latestSecurity) {
      try {
        latestSecurity = await analyzeSecurity();
        lastSecurityFetch = Date.now();
      } catch (e) {
        // Security scan failed
      }
    }

    // v9.3: Smart money tracking (every 10 minutes)
    if (pollCount % 20 === 0 || !latestSmartMoney) {
      try {
        latestSmartMoney = await analyzeSmartMoney();
        lastSmartMoneyFetch = Date.now();
      } catch (e) {
        // Smart money analysis failed
      }
    }

    // v9.4: MEV protection analysis (every 5 minutes)
    if (pollCount % 10 === 0 || !latestMEV) {
      try {
        latestMEV = await analyzeMEVProtection();
        lastMEVFetch = Date.now();
      } catch (e) {
        // MEV analysis failed
      }
    }

    // v9.5: Bridge monitoring (every 15 minutes)
    if (pollCount % 30 === 0 || !latestBridge) {
      try {
        latestBridge = await analyzeBridgeMonitor();
        lastBridgeMonitorFetch = Date.now();
      } catch (e) {
        // Bridge monitoring failed
      }
    }

    // v9.6: Yield aggregation (every 20 minutes)
    if (pollCount % 40 === 0 || !latestYieldAgg) {
      try {
        latestYieldAgg = await analyzeYieldAggregator();
        lastYieldAggFetch = Date.now();
      } catch (e) {
        // Yield aggregation failed
      }
    }

    // v9.7: NFT price prediction (every 10 minutes)
    if (pollCount % 20 === 0 || !latestNFTPrediction) {
      try {
        latestNFTPrediction = await analyzeNFTPredictions();
        lastNFTPredictionFetch = Date.now();
      } catch (e) {
        // NFT prediction failed
      }
    }

    // v9.8: On-chain analytics (every 10 minutes)
    if (pollCount % 20 === 0 || !latestOnChain) {
      try {
        latestOnChain = await analyzeOnChainAnalytics();
        lastOnChainFetch = Date.now();
      } catch (e) {
        // On-chain analytics failed
      }
    }

    // v9.9: DAO governance (every 20 minutes)
    if (pollCount % 40 === 0 || !latestDao) {
      try {
        latestDao = await analyzeDaoGovernance();
        lastDaoFetch = Date.now();
      } catch (e) {
        // DAO governance failed
      }
    }

    // v9.10: RWA yield monitoring (every 30 minutes)
    if (pollCount % 60 === 0 || !latestRWAYield) {
      try {
        latestRWAYield = await analyzeRWAYield();
        lastRWAYieldFetch = Date.now();
      } catch (e) {
        // RWA yield monitoring failed
      }
    }

    // v9.11: Prediction market arbitrage (every 10 minutes)
    if (pollCount % 20 === 0 || !latestPredArb) {
      try {
        latestPredArb = await analyzePredictionArb();
        lastPredArbFetch = Date.now();
      } catch (e) {
        // Prediction arb failed
      }
    }

    // v9.12: Option Greeks monitoring (every 5 minutes)
    if (pollCount % 10 === 0 || !latestOptionGreeks) {
      try {
        latestOptionGreeks = await analyzeOptionGreeks();
        lastOptionGreeksFetch = Date.now();
      } catch (e) {
        // Option Greeks failed
      }
    }

    // v9.13: Funding rate backtest (every 30 minutes)
    if (pollCount % 60 === 0 || !latestFundingBacktest) {
      try {
        latestFundingBacktest = await analyzeFundingBacktest();
        lastFundingBacktestFetch = Date.now();
      } catch (e) {
        // Funding backtest failed
      }
    }

    // v9.14: Exchange spread alerts (every 5 minutes)
    if (pollCount % 10 === 0 || !latestExchangeSpreads) {
      try {
        latestExchangeSpreads = await analyzeExchangeSpreads();
        lastExchangeSpreadsFetch = Date.now();
      } catch (e) {
        // Exchange spreads failed
      }
    }

    // v9.15: Gas optimizer (every 5 minutes)
    if (pollCount % 10 === 0 || !latestGasOptimizer) {
      try {
        latestGasOptimizer = await analyzeGasOptimizer();
        lastGasOptimizerFetch = Date.now();
      } catch (e) {
        // Gas optimizer failed
      }
    }

    // v9.16: On-chain reputation (every 30 minutes)
    if (pollCount % 60 === 0 || !latestReputation) {
      try {
        latestReputation = await analyzeReputation();
        lastReputationFetch = Date.now();
      } catch (e) {
        // Reputation failed
      }
    }

    // v9.17: Cross-chain DEX aggregator (every 10 minutes)
    if (pollCount % 20 === 0 || !latestCrossChainDex) {
      try {
        latestCrossChainDex = await analyzeCrossChainDex();
        lastCrossChainDexFetch = Date.now();
      } catch (e) {
        // Cross-chain DEX failed
      }
    }

    // v9.18: Derivatives liquidity (every 5 minutes)
    if (pollCount % 10 === 0 || !latestDerivativesLiq) {
      try {
        latestDerivativesLiq = await analyzeDerivativesLiquidity();
        lastDerivativesLiqFetch = Date.now();
      } catch (e) {
        // Derivatives liquidity failed
      }
    }

    // v9.19: Contract upgrade tracking (every 20 minutes)
    if (pollCount % 40 === 0 || !latestContractUpgrades) {
      try {
        latestContractUpgrades = await analyzeContractUpgrades();
        lastContractUpgradeFetch = Date.now();
      } catch (e) {
        // Contract upgrades failed
      }
    }

    // v10.0: Stablecoin depeg monitoring (every 5 minutes)
    if (pollCount % 10 === 0 || !latestStablecoinDepeg) {
      try {
        latestStablecoinDepeg = await analyzeStablecoinDepeg();
        lastStablecoinDepegFetch = Date.now();
      } catch (e) {
        // Stablecoin depeg analysis failed
      }
    }

    // v10.1: DeFi points aggregation (every 20 minutes)
    if (pollCount % 40 === 0 || !latestDeFiPoints) {
      try {
        latestDeFiPoints = await analyzeDeFiPoints();
        lastDeFiPointsFetch = Date.now();
      } catch (e) {
        // DeFi points analysis failed
      }
    }

    // v10.2: Intent trading analytics (every 10 minutes)
    if (pollCount % 20 === 0 || !latestIntentTrading) {
      try {
        latestIntentTrading = await analyzeIntentTrading();
        lastIntentTradingFetch = Date.now();
      } catch (e) {
        // Intent trading analysis failed
      }
    }

    // v10.3: DeFi insurance monitoring (every 30 minutes)
    if (pollCount % 60 === 0 || !latestInsurance) {
      try {
        latestInsurance = await analyzeInsurance();
        lastInsuranceFetch = Date.now();
      } catch (e) {
        // Insurance monitoring failed
      }
    }

    // v10.4: Crypto macro dashboard (every 10 minutes)
    if (pollCount % 20 === 0 || !latestMacro) {
      try {
        latestMacro = await analyzeCryptoMacro();
        lastMacroFetch = Date.now();
      } catch (e) {
        // Macro analysis failed
      }
    }

    // v10.5: LayerZero omnichain tracker (every 10 minutes)
    if (pollCount % 20 === 0 || !latestLayerZero) {
      try {
        latestLayerZero = await analyzeLayerZero();
        lastLayerZeroFetch = Date.now();
      } catch (e) {
        // LayerZero tracking failed
      }
    }

    const elapsed = Date.now() - t0;
    const tradeActions = latestRouterDecisions.filter(d => d.action !== 'SKIP' && d.action !== 'WAIT').length;
    const strategyHits = latestStrategySignals.length;
    const whaleHits = latestWhaleSummary?.alerts?.length || 0;
    console.log(`[#${pollCount}] ${new Date().toLocaleTimeString('zh-CN')} | ${rates.length}rates | ${[...new Set(rates.map(r => r.exchange))].length}ex | ${latestOpportunities.length}opps | ML:${latestMLPredictions.length} Regime:${latestRegime?.current || '?'} Strat:${strategyHits} Whale:${whaleHits} | ${elapsed}ms`);

    broadcast();
  } catch (err: any) {
    console.error(`Poll error: ${err.message}`);
  }
}

function findOpportunities(rates: FundingRate[]): ArbitrageOpportunity[] {
  const bySymbol = new Map<string, FundingRate[]>();
  for (const r of rates) {
    if (!bySymbol.has(r.symbol)) bySymbol.set(r.symbol, []);
    bySymbol.get(r.symbol)!.push(r);
  }

  const opps: ArbitrageOpportunity[] = [];
  const PERIODS = 365 * 3;
  const FEE = 0.08;

  for (const [symbol, items] of bySymbol) {
    if (items.length < 2) continue;
    let bestSpread = 0;
    let bestLong: FundingRate | null = null;
    let bestShort: FundingRate | null = null;

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const spread = items[i].fundingRate - items[j].fundingRate;
        if (spread > bestSpread) { bestSpread = spread; bestLong = items[i]; bestShort = items[j]; }
      }
    }
    if (!bestLong || !bestShort) continue;
    const spreadPct = bestSpread * 100;
    const netAnnualized = spreadPct * PERIODS - FEE * PERIODS;
    if (spreadPct > 0.005 && netAnnualized > 0) {
      let risk = 50;
      if (spreadPct > 0.05) risk -= 20;
      if (bestLong.openInterest > 1e8 && bestShort.openInterest > 1e8) risk -= 10;
      if (Math.abs(bestLong.fundingRate) > 0.005) risk += 15;
      opps.push({
        symbol, longEx: bestLong.exchange, shortEx: bestShort.exchange,
        spreadPct: +spreadPct.toFixed(4), netAnnualized: +netAnnualized.toFixed(2),
        longRate: bestLong.fundingRate, shortRate: bestShort.fundingRate,
        riskScore: Math.max(0, Math.min(100, risk)),
      });
    }
  }
  return opps.sort((a, b) => b.netAnnualized - a.netAnnualized);
}

// ==================== WEBSOCKET ====================

const clients = new Set<WebSocket>();
function broadcast() {
  const tradeDecisions = latestRouterDecisions.filter(d => d.action !== 'SKIP' && d.action !== 'WAIT');
  const msg = JSON.stringify({
    type: 'snapshot', timestamp: Date.now(),
    data: {
      rates: latestRates.slice(0, 50),
      opportunities: latestOpportunities.slice(0, 25),
      anomalies: latestAnomalies.slice(0, 10),
      predictions: latestPredictions.slice(0, 15),
      crossPair: latestCrossPair.slice(0, 10),
      paperStats: getTradeStats(),
      mlPredictions: latestMLPredictions.slice(0, 10),
      regime: latestRegime,
      portfolio: latestPortfolio,
      crossDomain: latestCrossDomain.slice(0, 5),
      routerDecisions: tradeDecisions.slice(0, 5),
      equity: equityCurveData.slice(-50),
      health: getUsageSummary(),
      strategySignals: latestStrategySignals.slice(0, 5),
      feeBreakdown: latestFeeBreakdowns.slice(0, 3),
      volSurfacePoints: latestVolSurface?.points?.slice(0, 6) || [],
      yields: latestYields.slice(0, 12),
      sentiment: latestSentiment,
      dexQuote: latestDexQuote,
      whale: latestWhaleSummary,
      bridge: latestBridgeSummary,
      options: latestOptions,
      grid: latestGridOptimizations,
      liquidation: latestLiquidation,
      termStructure: Array.from(latestTermStructures.values()),
      execution: latestExecution,
      risk: latestRisk,
      orderBook: latestOrderBook,
      rebalance: latestRebalance,
      crossBorderAlerts: latestCrossBorderAlerts,
      nftArbitrage: latestNFTSummary,
      rwa: latestRWA,
      templateStore: latestTemplateStore,
      airdropFarm: latestAirdropFarm,
      perpDex: latestPerpDex,
      security: latestSecurity,
      smartMoney: latestSmartMoney,
      mevProtection: latestMEV,
      bridgeMonitor: latestBridge,
      yieldAggregator: latestYieldAgg,
      nftPrediction: latestNFTPrediction,
      onChain: latestOnChain,
      daoGovernance: latestDao,
      rwaYield: latestRWAYield,
      predArb: latestPredArb,
      optionGreeks: latestOptionGreeks,
      fundingBacktest: latestFundingBacktest,
      exchangeSpreads: latestExchangeSpreads,
      gasOptimizer: latestGasOptimizer,
      reputation: latestReputation,
      crossChainDex: latestCrossChainDex,
      derivativesLiq: latestDerivativesLiq,
      contractUpgrades: latestContractUpgrades,
      stablecoinDepeg: latestStablecoinDepeg,
      deFiPoints: latestDeFiPoints,
      intentTrading: latestIntentTrading,
      insurance: latestInsurance,
      macro: latestMacro,
      layerZero: latestLayerZero,
      stats: {
        totalRates: latestRates.length,
        exchanges: [...new Set(latestRates.map(r => r.exchange))],
        oppCount: latestOpportunities.length,
        anomalyCount: latestAnomalies.length,
        predictions: latestPredictions.length,
        crossPair: latestCrossPair.length,
        mlPredictions: latestMLPredictions.length,
        regime: latestRegime?.current || 'N/A',
        portfolioPositions: latestPortfolio?.positions.length || 0,
        crossDomain: latestCrossDomain.length,
        routerDecisions: tradeDecisions.length,
        currentEquity,
        strategySignals: latestStrategySignals.length,
        feeAnalyses: latestFeeBreakdowns.length,
        volSurfacePoints: latestVolSurface?.points?.length || 0,
        errors: latestErrors,
      },
    },
  });
  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  }
}

wss.on('connection', (ws) => {
  clients.add(ws);
  if (latestRates.length > 0) {
    const tradeDecisions = latestRouterDecisions.filter(d => d.action !== 'SKIP' && d.action !== 'WAIT');
    ws.send(JSON.stringify({
      type: 'snapshot', timestamp: Date.now(),
      data: {
        rates: latestRates.slice(0, 50),
        opportunities: latestOpportunities.slice(0, 25),
        anomalies: latestAnomalies.slice(0, 10),
        predictions: latestPredictions.slice(0, 15),
        crossPair: latestCrossPair.slice(0, 10),
        paperStats: getTradeStats(),
        mlPredictions: latestMLPredictions.slice(0, 10),
        regime: latestRegime,
        portfolio: latestPortfolio,
        crossDomain: latestCrossDomain.slice(0, 5),
        routerDecisions: tradeDecisions.slice(0, 5),
        equity: equityCurveData.slice(-50),
        health: getUsageSummary(),
        yields: latestYields.slice(0, 12),
        sentiment: latestSentiment,
        dexQuote: latestDexQuote,
        whale: latestWhaleSummary,
        bridge: latestBridgeSummary,
        options: latestOptions,
        grid: latestGridOptimizations,
        liquidation: latestLiquidation,
        termStructure: Array.from(latestTermStructures.values()),
        execution: latestExecution,
        risk: latestRisk,
        orderBook: latestOrderBook,
        rebalance: latestRebalance,
        crossBorderAlerts: latestCrossBorderAlerts,
        nftArbitrage: latestNFTSummary,
        rwa: latestRWA,
        templateStore: latestTemplateStore,
        airdropFarm: latestAirdropFarm,
        perpDex: latestPerpDex,
        security: latestSecurity,
        smartMoney: latestSmartMoney,
        stats: {
          totalRates: latestRates.length,
          exchanges: [...new Set(latestRates.map(r => r.exchange))],
          oppCount: latestOpportunities.length,
          anomalyCount: latestAnomalies.length,
          predictions: latestPredictions.length,
          crossPair: latestCrossPair.length,
          mlPredictions: latestMLPredictions.length,
          regime: latestRegime?.current || 'N/A',
          portfolioPositions: latestPortfolio?.positions.length || 0,
          crossDomain: latestCrossDomain.length,
          routerDecisions: tradeDecisions.length,
          currentEquity,
          errors: latestErrors,
        },
      },
    }));
  }
  ws.on('close', () => clients.delete(ws));
});

// ==================== REST API ====================

app.get('/api/rates', authMiddleware('read'), (req, res) => {
  let filtered = latestRates;
  if (req.query.exchange) filtered = filtered.filter(r => r.exchange === req.query.exchange);
  if (req.query.symbol) filtered = filtered.filter(r => r.symbol === req.query.symbol);
  res.json({ count: filtered.length, rates: filtered.slice(0, 300) });
});

app.get('/api/opportunities', authMiddleware('read'), (req, res) => {
  const minNet = parseFloat(req.query.minNet as string) || 0;
  res.json({ count: latestOpportunities.filter(o => o.netAnnualized >= minNet).length, opportunities: latestOpportunities.filter(o => o.netAnnualized >= minNet) });
});

app.get('/api/anomalies', authMiddleware('read'), (_req, res) => {
  res.json({ count: latestAnomalies.length, anomalies: latestAnomalies });
});

app.get('/api/predictions', authMiddleware('read'), (_req, res) => {
  res.json({ count: latestPredictions.length, predictions: latestPredictions });
});

app.get('/api/crosspair', authMiddleware('read'), (_req, res) => {
  res.json({ count: latestCrossPair.length, signals: latestCrossPair });
});

// ---- v4.0: ML Predictions API ----

app.get('/api/v4/ml/predictions', authMiddleware('read'), (_req, res) => {
  res.json({ count: latestMLPredictions.length, predictions: latestMLPredictions });
});

app.get('/api/v4/ml/model', authMiddleware('read'), (_req, res) => {
  res.json(getModelState());
});

app.get('/api/v4/ml/accuracy', authMiddleware('read'), (_req, res) => {
  res.json(getPredictionAccuracy());
});

app.get('/api/v4/ml/history/:symbol', authMiddleware('read'), (req, res) => {
  const exchange = req.query.exchange as string || 'Binance';
  res.json({ predictions: getPredictionHistory(req.params.symbol, exchange) });
});

// ---- v4.0: Portfolio Optimization API ----

app.get('/api/v4/portfolio', authMiddleware('read'), (_req, res) => {
  res.json(latestPortfolio || { positions: [], message: 'No data yet' });
});

app.post('/api/v4/portfolio/optimize', authMiddleware('read'), (req, res) => {
  const { opportunities, capital } = req.body;
  const result = optimizePortfolio(opportunities || [], capital || 100000);
  res.json(result);
});

app.get('/api/v4/portfolio/correlation', authMiddleware('read'), (_req, res) => {
  res.json(getCorrelationMatrix());
});

app.get('/api/v4/portfolio/risk', authMiddleware('read'), (_req, res) => {
  res.json({ decomposition: getRiskDecomposition() });
});

// ---- v4.0: Regime Detection API ----

app.get('/api/v4/regime', authMiddleware('read'), (_req, res) => {
  res.json(latestRegime || { current: 'TRANSITION', message: 'No data yet' });
});

app.get('/api/v4/regime/stats', authMiddleware('read'), (_req, res) => {
  res.json(getRegimeStats());
});

// ---- v4.0: Cross-Domain Arbitrage (DeFi vs CeFi) API ----

app.get('/api/v4/defi/rates', authMiddleware('read'), (_req, res) => {
  res.json({ rates: cachedDeFiRates, summary: getDeFiSummary() });
});

app.get('/api/v4/defi/arbitrage', authMiddleware('read'), (_req, res) => {
  res.json({ count: latestCrossDomain.length, opportunities: latestCrossDomain });
});

app.post('/api/v4/defi/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    await fetchDeFiRates();
    defiRatesLoaded = true;
    res.json({ success: true, count: cachedDeFiRates.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stats', authMiddleware('read'), (_req, res) => {
  const dbStats = getDbStats();
  const uptime = Date.now() - startTime;
  const tradeDecisions = latestRouterDecisions.filter(d => d.action !== 'SKIP' && d.action !== 'WAIT');
  res.json({
    status: 'ok',
    version: '5.0',
    uptime: `${Math.floor(uptime / 3600000)}h ${Math.floor((uptime % 3600000) / 60000)}m`,
    pollCount,
    totalRates: latestRates.length,
    exchanges: [...new Set(latestRates.map(r => r.exchange))],
    opportunities: latestOpportunities.length,
    anomalies: latestAnomalies.length,
    crossPair: latestCrossPair.length,
    mlPredictions: latestMLPredictions.length,
    regime: latestRegime?.current || 'N/A',
    portfolioPositions: latestPortfolio?.positions.length || 0,
    crossDomain: latestCrossDomain.length,
    routerDecisions: tradeDecisions.length,
    currentEquity,
    health: getUsageSummary(),
    wsClients: clients.size,
    lastPoll: lastPollTime ? new Date(lastPollTime).toISOString() : null,
    db: dbStats,
    errors: latestErrors,
  });
});

app.get('/api/paper/stats', authMiddleware('read'), (_req, res) => {
  res.json(getTradeStats());
});

app.post('/api/paper/open', (req, res) => {
  const { symbol, longEx, shortEx, spreadPct, notional } = req.body;
  if (!symbol || !longEx || !shortEx) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const pos = openPosition({ symbol, longEx, shortEx, spreadPct: spreadPct || 0.01, notional });
  updateTradeState(symbol, 'OPEN', { size: notional || 10000, longEx, shortEx });
  res.json({ success: true, position: pos });
});

// ---- v5.0: Smart Order Router API ----

app.get('/api/v5/router/decisions', authMiddleware('read'), (_req, res) => {
  res.json({ count: latestRouterDecisions.length, decisions: latestRouterDecisions });
});

app.get('/api/v5/router/state', authMiddleware('read'), (_req, res) => {
  res.json(getRouterState());
});

app.get('/api/v5/router/config', authMiddleware('read'), (_req, res) => {
  res.json(getRouterConfig());
});

app.post('/api/v5/router/config', authMiddleware('write'), (req, res) => {
  const updated = updateRouterConfig(req.body);
  res.json({ success: true, config: updated });
});

// ---- v5.0: P&L Attribution API ----

app.get('/api/v5/attribution', authMiddleware('read'), (_req, res) => {
  res.json(getAttribution());
});

app.get('/api/v5/attribution/metrics', authMiddleware('read'), (_req, res) => {
  res.json(getAttributionMetrics());
});

app.get('/api/v5/equity', authMiddleware('read'), (req, res) => {
  const limit = parseInt(req.query.limit as string) || 100;
  res.json({ equity: getEquityCurve(limit), currentEquity, initialEquity });
});

// ---- v5.0: Health & Rate Limit API ----

app.get('/api/v5/health', authMiddleware('read'), (_req, res) => {
  res.json({ exchanges: getHealthStatus(), summary: getUsageSummary() });
});

app.get('/api/v5/health/limits', authMiddleware('read'), (_req, res) => {
  res.json(getExchangeLimits());
});

app.get('/api/v5/health/intervals', authMiddleware('read'), (req, res) => {
  const vol = parseFloat(req.query.volatility as string) || 0.5;
  res.json({ intervals: getOptimalPollIntervals(vol) });
});

app.post('/api/backtest', (req, res) => {
  const params: BacktestParams = {
    strategy: req.body.strategy || 'PURE_CARRY',
    symbol: req.body.symbol || 'BTCUSDT',
    startTs: req.body.startTs || Date.now() - 30 * 86400000,
    endTs: req.body.endTs || Date.now(),
    initialCapital: req.body.initialCapital || 100000,
    feePerTrade: req.body.feePerTrade || 0.04,
    slippage: req.body.slippage || 0.02,
    maxPositionPct: req.body.maxPositionPct || 25,
    stopLoss: req.body.stopLoss || 2,
    takeProfit: req.body.takeProfit || 5,
    minSpread: req.body.minSpread || 0.01,
  };
  const rateA = generateSyntheticRates(params.symbol, 30, 0.0005, 0.0001);
  const rateB = generateSyntheticRates(params.symbol, 30, 0.0003, 0.0001);
  const result = runBacktest(rateA, rateB, params);
  res.json(result);
});

app.get('/api/backtest/strategies', (_req, res) => {
  res.json({
    strategies: [
      { id: 'PURE_CARRY', name: 'Pure Carry', desc: 'Capture funding rate spread, hold until convergence' },
      { id: 'MOMENTUM', name: 'Momentum', desc: 'Enter when spread is widening, exit when it peaks' },
      { id: 'MEAN_REVERSION', name: 'Mean Reversion', desc: 'Bet on spread returning to historical mean' },
      { id: 'COMPOUND', name: 'Compound', desc: 'Reinvest profits for exponential growth' },
    ],
  });
});

app.get('/api/history/opportunities', (req, res) => {
  const hours = parseInt(req.query.hours as string) || 24;
  const limit = parseInt(req.query.limit as string) || 20;
  res.json({ hours, opportunities: getTopOpportunities(limit, hours) });
});

app.get('/api/history/anomalies', (req, res) => {
  const hours = parseInt(req.query.hours as string) || 24;
  res.json({ hours, summary: getAnomalySummary(hours) });
});

// ---- Kelly Criterion API ----

app.post('/api/kelly', (req, res) => {
  const { winRate, avgWin, avgLoss, spreadPct, capital } = req.body;
  const result = calcKelly({
    winRate: winRate || 0.5,
    avgWin: avgWin || 0.5,
    avgLoss: avgLoss || 0.3,
    currentSpread: spreadPct || 0.02,
    volatility: 0.01,
    maxDrawdownBudget: 5,
  }, capital || 100000);
  res.json(result);
});

// ---- Real Historical Data API ----

app.get('/api/history/rates/:symbol', async (req, res) => {
  const symbol = req.params.symbol;
  const { rates, errors } = await fetchAllHistory(symbol);
  res.json({ symbol, count: rates.length, rates: rates.slice(-200), errors });
});

// ---- Real Backtest (uses historical data) ----

app.post('/api/backtest/real', async (req, res) => {
  const symbol = req.body.symbol || 'BTCUSDT';
  const strategy = req.body.strategy || 'PURE_CARRY';

  // Fetch real historical rates with timeout
  const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 20000));
  let rates: any[] = [];
  let errors: Record<string, string> = {};
  try {
    const result = await Promise.race([fetchAllHistory(symbol), timeout]) as any;
    rates = result.rates;
    errors = result.errors;
  } catch {
    errors.fetch = 'Timeout or error fetching history';
  }

  const binanceRates = rates.filter(r => r.exchange === 'Binance').map((r: any) => ({
    ts: r.fundingTime, rate: r.fundingRate, price: r.markPrice || 0,
  }));
  const bybitRates = rates.filter(r => r.exchange === 'Bybit').map((r: any) => ({
    ts: r.fundingTime, rate: r.fundingRate, price: 0,
  }));

  if (binanceRates.length < 10 || bybitRates.length < 10) {
    const rateA = generateSyntheticRates(symbol, 30, 0.0005, 0.0001);
    const rateB = generateSyntheticRates(symbol, 30, 0.0003, 0.0001);
    const result = runBacktest(rateA, rateB, {
      strategy, symbol,
      startTs: Date.now() - 30 * 86400000, endTs: Date.now(),
      initialCapital: req.body.initialCapital || 100000,
      feePerTrade: req.body.feePerTrade || 0.04,
      slippage: req.body.slippage || 0.02,
      maxPositionPct: req.body.maxPositionPct || 25,
    });
    return res.json({ ...result, dataSource: 'SYNTHETIC', errors });
  }

  const result = runBacktest(binanceRates, bybitRates, {
    strategy, symbol,
    startTs: binanceRates[0].ts, endTs: binanceRates[binanceRates.length - 1].ts,
    initialCapital: req.body.initialCapital || 100000,
    feePerTrade: req.body.feePerTrade || 0.04,
    slippage: req.body.slippage || 0.02,
    maxPositionPct: req.body.maxPositionPct || 25,
  });
  res.json({ ...result, dataSource: 'REAL', sampleSize: Math.min(binanceRates.length, bybitRates.length) });
});

// ---- Alert Config API ----

app.get('/api/alerts/config', (_req, res) => {
  res.json(alertConfig);
});

app.post('/api/alerts/config', (req, res) => {
  alertConfig = {
    ...alertConfig,
    ...req.body,
    telegram: req.body.telegram ? { ...alertConfig.telegram, ...req.body.telegram } : alertConfig.telegram,
    discord: req.body.discord ? { ...alertConfig.discord, ...req.body.discord } : alertConfig.discord,
    slack: req.body.slack ? { ...alertConfig.slack, ...req.body.slack } : alertConfig.slack,
  };
  res.json({ success: true, config: alertConfig });
});

app.post('/api/alerts/test', async (_req, res) => {
  await sendAlert(alertConfig, {
    type: 'OPPORTUNITY', symbol: 'TEST',
    severity: 80, title: 'Test Alert',
    message: 'Funding Mirror alert system is working!',
  });
  res.json({ success: true });
});

// ---- v6.0: Custom Strategy Builder API ----

app.get('/api/v6/strategies', authMiddleware('read'), (_req, res) => {
  res.json({ strategies: getAllStrategies() });
});

app.get('/api/v6/strategies/templates', authMiddleware('read'), (_req, res) => {
  res.json({ templates: getStrategyTemplates() });
});

app.post('/api/v6/strategies', authMiddleware('write'), (req, res) => {
  const strategy = createStrategy(req.body);
  res.json({ success: true, strategy });
});

app.put('/api/v6/strategies/:id', authMiddleware('write'), (req, res) => {
  const updated = updateStrategy(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Strategy not found' });
  res.json({ success: true, strategy: updated });
});

app.delete('/api/v6/strategies/:id', authMiddleware('admin'), (req, res) => {
  const deleted = deleteStrategy(req.params.id);
  res.json({ success: deleted });
});

app.post('/api/v6/strategies/:id/toggle', authMiddleware('write'), (req, res) => {
  const enabled = req.body.enabled !== false;
  const result = toggleStrategy(req.params.id, enabled);
  if (!result) return res.status(404).json({ error: 'Strategy not found' });
  res.json({ success: true, strategy: result });
});

app.get('/api/v6/strategies/signals', authMiddleware('read'), (_req, res) => {
  res.json({ count: latestStrategySignals.length, signals: latestStrategySignals });
});

// ==================== v7.0: Yield Farm Aggregator API ====================

app.get('/api/v7/yields', authMiddleware('read'), (_req, res) => {
  res.json({
    count: latestYields.length,
    updatedAt: lastYieldFetch,
    yields: latestYields,
    summary: getYieldSummary(),
  });
});

app.get('/api/v7/yields/top', authMiddleware('read'), (req, res) => {
  const n = parseInt(req.query.n as string) || 10;
  res.json({ yields: getTopYields(n) });
});

app.get('/api/v7/yields/safe', authMiddleware('read'), (req, res) => {
  const maxRisk = parseInt(req.query.maxRisk as string) || 50;
  res.json({ yields: getYieldsByRisk(maxRisk) });
});

app.post('/api/v7/yields/refresh', authMiddleware('write'), async (_req, res) => {
  clearYieldCache();
  const cexRates = latestOpportunities.slice(0, 10).map(o => ({
    symbol: o.symbol,
    rate: o.netAnnualized / 100 / 1095,
    exchange: o.longEx,
  }));
  latestYields = await aggregateYields(cexRates);
  lastYieldFetch = Date.now();
  res.json({ success: true, count: latestYields.length });
});

// ==================== v7.0: Sentiment Analysis API ====================

app.get('/api/v7/sentiment', authMiddleware('read'), (_req, res) => {
  res.json({
    sentiment: latestSentiment,
    updatedAt: lastSentimentFetch,
  });
});

app.get('/api/v7/sentiment/history', authMiddleware('read'), (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  res.json({ history: getSentimentHistory(limit) });
});

app.get('/api/v7/sentiment/news', authMiddleware('read'), (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const news = latestSentiment ? [...(latestSentiment.topPositive || []), ...(latestSentiment.topNegative || [])] : [];
  res.json({ count: news.length, news: news.slice(0, limit) });
});

app.post('/api/v7/sentiment/refresh', authMiddleware('write'), async (_req, res) => {
  clearSentimentCache();
  try {
    latestSentiment = await analyzeSentiment();
    lastSentimentFetch = Date.now();
    res.json({ success: true, sentiment: latestSentiment });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze sentiment' });
  }
});

// ==================== v7.0: DEX Router API ====================

app.get('/api/v7/dex/quote', authMiddleware('read'), async (req, res) => {
  try {
    const { from, to, amount, chain, slippage } = req.query;
    if (!from || !to || !amount) {
      return res.status(400).json({ error: 'Missing required params: from, to, amount' });
    }
    const quote = await getBestRoute({
      fromToken: from as string,
      toToken: to as string,
      amount: parseFloat(amount as string),
      chain: (chain as string) || 'Ethereum',
      maxSlippage: parseFloat(slippage as string) || 0.5,
    });
    latestDexQuote = quote;
    res.json(quote);
  } catch (e) {
    res.status(500).json({ error: 'Failed to get DEX quote', message: String(e) });
  }
});

app.get('/api/v7/dex/latest', authMiddleware('read'), (_req, res) => {
  res.json({ quote: latestDexQuote });
});

app.post('/api/v7/dex/clear-cache', authMiddleware('write'), (_req, res) => {
  clearQuoteCache();
  res.json({ success: true });
});

// ==================== v7.1: Whale Tracking API ====================

app.get('/api/v7/whale', authMiddleware('read'), (_req, res) => {
  res.json({
    whale: latestWhaleSummary,
    updatedAt: lastWhaleFetch,
  });
});

app.get('/api/v7/whale/alerts', authMiddleware('read'), (_req, res) => {
  res.json({
    alerts: latestWhaleSummary?.alerts || [],
    stats: latestWhaleSummary?.stats || null,
  });
});

app.get('/api/v7/whale/liquidations/:symbol', authMiddleware('read'), (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const heatmap = latestWhaleSummary?.liquidationHeatmap;
  if (heatmap && heatmap.symbol === symbol) {
    res.json(heatmap);
  } else {
    res.json({ error: 'No liquidation data for ' + symbol });
  }
});

app.get('/api/v7/whale/flows', authMiddleware('read'), (_req, res) => {
  res.json({ flows: latestWhaleSummary?.exchangeFlows || [] });
});

app.post('/api/v7/whale/refresh', authMiddleware('write'), async (_req, res) => {
  clearWhaleCache();
  try {
    latestWhaleSummary = await analyzeWhaleActivity(['BTC', 'ETH', 'SOL']);
    lastWhaleFetch = Date.now();
    res.json({ success: true, whale: latestWhaleSummary });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze whale activity' });
  }
});

// ==================== v7.1: Cross-Chain Bridge API ====================

app.get('/api/v7/bridge', authMiddleware('read'), (_req, res) => {
  res.json({ bridge: latestBridgeSummary, updatedAt: lastBridgeFetch });
});

app.get('/api/v7/bridge/opportunities', authMiddleware('read'), (_req, res) => {
  res.json({ opportunities: latestBridgeSummary?.opportunities || [], count: latestBridgeSummary?.opportunities?.length || 0 });
});

app.get('/api/v7/bridge/status', authMiddleware('read'), (_req, res) => {
  res.json({ bridges: latestBridgeSummary?.bridges || [], chainStatus: Object.fromEntries(latestBridgeSummary?.chainStatus || new Map()) });
});

app.get('/api/v7/bridge/quotes', authMiddleware('read'), (req, res) => {
  const { from, to, token } = req.query;
  const filtered = (latestBridgeSummary?.quotes || []).filter(q =>
    (!from || q.fromChain === from) && (!to || q.toChain === to) && (!token || q.token === token)
  );
  res.json({ quotes: filtered });
});

app.post('/api/v7/bridge/refresh', authMiddleware('write'), async (_req, res) => {
  clearBridgeCache();
  try {
    latestBridgeSummary = await analyzeBridges();
    lastBridgeFetch = Date.now();
    res.json({ success: true, bridge: latestBridgeSummary });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze bridges' });
  }
});

// ==================== v7.1: Options Greeks API ====================

app.get('/api/v7/options', authMiddleware('read'), (_req, res) => {
  res.json({ options: latestOptions, updatedAt: lastOptionsFetch });
});

app.get('/api/v7/options/:symbol', authMiddleware('read'), (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const opt = latestOptions.find(o => o.symbol === symbol);
  res.json({ options: opt || null });
});

app.get('/api/v7/options/:symbol/signals', authMiddleware('read'), (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const opt = latestOptions.find(o => o.symbol === symbol);
  res.json({ signals: opt?.signals || [], stats: opt?.stats || null });
});

app.post('/api/v7/options/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestOptions = await analyzeOptions(['BTC', 'ETH']);
    lastOptionsFetch = Date.now();
    res.json({ success: true, options: latestOptions });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze options' });
  }
});

// ---- v7.1: Grid Strategy Optimizer API ----

app.get('/api/v7/grid', authMiddleware('read'), (_req, res) => {
  res.json({ grids: latestGridOptimizations, timestamp: lastGridFetch });
});

app.get('/api/v7/grid/:symbol', authMiddleware('read'), (req, res) => {
  const grid = latestGridOptimizations.find(g => g.symbol === req.params.symbol);
  if (!grid) { res.status(404).json({ error: 'Grid not found' }); return; }
  res.json(grid);
});

app.post('/api/v7/grid/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
    const priceMap: Record<string, number> = { BTCUSDT: 65000, ETHUSDT: 3500, SOLUSDT: 150 };
    latestGridOptimizations = await Promise.all(
      symbols.map(s => optimizeGrid(s.replace('USDT', ''), priceMap[s] || 100))
    );
    lastGridFetch = Date.now();
    res.json({ success: true, grids: latestGridOptimizations });
  } catch (e) {
    res.status(500).json({ error: 'Failed to optimize grids' });
  }
});

// ---- v7.2: Liquidation Cascade Predictor API ----

app.get('/api/v7/liquidation', authMiddleware('read'), (_req, res) => {
  if (!latestLiquidation) { res.status(503).json({ error: 'No liquidation data yet' }); return; }
  res.json(latestLiquidation);
});

app.get('/api/v7/liquidation/warnings', authMiddleware('read'), (_req, res) => {
  res.json({ warnings: latestLiquidation?.warnings || [], timestamp: lastLiquidationFetch });
});

app.get('/api/v7/liquidation/clusters', authMiddleware('read'), (_req, res) => {
  res.json({ clusters: latestLiquidation?.clusters || [], timestamp: lastLiquidationFetch });
});

app.post('/api/v7/liquidation/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    const btcRate = latestRates.find(r => r.symbol === 'BTCUSDT');
    latestLiquidation = await analyzeLiquidations(
      'BTC',
      btcRate?.markPrice || 65000,
      btcRate?.openInterest || 15e9,
      0.03
    );
    lastLiquidationFetch = Date.now();
    res.json({ success: true, liquidation: latestLiquidation });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze liquidations' });
  }
});

// ---- v7.3: Term Structure Predictor API ----

app.get('/api/v7/termstructure', authMiddleware('read'), (_req, res) => {
  res.json({ termStructures: Array.from(latestTermStructures.values()), timestamp: lastTermStructureFetch });
});

app.get('/api/v7/termstructure/:symbol', authMiddleware('read'), (req, res) => {
  const key = `${req.params.symbol}_Binance`;
  const ts = latestTermStructures.get(key);
  if (!ts) { res.status(404).json({ error: 'Term structure not found' }); return; }
  res.json(ts);
});

app.get('/api/v7/termstructure/:symbol/predictions', authMiddleware('read'), (req, res) => {
  const key = `${req.params.symbol}_Binance`;
  const ts = latestTermStructures.get(key);
  if (!ts) { res.status(404).json({ error: 'Term structure not found' }); return; }
  res.json({ predictions: ts.predictions, curveFit: ts.curveFit, contangoScore: ts.contangoScore });
});

app.post('/api/v7/termstructure/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    const btcRate = latestRates.find(r => r.symbol === 'BTCUSDT');
    if (btcRate) {
      const ts = await analyzeTermStructure(
        'BTC',
        btcRate.markPrice || 65000,
        btcRate.fundingRate || 0.01,
        btcRate.exchange || 'Binance'
      );
      latestTermStructures.set('BTC_Binance', ts);
      lastTermStructureFetch = Date.now();
    }
    res.json({ success: true, termStructures: Array.from(latestTermStructures.values()) });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze term structure' });
  }
});

// ---- v7.4: Smart Execution Engine API ----

app.get('/api/v7/execution', authMiddleware('read'), (_req, res) => {
  res.json({ execution: latestExecution, timestamp: lastExecutionFetch });
});

app.get('/api/v7/execution/orders', authMiddleware('read'), (_req, res) => {
  res.json({ orders: Array.from(getActiveOrders().values()) });
});

app.get('/api/v7/execution/history', authMiddleware('read'), (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  res.json({ history: getExecutionHistory(limit) });
});

app.post('/api/v7/execution/analyze', authMiddleware('write'), async (req, res) => {
  try {
    const { symbol, side, qty, strategy, price, volume, volatility, spread } = req.body;
    const btcRate = latestRates.find(r => r.symbol === 'BTCUSDT');
    latestExecution = await analyzeExecution(
      symbol || 'BTC',
      side || 'BUY',
      qty || 0.5,
      strategy || 'TWAP',
      price || btcRate?.markPrice || 65000,
      volume || btcRate?.volume24h || 1e9,
      volatility || 0.03,
      spread || 0.02
    );
    lastExecutionFetch = Date.now();
    res.json({ success: true, execution: latestExecution });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze execution' });
  }
});

// ---- v7.5: Risk Management API ----

app.get('/api/v7/risk', authMiddleware('read'), (_req, res) => {
  if (!latestRisk) { res.status(503).json({ error: 'No risk data yet' }); return; }
  res.json(latestRisk);
});

app.get('/api/v7/risk/var', authMiddleware('read'), (_req, res) => {
  res.json({ var: latestRisk?.var || [], timestamp: lastRiskFetch });
});

app.get('/api/v7/risk/stress', authMiddleware('read'), (_req, res) => {
  res.json({ scenarios: latestRisk?.stressScenarios || [], timestamp: lastRiskFetch });
});

app.get('/api/v7/risk/metrics', authMiddleware('read'), (_req, res) => {
  res.json({ metrics: latestRisk?.metrics || null, margin: latestRisk?.margin || null, timestamp: lastRiskFetch });
});

app.post('/api/v7/risk/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestRisk = await analyzeRisk();
    lastRiskFetch = Date.now();
    res.json({ success: true, risk: latestRisk });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze risk' });
  }
});

// ---- v7.6: Order Book Analysis API ----

app.get('/api/v7/orderbook', authMiddleware('read'), (_req, res) => {
  if (!latestOrderBook) { res.status(503).json({ error: 'No order book data yet' }); return; }
  res.json(latestOrderBook);
});

app.get('/api/v7/orderbook/signals', authMiddleware('read'), (_req, res) => {
  res.json({ signals: latestOrderBook?.signals || [], timestamp: lastOrderBookFetch });
});

app.get('/api/v7/orderbook/walls', authMiddleware('read'), (_req, res) => {
  res.json({ walls: latestOrderBook?.whaleWalls || [], timestamp: lastOrderBookFetch });
});

app.get('/api/v7/orderbook/cross-exchange', authMiddleware('read'), (_req, res) => {
  res.json({ comparison: latestOrderBook?.crossExchange || [], timestamp: lastOrderBookFetch });
});

app.post('/api/v7/orderbook/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    const btcRate = latestRates.find(r => r.symbol === 'BTCUSDT');
    if (btcRate) {
      latestOrderBook = await analyzeOrderBooks('BTCUSDT', btcRate.markPrice || 65000);
      lastOrderBookFetch = Date.now();
    }
    res.json({ success: true, orderBook: latestOrderBook });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze order books' });
  }
});

// ---- v7.7: Portfolio Rebalancing API ----

app.get('/api/v7/rebalance', authMiddleware('read'), (_req, res) => {
  if (!latestRebalance) { res.status(503).json({ error: 'No rebalance data yet' }); return; }
  res.json(latestRebalance);
});

app.get('/api/v7/rebalance/trades', authMiddleware('read'), (_req, res) => {
  res.json({ trades: latestRebalance?.trades || [], timestamp: lastRebalanceFetch });
});

app.get('/api/v7/rebalance/tax-harvest', authMiddleware('read'), (_req, res) => {
  res.json({ opportunities: latestRebalance?.taxLossHarvests || [], timestamp: lastRebalanceFetch });
});

app.get('/api/v7/rebalance/optimization', authMiddleware('read'), (_req, res) => {
  const opt = latestRebalance?.optimization;
  if (!opt) { res.status(404).json({ error: 'No optimization data' }); return; }
  res.json({ optimization: { ...opt, weights: Object.fromEntries(opt.weights) } });
});

app.post('/api/v7/rebalance/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestRebalance = await analyzeRebalance(currentEquity || 100000);
    lastRebalanceFetch = Date.now();
    res.json({ success: true, rebalance: latestRebalance });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze rebalancing' });
  }
});

// ---- v8.0: Cross-Border E-Commerce Alert API ----

app.get('/api/v8/cross-border/alerts', authMiddleware('read'), (_req, res) => {
  if (!latestCrossBorderAlerts) { res.status(503).json({ error: 'No alert data yet' }); return; }
  res.json(latestCrossBorderAlerts);
});

app.get('/api/v8/cross-border/policies', authMiddleware('read'), (_req, res) => {
  res.json({ policies: latestCrossBorderAlerts?.policies || [], timestamp: lastCrossBorderFetch });
});

app.get('/api/v8/cross-border/tariffs', authMiddleware('read'), (_req, res) => {
  res.json({ tariffs: latestCrossBorderAlerts?.tariffs || [], timestamp: lastCrossBorderFetch });
});

app.get('/api/v8/cross-border/vat', authMiddleware('read'), (_req, res) => {
  res.json({ vatChanges: latestCrossBorderAlerts?.vatChanges || [], timestamp: lastCrossBorderFetch });
});

app.get('/api/v8/cross-border/compliance', authMiddleware('read'), (_req, res) => {
  res.json({ compliance: latestCrossBorderAlerts?.compliance || [], timestamp: lastCrossBorderFetch });
});

app.post('/api/v8/cross-border/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestCrossBorderAlerts = await analyzeCrossBorderAlerts();
    lastCrossBorderFetch = Date.now();
    res.json({ success: true, alerts: latestCrossBorderAlerts });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze cross-border alerts' });
  }
});

// ---- v8.1: AI Resume Optimization API ----

app.post('/api/v8/resume/optimize', authMiddleware('write'), async (req, res) => {
  try {
    const { jobDescription, resumeText } = req.body;
    if (!jobDescription || !resumeText) {
      res.status(400).json({ error: 'jobDescription and resumeText required' });
      return;
    }
    const result = await optimizeResume(jobDescription, resumeText);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: 'Failed to optimize resume' });
  }
});

app.get('/api/v8/resume/result', authMiddleware('read'), (_req, res) => {
  if (!latestResumeOpt) { res.status(404).json({ error: 'No optimization result yet' }); return; }
  res.json(latestResumeOpt);
});

// ---- v8.2: NFT Arbitrage API ----

app.get('/api/v8/nft/arbitrage', authMiddleware('read'), (_req, res) => {
  if (!latestNFTSummary) { res.status(503).json({ error: 'No NFT data yet' }); return; }
  res.json(latestNFTSummary);
});

app.get('/api/v8/nft/floor-prices', authMiddleware('read'), (_req, res) => {
  res.json({ floorPrices: latestNFTSummary?.floorPrices || [], timestamp: lastNFTFetch });
});

app.get('/api/v8/nft/opportunities', authMiddleware('read'), (_req, res) => {
  res.json({ opportunities: latestNFTSummary?.arbitrageOpportunities || [], timestamp: lastNFTFetch });
});

app.get('/api/v8/nft/whale-activity', authMiddleware('read'), (_req, res) => {
  res.json({ activities: latestNFTSummary?.whaleActivities || [], timestamp: lastNFTFetch });
});

app.get('/api/v8/nft/mints', authMiddleware('read'), (_req, res) => {
  res.json({ mints: latestNFTSummary?.mintAlerts || [], timestamp: lastNFTFetch });
});

app.post('/api/v8/nft/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestNFTSummary = await analyzeNFTArbitrage();
    lastNFTFetch = Date.now();
    res.json({ success: true, nft: latestNFTSummary });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze NFT arbitrage' });
  }
});

// ---- v8.3: RWA Tracker API ----

app.get('/api/v8/rwa/tracker', authMiddleware('read'), (_req, res) => {
  if (!latestRWA) { res.status(503).json({ error: 'No RWA data yet' }); return; }
  res.json(latestRWA);
});

app.get('/api/v8/rwa/protocols', authMiddleware('read'), (_req, res) => {
  res.json({ protocols: latestRWA?.protocols || [], timestamp: lastRWAFetch });
});

app.get('/api/v8/rwa/opportunities', authMiddleware('read'), (_req, res) => {
  res.json({ opportunities: latestRWA?.opportunities || [], timestamp: lastRWAFetch });
});

app.get('/api/v8/rwa/risks', authMiddleware('read'), (_req, res) => {
  res.json({ risks: latestRWA?.risks || [], timestamp: lastRWAFetch });
});

app.get('/api/v8/rwa/events', authMiddleware('read'), (_req, res) => {
  res.json({ events: latestRWA?.events || [], timestamp: lastRWAFetch });
});

app.post('/api/v8/rwa/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestRWA = await analyzeRWA();
    lastRWAFetch = Date.now();
    res.json({ success: true, rwa: latestRWA });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze RWA' });
  }
});

// ---- v8.4: Template Store API ----

app.get('/api/v8/templates/store', authMiddleware('read'), (_req, res) => {
  if (!latestTemplateStore) { res.status(503).json({ error: 'No template data yet' }); return; }
  res.json(latestTemplateStore);
});

app.get('/api/v8/templates/featured', authMiddleware('read'), (_req, res) => {
  res.json({ templates: latestTemplateStore?.featured || [], timestamp: lastTemplateStoreFetch });
});

app.get('/api/v8/templates/trending', authMiddleware('read'), (_req, res) => {
  res.json({ templates: latestTemplateStore?.trending || [], timestamp: lastTemplateStoreFetch });
});

app.get('/api/v8/templates/categories', authMiddleware('read'), (_req, res) => {
  res.json({ categories: latestTemplateStore?.categories || [], timestamp: lastTemplateStoreFetch });
});

app.get('/api/v8/templates/stats', authMiddleware('read'), (_req, res) => {
  res.json({ stats: latestTemplateStore?.stats || null, timestamp: lastTemplateStoreFetch });
});

app.post('/api/v8/templates/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestTemplateStore = await getTemplateStore();
    lastTemplateStoreFetch = Date.now();
    res.json({ success: true, store: latestTemplateStore });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch template store' });
  }
});

// ---- v9.0: Airdrop Farming API ----

app.get('/api/v9/airdrop/active', authMiddleware('read'), (_req, res) => {
  res.json({ airdrops: latestAirdropFarm?.activeAirdrops || [], timestamp: lastAirdropFetch });
});

app.get('/api/v9/airdrop/upcoming', authMiddleware('read'), (_req, res) => {
  res.json({ airdrops: latestAirdropFarm?.upcomingAirdrops || [], timestamp: lastAirdropFetch });
});

app.get('/api/v9/airdrop/strategies', authMiddleware('read'), (_req, res) => {
  res.json({ strategies: latestAirdropFarm?.strategies || [], timestamp: lastAirdropFetch });
});

app.get('/api/v9/airdrop/historical', authMiddleware('read'), (_req, res) => {
  res.json({ historical: latestAirdropFarm?.historical || [], timestamp: lastAirdropFetch });
});

app.post('/api/v9/airdrop/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestAirdropFarm = await analyzeAirdropFarm();
    lastAirdropFetch = Date.now();
    res.json({ success: true, farm: latestAirdropFarm });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze airdrop farming' });
  }
});

// ---- v9.1: Perpetual DEX API ----

app.get('/api/v9/perp/dexes', authMiddleware('read'), (_req, res) => {
  res.json({ dexes: latestPerpDex?.dexes || [], timestamp: lastPerpFetch });
});

app.get('/api/v9/perp/markets', authMiddleware('read'), (_req, res) => {
  res.json({ markets: latestPerpDex?.markets || [], timestamp: lastPerpFetch });
});

app.get('/api/v9/perp/arbitrage', authMiddleware('read'), (_req, res) => {
  res.json({ arbitrage: latestPerpDex?.arbitrage || [], timestamp: lastPerpFetch });
});

app.get('/api/v9/perp/best-funding', authMiddleware('read'), (_req, res) => {
  res.json({ bestFunding: latestPerpDex?.bestFunding || {}, timestamp: lastPerpFetch });
});

app.post('/api/v9/perp/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestPerpDex = await analyzePerpDex();
    lastPerpFetch = Date.now();
    res.json({ success: true, perp: latestPerpDex });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze perpetual DEX' });
  }
});

// ---- v9.2: Security Scanner API ----

app.get('/api/v9/security/reports', authMiddleware('read'), (_req, res) => {
  res.json({ reports: latestSecurity?.reports || [], timestamp: lastSecurityFetch });
});

app.get('/api/v9/security/summary', authMiddleware('read'), (_req, res) => {
  res.json({ summary: latestSecurity || null, timestamp: lastSecurityFetch });
});

app.post('/api/v9/security/scan', authMiddleware('write'), async (req, res) => {
  try {
    latestSecurity = await analyzeSecurity();
    lastSecurityFetch = Date.now();
    res.json({ success: true, security: latestSecurity });
  } catch (e) {
    res.status(500).json({ error: 'Failed to scan security' });
  }
});

// ---- v9.3: Smart Money API ----

app.get('/api/v9/smart/wallets', authMiddleware('read'), (_req, res) => {
  res.json({ wallets: latestSmartMoney?.wallets || [], timestamp: lastSmartMoneyFetch });
});

app.get('/api/v9/smart/transactions', authMiddleware('read'), (_req, res) => {
  res.json({ transactions: latestSmartMoney?.transactions || [], timestamp: lastSmartMoneyFetch });
});

app.get('/api/v9/smart/signals', authMiddleware('read'), (_req, res) => {
  res.json({ signals: latestSmartMoney?.copySignals || [], timestamp: lastSmartMoneyFetch });
});

app.get('/api/v9/smart/flows', authMiddleware('read'), (_req, res) => {
  res.json({ flows: latestSmartMoney?.exchangeFlows || [], timestamp: lastSmartMoneyFetch });
});

app.post('/api/v9/smart/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestSmartMoney = await analyzeSmartMoney();
    lastSmartMoneyFetch = Date.now();
    res.json({ success: true, smart: latestSmartMoney });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze smart money' });
  }
});

// ---- v9.4: MEV Protection API ----

app.get('/api/v9/mev/threats', authMiddleware('read'), (_req, res) => {
  res.json({ threats: latestMEV?.threats || [], timestamp: lastMEVFetch });
});

app.get('/api/v9/mev/score', authMiddleware('read'), (_req, res) => {
  res.json({ score: latestMEV?.protectionScore || null, timestamp: lastMEVFetch });
});

app.get('/api/v9/mev/private-tx', authMiddleware('read'), (_req, res) => {
  res.json({ options: latestMEV?.privateTxOptions || [], timestamp: lastMEVFetch });
});

app.get('/api/v9/mev/protected-txs', authMiddleware('read'), (_req, res) => {
  res.json({ txs: latestMEV?.protectedTxs || [], timestamp: lastMEVFetch });
});

app.get('/api/v9/mev/attackers', authMiddleware('read'), (_req, res) => {
  res.json({ attackers: latestMEV?.topAttackers || [], timestamp: lastMEVFetch });
});

app.post('/api/v9/mev/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestMEV = await analyzeMEVProtection();
    lastMEVFetch = Date.now();
    res.json({ success: true, mev: latestMEV });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze MEV protection' });
  }
});

// ---- v9.5: Bridge Monitor API ----

app.get('/api/v9/bridge/status', authMiddleware('read'), (_req, res) => {
  res.json({ bridges: latestBridge?.bridges || [], timestamp: lastBridgeMonitorFetch });
});

app.get('/api/v9/bridge/routes', authMiddleware('read'), (_req, res) => {
  res.json({ routes: latestBridge?.routes || [], timestamp: lastBridgeMonitorFetch });
});

app.get('/api/v9/bridge/alerts', authMiddleware('read'), (_req, res) => {
  res.json({ alerts: latestBridge?.alerts || [], timestamp: lastBridgeMonitorFetch });
});

app.get('/api/v9/bridge/liquidity', authMiddleware('read'), (_req, res) => {
  res.json({ liquidity: latestBridge?.liquidity || [], timestamp: lastBridgeMonitorFetch });
});

app.post('/api/v9/bridge/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestBridge = await analyzeBridgeMonitor();
    lastBridgeMonitorFetch = Date.now();
    res.json({ success: true, bridge: latestBridge });
  } catch (e) {
    res.status(500).json({ error: 'Failed to monitor bridges' });
  }
});

// ---- v9.6: Yield Aggregator API ----

app.get('/api/v9/yield/protocols', authMiddleware('read'), (_req, res) => {
  res.json({ protocols: latestYieldAgg?.protocols || [], timestamp: lastYieldAggFetch });
});

app.get('/api/v9/yield/opportunities', authMiddleware('read'), (_req, res) => {
  res.json({ opportunities: latestYieldAgg?.opportunities || [], timestamp: lastYieldAggFetch });
});

app.get('/api/v9/yield/auto-compound', authMiddleware('read'), (_req, res) => {
  res.json({ configs: latestYieldAgg?.autoCompoundConfigs || [], timestamp: lastYieldAggFetch });
});

app.get('/api/v9/yield/risk', authMiddleware('read'), (_req, res) => {
  res.json({ risk: latestYieldAgg?.riskMetrics || null, timestamp: lastYieldAggFetch });
});

app.post('/api/v9/yield/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestYieldAgg = await analyzeYieldAggregator();
    lastYieldAggFetch = Date.now();
    res.json({ success: true, yield: latestYieldAgg });
  } catch (e) {
    res.status(500).json({ error: 'Failed to aggregate yields' });
  }
});

// ---- v9.7: NFT Price Predictor API ----

app.get('/api/v9/nft/predictions', authMiddleware('read'), (_req, res) => {
  res.json({ predictions: latestNFTPrediction?.predictions || [], timestamp: lastNFTPredictionFetch });
});

app.get('/api/v9/nft/rarity', authMiddleware('read'), (_req, res) => {
  res.json({ rarity: latestNFTPrediction?.rarityData || [], timestamp: lastNFTPredictionFetch });
});

app.get('/api/v9/nft/whales', authMiddleware('read'), (_req, res) => {
  res.json({ whales: latestNFTPrediction?.whaleHolders || [], timestamp: lastNFTPredictionFetch });
});

app.get('/api/v9/nft/sentiment', authMiddleware('read'), (_req, res) => {
  res.json({ sentiment: latestNFTPrediction?.sentiment || [], timestamp: lastNFTPredictionFetch });
});

app.get('/api/v9/nft/traits', authMiddleware('read'), (_req, res) => {
  res.json({ traits: latestNFTPrediction?.traitModels || [], timestamp: lastNFTPredictionFetch });
});

app.post('/api/v9/nft/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestNFTPrediction = await analyzeNFTPredictions();
    lastNFTPredictionFetch = Date.now();
    res.json({ success: true, nft: latestNFTPrediction });
  } catch (e) {
    res.status(500).json({ error: 'Failed to predict NFT prices' });
  }
});

// ---- v9.8: On-Chain Analytics API ----

app.get('/api/v9/onchain/whale-txs', authMiddleware('read'), (_req, res) => {
  res.json({ txs: latestOnChain?.whaleTransactions || [], timestamp: lastOnChainFetch });
});

app.get('/api/v9/onchain/exchange-flows', authMiddleware('read'), (_req, res) => {
  res.json({ flows: latestOnChain?.exchangeFlows || [], timestamp: lastOnChainFetch });
});

app.get('/api/v9/onchain/network-metrics', authMiddleware('read'), (_req, res) => {
  res.json({ metrics: latestOnChain?.networkMetrics || [], timestamp: lastOnChainFetch });
});

app.get('/api/v9/onchain/stablecoin-depeg', authMiddleware('read'), (_req, res) => {
  res.json({ depegs: latestOnChain?.stablecoinDepegs || [], timestamp: lastOnChainFetch });
});

app.get('/api/v9/onchain/alerts', authMiddleware('read'), (_req, res) => {
  res.json({ alerts: latestOnChain?.alerts || [], timestamp: lastOnChainFetch });
});

app.post('/api/v9/onchain/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestOnChain = await analyzeOnChainAnalytics();
    lastOnChainFetch = Date.now();
    res.json({ success: true, onchain: latestOnChain });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze on-chain data' });
  }
});

// ---- v9.9: DAO Governance API ----

app.get('/api/v9/dao/proposals', authMiddleware('read'), (_req, res) => {
  res.json({ proposals: latestDao?.proposals || [], timestamp: lastDaoFetch });
});

app.get('/api/v9/dao/delegates', authMiddleware('read'), (_req, res) => {
  res.json({ delegates: latestDao?.delegates || [], timestamp: lastDaoFetch });
});

app.get('/api/v9/dao/attacks', authMiddleware('read'), (_req, res) => {
  res.json({ attacks: latestDao?.attacks || [], timestamp: lastDaoFetch });
});

app.get('/api/v9/dao/treasury', authMiddleware('read'), (_req, res) => {
  res.json({ movements: latestDao?.treasuryMovements || [], timestamp: lastDaoFetch });
});

app.post('/api/v9/dao/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestDao = await analyzeDaoGovernance();
    lastDaoFetch = Date.now();
    res.json({ success: true, dao: latestDao });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze DAO governance' });
  }
});

// ---- v9.10: RWA Yield Monitor API ----

app.get('/api/v9/rwa/protocols', authMiddleware('read'), (_req, res) => {
  res.json({ protocols: latestRWAYield?.protocols || [], timestamp: lastRWAYieldFetch });
});

app.get('/api/v9/rwa/opportunities', authMiddleware('read'), (_req, res) => {
  res.json({ opportunities: latestRWAYield?.opportunities || [], timestamp: lastRWAYieldFetch });
});

app.get('/api/v9/rwa/yield-history', authMiddleware('read'), (_req, res) => {
  res.json({ histories: latestRWAYield?.yieldHistories || [], timestamp: lastRWAYieldFetch });
});

app.get('/api/v9/rwa/compliance', authMiddleware('read'), (_req, res) => {
  res.json({ compliance: latestRWAYield?.compliance || [], timestamp: lastRWAYieldFetch });
});

app.post('/api/v9/rwa/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestRWAYield = await analyzeRWAYield();
    lastRWAYieldFetch = Date.now();
    res.json({ success: true, rwa: latestRWAYield });
  } catch (e) {
    res.status(500).json({ error: 'Failed to monitor RWA yields' });
  }
});

// ---- v9.11: Prediction Market Arbitrage API ----

app.get('/api/v9/pred/markets', authMiddleware('read'), (_req, res) => {
  res.json({ markets: latestPredArb?.markets || [], timestamp: lastPredArbFetch });
});

app.get('/api/v9/pred/events', authMiddleware('read'), (_req, res) => {
  res.json({ events: latestPredArb?.events || [], timestamp: lastPredArbFetch });
});

app.get('/api/v9/pred/arbitrage', authMiddleware('read'), (_req, res) => {
  res.json({ arbitrage: latestPredArb?.arbitrage || [], timestamp: lastPredArbFetch });
});

app.get('/api/v9/pred/probabilities', authMiddleware('read'), (_req, res) => {
  res.json({ probabilities: latestPredArb?.probabilities || [], timestamp: lastPredArbFetch });
});

app.get('/api/v9/pred/efficiency', authMiddleware('read'), (_req, res) => {
  res.json({ efficiency: latestPredArb?.efficiency || [], timestamp: lastPredArbFetch });
});

app.post('/api/v9/pred/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestPredArb = await analyzePredictionArb();
    lastPredArbFetch = Date.now();
    res.json({ success: true, pred: latestPredArb });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze prediction markets' });
  }
});

// ---- v9.12: Option Greeks API ----

app.get('/api/v9/options/positions', authMiddleware('read'), (_req, res) => {
  res.json({ positions: latestOptionGreeks?.positions || [], timestamp: lastOptionGreeksFetch });
});

app.get('/api/v9/options/portfolio', authMiddleware('read'), (_req, res) => {
  res.json({ portfolio: latestOptionGreeks?.portfolio || null, timestamp: lastOptionGreeksFetch });
});

app.get('/api/v9/options/iv-surface', authMiddleware('read'), (_req, res) => {
  res.json({ surfaces: latestOptionGreeks?.ivSurface || [], timestamp: lastOptionGreeksFetch });
});

app.get('/api/v9/options/max-pain', authMiddleware('read'), (_req, res) => {
  res.json({ maxPain: latestOptionGreeks?.maxPain || [], timestamp: lastOptionGreeksFetch });
});

app.get('/api/v9/options/scenarios', authMiddleware('read'), (_req, res) => {
  res.json({ scenarios: latestOptionGreeks?.scenarios || [], timestamp: lastOptionGreeksFetch });
});

app.post('/api/v9/options/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestOptionGreeks = await analyzeOptionGreeks();
    lastOptionGreeksFetch = Date.now();
    res.json({ success: true, options: latestOptionGreeks });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze option Greeks' });
  }
});

// ---- v9.13: Funding Rate Backtest API ----

app.get('/api/v9/funding/rates', authMiddleware('read'), (_req, res) => {
  res.json({ rates: latestFundingBacktest?.rates || [], timestamp: lastFundingBacktestFetch });
});

app.get('/api/v9/funding/spreads', authMiddleware('read'), (_req, res) => {
  res.json({ spreads: latestFundingBacktest?.spreads || [], timestamp: lastFundingBacktestFetch });
});

app.get('/api/v9/funding/backtests', authMiddleware('read'), (_req, res) => {
  res.json({ backtests: latestFundingBacktest?.backtestResults || [], timestamp: lastFundingBacktestFetch });
});

app.get('/api/v9/funding/optimal-entries', authMiddleware('read'), (_req, res) => {
  res.json({ entries: latestFundingBacktest?.optimalEntries || [], timestamp: lastFundingBacktestFetch });
});

app.get('/api/v9/funding/monte-carlo', authMiddleware('read'), (_req, res) => {
  res.json({ monteCarlo: latestFundingBacktest?.monteCarlo || null, timestamp: lastFundingBacktestFetch });
});

app.post('/api/v9/funding/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestFundingBacktest = await analyzeFundingBacktest();
    lastFundingBacktestFetch = Date.now();
    res.json({ success: true, funding: latestFundingBacktest });
  } catch (e) {
    res.status(500).json({ error: 'Failed to backtest funding rates' });
  }
});

// ---- v9.14: Exchange Spread Alert API ----

app.get('/api/v9/spread/opportunities', authMiddleware('read'), (_req, res) => {
  res.json({ opportunities: latestExchangeSpreads?.spreads || [], timestamp: lastExchangeSpreadsFetch });
});

app.get('/api/v9/spread/triangular', authMiddleware('read'), (_req, res) => {
  res.json({ triangular: latestExchangeSpreads?.triangularArbs || [], timestamp: lastExchangeSpreadsFetch });
});

app.get('/api/v9/spread/liquidity', authMiddleware('read'), (_req, res) => {
  res.json({ liquidity: latestExchangeSpreads?.liquidityProfiles || [], timestamp: lastExchangeSpreadsFetch });
});

app.get('/api/v9/spread/historical', authMiddleware('read'), (_req, res) => {
  res.json({ historical: latestExchangeSpreads?.historicalSpreads || [], timestamp: lastExchangeSpreadsFetch });
});

app.get('/api/v9/spread/exchange-status', authMiddleware('read'), (_req, res) => {
  res.json({ status: latestExchangeSpreads?.exchangeStatus || [], timestamp: lastExchangeSpreadsFetch });
});

app.post('/api/v9/spread/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestExchangeSpreads = await analyzeExchangeSpreads();
    lastExchangeSpreadsFetch = Date.now();
    res.json({ success: true, spreads: latestExchangeSpreads });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze exchange spreads' });
  }
});

// ---- v9.15: Gas Optimizer API ----

app.get('/api/v9/gas/prices', authMiddleware('read'), (_req, res) => {
  res.json({ prices: latestGasOptimizer?.gasPrices || [], timestamp: lastGasOptimizerFetch });
});

app.get('/api/v9/gas/optimal-execution', authMiddleware('read'), (_req, res) => {
  res.json({ optimal: latestGasOptimizer?.optimalExecutions || [], timestamp: lastGasOptimizerFetch });
});

app.get('/api/v9/gas/l2-comparison', authMiddleware('read'), (_req, res) => {
  res.json({ comparison: latestGasOptimizer?.l2Comparison || null, timestamp: lastGasOptimizerFetch });
});

app.get('/api/v9/gas/batch-suggestions', authMiddleware('read'), (_req, res) => {
  res.json({ suggestions: latestGasOptimizer?.batchSuggestions || [], timestamp: lastGasOptimizerFetch });
});

app.get('/api/v9/gas/forecast', authMiddleware('read'), (_req, res) => {
  res.json({ forecast: latestGasOptimizer?.forecasts || [], timestamp: lastGasOptimizerFetch });
});

app.get('/api/v9/gas/mempool', authMiddleware('read'), (_req, res) => {
  res.json({ mempool: latestGasOptimizer?.mempoolAnalysis || [], timestamp: lastGasOptimizerFetch });
});

app.post('/api/v9/gas/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestGasOptimizer = await analyzeGasOptimizer();
    lastGasOptimizerFetch = Date.now();
    res.json({ success: true, gas: latestGasOptimizer });
  } catch (e) {
    res.status(500).json({ error: 'Failed to optimize gas' });
  }
});

// ---- v9.16: On-Chain Reputation API ----

app.get('/api/v9/reputation/addresses', authMiddleware('read'), (_req, res) => {
  res.json({ addresses: latestReputation?.addresses || [], timestamp: lastReputationFetch });
});

app.get('/api/v9/reputation/fraud-alerts', authMiddleware('read'), (_req, res) => {
  res.json({ alerts: latestReputation?.fraudAlerts || [], timestamp: lastReputationFetch });
});

app.get('/api/v9/reputation/sybil-clusters', authMiddleware('read'), (_req, res) => {
  res.json({ clusters: latestReputation?.sybilClusters || [], timestamp: lastReputationFetch });
});

app.get('/api/v9/reputation/trends', authMiddleware('read'), (_req, res) => {
  res.json({ trends: latestReputation?.trends || [], timestamp: lastReputationFetch });
});

app.post('/api/v9/reputation/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestReputation = await analyzeReputation();
    lastReputationFetch = Date.now();
    res.json({ success: true, reputation: latestReputation });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze reputation' });
  }
});

// ---- v9.17: Cross-Chain DEX API ----

app.get('/api/v9/crosschain/routes', authMiddleware('read'), (_req, res) => {
  res.json({ routes: latestCrossChainDex?.routes || [], timestamp: lastCrossChainDexFetch });
});

app.get('/api/v9/crosschain/liquidity', authMiddleware('read'), (_req, res) => {
  res.json({ sources: latestCrossChainDex?.liquiditySources || [], timestamp: lastCrossChainDexFetch });
});

app.get('/api/v9/crosschain/bridge-routes', authMiddleware('read'), (_req, res) => {
  res.json({ bridges: latestCrossChainDex?.bridgeRoutes || [], timestamp: lastCrossChainDexFetch });
});

app.post('/api/v9/crosschain/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestCrossChainDex = await analyzeCrossChainDex();
    lastCrossChainDexFetch = Date.now();
    res.json({ success: true, crosschain: latestCrossChainDex });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze cross-chain DEX' });
  }
});

// ---- v9.18: Derivatives Liquidity API ----

app.get('/api/v9/derivatives/depth', authMiddleware('read'), (_req, res) => {
  res.json({ depth: latestDerivativesLiq?.depth || [], timestamp: lastDerivativesLiqFetch });
});

app.get('/api/v9/derivatives/open-interest', authMiddleware('read'), (_req, res) => {
  res.json({ oi: latestDerivativesLiq?.openInterest || [], timestamp: lastDerivativesLiqFetch });
});

app.get('/api/v9/derivatives/liquidation-risk', authMiddleware('read'), (_req, res) => {
  res.json({ risk: latestDerivativesLiq?.liquidationRisk || [], timestamp: lastDerivativesLiqFetch });
});

app.get('/api/v9/derivatives/solvency', authMiddleware('read'), (_req, res) => {
  res.json({ solvency: latestDerivativesLiq?.solvency || [], timestamp: lastDerivativesLiqFetch });
});

app.post('/api/v9/derivatives/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestDerivativesLiq = await analyzeDerivativesLiquidity();
    lastDerivativesLiqFetch = Date.now();
    res.json({ success: true, derivatives: latestDerivativesLiq });
  } catch (e) {
    res.status(500).json({ error: 'Failed to monitor derivatives liquidity' });
  }
});

// ---- v9.19: Contract Upgrade API ----

app.get('/api/v9/contracts/upgrades', authMiddleware('read'), (_req, res) => {
  res.json({ upgrades: latestContractUpgrades?.upgrades || [], timestamp: lastContractUpgradeFetch });
});

app.get('/api/v9/contracts/proposals', authMiddleware('read'), (_req, res) => {
  res.json({ proposals: latestContractUpgrades?.proposals || [], timestamp: lastContractUpgradeFetch });
});

app.get('/api/v9/contracts/timelocks', authMiddleware('read'), (_req, res) => {
  res.json({ timelocks: latestContractUpgrades?.timelocks || [], timestamp: lastContractUpgradeFetch });
});

app.get('/api/v9/contracts/audits', authMiddleware('read'), (_req, res) => {
  res.json({ audits: latestContractUpgrades?.audits || [], timestamp: lastContractUpgradeFetch });
});

app.post('/api/v9/contracts/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestContractUpgrades = await analyzeContractUpgrades();
    lastContractUpgradeFetch = Date.now();
    res.json({ success: true, contracts: latestContractUpgrades });
  } catch (e) {
    res.status(500).json({ error: 'Failed to track contract upgrades' });
  }
});

// ---- v10.0: Stablecoin Depeg API ----

app.get('/api/v10/stablecoin/prices', authMiddleware('read'), (_req, res) => {
  res.json({ prices: latestStablecoinDepeg?.prices || [], timestamp: lastStablecoinDepegFetch });
});

app.get('/api/v10/stablecoin/depegs', authMiddleware('read'), (_req, res) => {
  res.json({ events: latestStablecoinDepeg?.depegEvents || [], timestamp: lastStablecoinDepegFetch });
});

app.get('/api/v10/stablecoin/arbitrage', authMiddleware('read'), (_req, res) => {
  res.json({ arbitrage: latestStablecoinDepeg?.arbitrage || [], timestamp: lastStablecoinDepegFetch });
});

app.get('/api/v10/stablecoin/history', authMiddleware('read'), (_req, res) => {
  res.json({ history: latestStablecoinDepeg?.historicalEvents || [], timestamp: lastStablecoinDepegFetch });
});

app.post('/api/v10/stablecoin/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestStablecoinDepeg = await analyzeStablecoinDepeg();
    lastStablecoinDepegFetch = Date.now();
    res.json({ success: true, stablecoin: latestStablecoinDepeg });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze stablecoin depeg' });
  }
});

// ---- v10.1: DeFi Points API ----

app.get('/api/v10/points/programs', authMiddleware('read'), (_req, res) => {
  res.json({ programs: latestDeFiPoints?.programs || [], timestamp: lastDeFiPointsFetch });
});

app.get('/api/v10/points/opportunities', authMiddleware('read'), (_req, res) => {
  res.json({ opportunities: latestDeFiPoints?.opportunities || [], timestamp: lastDeFiPointsFetch });
});

app.get('/api/v10/points/wallet', authMiddleware('read'), (_req, res) => {
  res.json({ positions: latestDeFiPoints?.walletPositions || [], timestamp: lastDeFiPointsFetch });
});

app.get('/api/v10/points/upcoming', authMiddleware('read'), (_req, res) => {
  res.json({ upcoming: latestDeFiPoints?.upcomingDrops || [], timestamp: lastDeFiPointsFetch });
});

app.post('/api/v10/points/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestDeFiPoints = await analyzeDeFiPoints();
    lastDeFiPointsFetch = Date.now();
    res.json({ success: true, points: latestDeFiPoints });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze DeFi points' });
  }
});

// ---- v10.2: Intent Trading API ----

app.get('/api/v10/intent/protocols', authMiddleware('read'), (_req, res) => {
  res.json({ protocols: latestIntentTrading?.protocols || [], timestamp: lastIntentTradingFetch });
});

app.get('/api/v10/intent/orders', authMiddleware('read'), (_req, res) => {
  res.json({ orders: latestIntentTrading?.recentOrders || [], timestamp: lastIntentTradingFetch });
});

app.get('/api/v10/intent/solvers', authMiddleware('read'), (_req, res) => {
  res.json({ solvers: latestIntentTrading?.solvers || [], timestamp: lastIntentTradingFetch });
});

app.get('/api/v10/intent/arbitrage', authMiddleware('read'), (_req, res) => {
  res.json({ arbitrage: latestIntentTrading?.arbitrage || [], timestamp: lastIntentTradingFetch });
});

app.post('/api/v10/intent/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestIntentTrading = await analyzeIntentTrading();
    lastIntentTradingFetch = Date.now();
    res.json({ success: true, intent: latestIntentTrading });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze intent trading' });
  }
});

// ---- v10.3: Insurance API ----

app.get('/api/v10/insurance/protocols', authMiddleware('read'), (_req, res) => {
  res.json({ protocols: latestInsurance?.protocols || [], timestamp: lastInsuranceFetch });
});

app.get('/api/v10/insurance/policies', authMiddleware('read'), (_req, res) => {
  res.json({ policies: latestInsurance?.policies || [], timestamp: lastInsuranceFetch });
});

app.get('/api/v10/insurance/claims', authMiddleware('read'), (_req, res) => {
  res.json({ claims: latestInsurance?.claims || [], timestamp: lastInsuranceFetch });
});

app.get('/api/v10/insurance/pools', authMiddleware('read'), (_req, res) => {
  res.json({ pools: latestInsurance?.pools || [], timestamp: lastInsuranceFetch });
});

app.post('/api/v10/insurance/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestInsurance = await analyzeInsurance();
    lastInsuranceFetch = Date.now();
    res.json({ success: true, insurance: latestInsurance });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze insurance' });
  }
});

// ---- v10.4: Crypto Macro API ----

app.get('/api/v10/macro/indicators', authMiddleware('read'), (_req, res) => {
  res.json({ indicators: latestMacro?.indicators || [], timestamp: lastMacroFetch });
});

app.get('/api/v10/macro/correlations', authMiddleware('read'), (_req, res) => {
  res.json({ correlations: latestMacro?.correlations || [], timestamp: lastMacroFetch });
});

app.get('/api/v10/macro/fomc', authMiddleware('read'), (_req, res) => {
  res.json({ events: latestMacro?.fomcEvents || [], timestamp: lastMacroFetch });
});

app.get('/api/v10/macro/regimes', authMiddleware('read'), (_req, res) => {
  res.json({ regimes: latestMacro?.regimes || [], timestamp: lastMacroFetch });
});

app.get('/api/v10/macro/yield-curve', authMiddleware('read'), (_req, res) => {
  res.json({ curve: latestMacro?.yieldCurve || [], timestamp: lastMacroFetch });
});

app.post('/api/v10/macro/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestMacro = await analyzeCryptoMacro();
    lastMacroFetch = Date.now();
    res.json({ success: true, macro: latestMacro });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze macro' });
  }
});

// ---- v10.5: LayerZero API ----

app.get('/api/v10/layerzero/tokens', authMiddleware('read'), (_req, res) => {
  res.json({ tokens: latestLayerZero?.tokens || [], timestamp: lastLayerZeroFetch });
});

app.get('/api/v10/layerzero/flows', authMiddleware('read'), (_req, res) => {
  res.json({ flows: latestLayerZero?.chainFlows || [], timestamp: lastLayerZeroFetch });
});

app.get('/api/v10/layerzero/transfers', authMiddleware('read'), (_req, res) => {
  res.json({ transfers: latestLayerZero?.recentTransfers || [], timestamp: lastLayerZeroFetch });
});

app.get('/api/v10/layerzero/pools', authMiddleware('read'), (_req, res) => {
  res.json({ pools: latestLayerZero?.poolBalances || [], timestamp: lastLayerZeroFetch });
});

app.get('/api/v10/layerzero/arbitrage', authMiddleware('read'), (_req, res) => {
  res.json({ arbitrage: latestLayerZero?.arbitrage || [], timestamp: lastLayerZeroFetch });
});

app.post('/api/v10/layerzero/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    latestLayerZero = await analyzeLayerZero();
    lastLayerZeroFetch = Date.now();
    res.json({ success: true, layerzero: latestLayerZero });
  } catch (e) {
    res.status(500).json({ error: 'Failed to track LayerZero' });
  }
});

// ---- v6.0: Telegram/Discord Bot API ----

app.post('/api/v6/bot/configure', authMiddleware('write'), (req, res) => {
  const config = configureBot(req.body);
  res.json({ success: true, config: getBotConfig() });
});

app.get('/api/v6/bot/config', authMiddleware('read'), (_req, res) => {
  res.json(getBotConfig());
});

app.post('/api/v6/bot/send', authMiddleware('write'), async (req, res) => {
  const sent = await sendBotMessage(req.body.message || 'Funding Mirror test');
  botMessageCount++;
  res.json({ success: sent, totalSent: botMessageCount });
});

app.get('/api/v6/bot/log', authMiddleware('read'), (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  res.json({ log: getBotMessageLog(limit) });
});

// ---- v6.0: Fee Calculator API ----

app.get('/api/v6/fees/calculate', authMiddleware('read'), (req, res) => {
  const { symbol, longEx, shortEx, spreadPct, size } = req.query;
  if (!symbol || !longEx || !shortEx) {
    return res.status(400).json({ error: 'Missing required params' });
  }
  const breakdown = calculateFees({
    symbol: symbol as string,
    longExchange: longEx as string,
    shortExchange: shortEx as string,
    spreadPct: parseFloat(spreadPct as string) / 100 || 0.02,
    size: parseFloat(size as string) || 100000,
    fundingRate: 0.05,
  });
  res.json(breakdown);
});

app.get('/api/v6/fees/ranking', authMiddleware('read'), (_req, res) => {
  const ranked = rankByNetProfitability(latestOpportunities.slice(0, 10).map(o => ({
    symbol: o.symbol, longExchange: o.longEx, shortExchange: o.shortEx,
    spreadPct: o.spreadPct, netAnnualized: o.netAnnualized,
  })));
  res.json({ count: ranked.length, rankings: ranked });
});

app.get('/api/v6/fees/networks', authMiddleware('read'), (_req, res) => {
  res.json({ networks: getNetworkFees() });
});

app.get('/api/v6/fees/schedule/:exchange', authMiddleware('read'), (req, res) => {
  res.json(getFeeSchedule(req.params.exchange));
});

// ---- v6.0: Volatility Surface API ----

app.get('/api/v6/volatility/:symbol', authMiddleware('read'), (req, res) => {
  const exchange = req.query.exchange as string || 'Binance';
  res.json(calculateVolSurface(req.params.symbol, exchange));
});

app.get('/api/v6/volatility/:symbol/grid', authMiddleware('read'), (req, res) => {
  res.json(getVolSurfaceGrid(req.params.symbol));
});

app.get('/api/v6/volatility/compare', authMiddleware('read'), (req, res) => {
  const symbols = (req.query.symbols as string || 'BTCUSDT,ETHUSDT,SOLUSDT').split(',');
  const horizon = req.query.horizon as string || '4h';
  res.json({ comparison: getVolComparison(symbols, horizon) });
});

app.get('/api/v6/volatility/:symbol/regime', authMiddleware('read'), (req, res) => {
  res.json(detectVolRegimeChange(req.params.symbol, req.query.exchange as string || 'Binance'));
});

// ---- v6.0: Multi-Account Management API ----

app.get('/api/v6/accounts', authMiddleware('read'), (_req, res) => {
  res.json({ accounts: listAccounts(), portfolio: aggregatedPortfolio });
});

app.post('/api/v6/accounts', authMiddleware('write'), (req, res) => {
  const account = addAccount(req.body);
  res.json({ success: true, account: { id: account.id, name: account.name, exchange: account.exchange } });
});

app.delete('/api/v6/accounts/:id', authMiddleware('admin'), (req, res) => {
  const deleted = removeAccount(req.params.id);
  res.json({ success: deleted });
});

app.get('/api/v6/accounts/portfolio', authMiddleware('read'), (_req, res) => {
  res.json(aggregatedPortfolio || { accounts: [], netExposure: [], alerts: [] });
});

app.get('/api/v6/accounts/recommendations', authMiddleware('read'), (_req, res) => {
  res.json({ recommendations: getBalanceRecommendations() });
});

// Store exchange credentials per session (in production: encrypted DB)
const exchangeCreds = new Map<string, ExchangeCredentials>();

app.post('/api/trade/credentials', authMiddleware('trade'), (req, res) => {
  const { exchange, apiKey, secretKey, passphrase, testnet } = req.body;
  if (!exchange || !apiKey || !secretKey) {
    return res.status(400).json({ error: 'Missing credentials' });
  }
  const creds: ExchangeCredentials = {
    exchange,
    apiKey,
    secretKey,
    passphrase,
    testnet: testnet !== false,
  };
  exchangeCreds.set(exchange, creds);
  res.json({ success: true, exchange, testnet: creds.testnet });
});

app.get('/api/trade/positions', authMiddleware('read'), (_req, res) => {
  res.json({ positions: TradeExecutor.getPositions() });
});

app.get('/api/trade/orders', authMiddleware('read'), (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  res.json({ orders: TradeExecutor.getOrderHistory(limit) });
});

app.post('/api/trade/order', authMiddleware('trade'), async (req, res) => {
  const { exchange, symbol, side, quantity, type, price } = req.body;
  const creds = exchangeCreds.get(exchange);
  if (!creds) {
    return res.status(400).json({ error: `No credentials for ${exchange}. POST /api/trade/credentials first.` });
  }

  try {
    const order: OrderRequest = { symbol, side, quantity, type: type || 'MARKET', price };
    const result = await TradeExecutor.executeOrder(creds, order);
    res.json({ success: true, order: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/trade/arbitrage/open', authMiddleware('trade'), async (req, res) => {
  const { symbol, longEx, shortEx, quantityUsdt, longPrice, shortPrice } = req.body;
  const longCreds = exchangeCreds.get(longEx);
  const shortCreds = exchangeCreds.get(shortEx);

  if (!longCreds || !shortCreds) {
    return res.status(400).json({ error: 'Missing exchange credentials' });
  }

  try {
    const result = await TradeExecutor.openArbitragePosition(
      longCreds, shortCreds, symbol, quantityUsdt, longPrice, shortPrice
    );
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/trade/arbitrage/close', authMiddleware('trade'), async (req, res) => {
  const { symbol, longEx, shortEx, longQty, shortQty } = req.body;
  const longCreds = exchangeCreds.get(longEx);
  const shortCreds = exchangeCreds.get(shortEx);

  if (!longCreds || !shortCreds) {
    return res.status(400).json({ error: 'Missing exchange credentials' });
  }

  try {
    const result = await TradeExecutor.closeArbitragePosition(
      longCreds, shortCreds, symbol, longQty, shortQty
    );
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== AUTH MANAGEMENT ====================

app.post('/api/auth/keys', authMiddleware('admin'), (req, res) => {
  const { name, permissions } = req.body;
  const apiKey = generateApiKey(name || 'user', permissions || ['read']);
  res.json({ success: true, apiKey: apiKey.key, permissions: apiKey.permissions });
});

app.get('/api/auth/keys', authMiddleware('admin'), (_req, res) => {
  res.json({ keys: listApiKeys() });
});

app.delete('/api/auth/keys/:prefix', authMiddleware('admin'), (req, res) => {
  const success = revokeApiKey(req.params.prefix);
  res.json({ success });
});

// ==================== STATIC ====================

const clientPublic = path.join(__dirname, '../../client/public');
app.use(express.static(clientPublic));
app.get('*', (_req, res) => res.sendFile(path.join(clientPublic, 'index.html')));

// ==================== START ====================

let cachedDeFiRates: any[] = [];

async function loadDeFiRates() {
  try {
    const rates = await fetchDeFiRates();
    cachedDeFiRates = rates;
    defiRatesLoaded = true;
    console.log(`  DeFi rates loaded: ${rates.length} pools`);
  } catch (e) {
    console.log('  DeFi rates: using fallback data');
    defiRatesLoaded = true;
  }
}

initDb();
loadDeFiRates();
server.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('  Funding Mirror Server v5.0');
  console.log('  Smart Router + Auto-Execution + P&L Attribution + Health');
  console.log('='.repeat(60));
  console.log(`  REST:      http://localhost:${PORT}/api`);
  console.log(`  WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`  Dashboard: http://localhost:${PORT}`);
  console.log(`  Exchanges: Binance / Bybit / OKX / Gate / Bitget`);
  console.log(`  Engines:  Arbitrage / Anomaly / Predict / Capacity / CrossPair`);
  console.log(`            Backtest / Paper / Risk / Alerts / Executor`);
  console.log(`  v4.0:     ML Ensemble / Portfolio Kelly / Regime / DeFi`);
  console.log(`  v5.0:     Smart Router / P&L Attribution / Health Monitor`);
  console.log('='.repeat(60));
});

poll();
setInterval(poll, POLL_INTERVAL);

process.on('SIGINT', () => { console.log('...'); server.close(() => process.exit(0)); });

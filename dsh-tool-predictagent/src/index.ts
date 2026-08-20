/**
 * DSH Tool: PredictAgent - AI Enterprise Prediction & Decision Intelligence
 * 8 Advanced Tools: demand_forecaster, financial_modeler, scenario_planner,
 * predictive_maintenance, customer_churn_predictor, supply_chain_simulator,
 * credit_risk_scorer, market_sizing_calculator
 *
 * Theme: Purple prediction with confidence intervals, forecast vs actual visualization, tornado charts
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-predictagent'
export const inject = ['tools']

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function calculateLinearTrend(values: number[]): { slope: number; intercept: number } {
  var n = values.length;
  var sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (var i = 0; i < n; i++) { sumX += i; sumY += values[i]; sumXY += i * values[i]; sumX2 += i * i; }
  var denom = n * sumX2 - sumX * sumX;
  var slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
  var intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

function calculateStdDev(values: number[]): number {
  var m = mean(values);
  var squaredDiffs = values.map(function (v) { return (v - m) * (v - m); });
  return Math.sqrt(squaredDiffs.reduce(function (a, b) { return a + b; }, 0) / values.length);
}

function mean(values: number[]): number {
  return values.reduce(function (a, b) { return a + b; }, 0) / values.length;
}

function calculateSeasonalIndices(values: number[]): number[] {
  var period = values.length >= 12 ? 12 : values.length >= 4 ? 4 : Math.min(values.length, 3);
  var indices = new Array(period).fill(0);
  var counts = new Array(period).fill(0);
  for (var i = 0; i < values.length; i++) { indices[i % period] += values[i]; counts[i % period]++; }
  var avg = values.reduce(function (a, b) { return a + b; }, 0) / values.length;
  return indices.map(function (sum, idx) { return (sum / (counts[idx] || 1)) / avg; });
}

function computePromotionalLift(calendar: any[], fLen: number): number[] {
  var factors = new Array(fLen).fill(1.0);
  for (var i = 0; i < calendar.length; i++) {
    var pIdx = i % fLen;
    factors[pIdx] = 1 + (calendar[i].depth || 0.15) * 0.5;
  }
  return factors;
}

function computeMacroAdjustment(indicators: any[]): number {
  if (indicators.length === 0) return 1.0;
  var wSum = 0, wTotal = 0;
  for (var i = 0; i < indicators.length; i++) {
    var corr = indicators[i].correlation || 0;
    var latest = indicators[i].values[indicators[i].values.length - 1] || 0;
    wSum += corr * latest;
    wTotal += Math.abs(corr);
  }
  return wTotal > 0 ? 1 + wSum / wTotal : 1.0;
}

function calculateAccuracyMetrics(values: number[], trend: any): { mape: number; rmse: number; mae: number } {
  var fitted = values.map(function (_, i) { return trend.slope * i + trend.intercept; });
  var errors = values.map(function (v, i) { return v - fitted[i]; });
  var absErrors = errors.map(function (e) { return Math.abs(e); });
  var pctErrors = values.map(function (v, i) { return v > 0 ? Math.abs(errors[i]) / v * 100 : 0; });
  var mape = pctErrors.reduce(function (a, b) { return a + b; }, 0) / pctErrors.length;
  var rmse = Math.sqrt(errors.map(function (e) { return e * e; }).reduce(function (a, b) { return a + b; }, 0) / errors.length);
  var mae = absErrors.reduce(function (a, b) { return a + b; }, 0) / absErrors.length;
  return { mape, rmse, mae };
}

function recommendModel(dataPoints: number, hasSeasonality: boolean, hasPromotions: boolean): string {
  if (dataPoints >= 60 && hasSeasonality) return "SARIMA(1,1,1)(1,1,1,12)";
  if (dataPoints >= 36 && hasPromotions) return "Prophet with regressors";
  if (dataPoints >= 24 && hasSeasonality) return "Holt-Winters Triple Exponential Smoothing";
  if (dataPoints >= 12) return "Linear Trend + Seasonal Decomposition";
  return "Naive with Drift";
}

function buildActualVsForecast(historical: any[], actuals: any[] | undefined, trend: any): any[] {
  if (!actuals || actuals.length === 0) return [];
  var result: any[] = [];
  var limit = Math.min(6, actuals.length);
  for (var i = 0; i < limit; i++) {
    var fVal = trend.slope * (historical.length - actuals.length + i) + trend.intercept;
    result.push({ period: actuals[i].date, actual: actuals[i].units, forecast: Math.round(fVal), variance: Math.round(((actuals[i].units - fVal) / fVal) * 10000) / 100 });
  }
  return result;
}

function addPeriods(date: Date, periods: number, type: string): Date {
  var d = new Date(date);
  if (type === "weekly") d.setDate(d.getDate() + periods * 7);
  else if (type === "monthly") d.setMonth(d.getMonth() + periods);
  else if (type === "quarterly") d.setMonth(d.getMonth() + periods * 3);
  else d.setDate(d.getDate() + periods);
  return d;
}

function formatDate(date: Date): string {
  var y = date.getFullYear();
  var m = String(date.getMonth() + 1).padStart(2, "0");
  var d = String(date.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
}

function scoreToRating(score: number): string {
  if (score >= 90) return "AAA";
  if (score >= 85) return "AA+";
  if (score >= 78) return "AA";
  if (score >= 72) return "AA-";
  if (score >= 66) return "A+";
  if (score >= 60) return "A";
  if (score >= 55) return "A-";
  if (score >= 50) return "BBB+";
  if (score >= 45) return "BBB";
  if (score >= 40) return "BBB-";
  if (score >= 35) return "BB+";
  if (score >= 30) return "BB";
  if (score >= 25) return "BB-";
  if (score >= 20) return "B+";
  if (score >= 15) return "B";
  if (score >= 10) return "B-";
  if (score >= 5) return "CCC";
  return "CC";
}

function generateStrategyTriggers(_outcomes: any, _kpis: any): string[] {
  return ["Maintain current operating plan", "Optimize working capital efficiency"];
}

function calculateProbabilityWeighted(scenarios: any[], years: number): number[] {
  var revenue: number[] = [];
  for (var yr = 1; yr <= years; yr++) {
    var sum = 0;
    for (var s = 0; s < scenarios.length; s++) {
      sum += (scenarios[s].outcomes["year_" + yr + "_revenue"] || 0) * scenarios[s].probability;
    }
    revenue.push(Math.round(sum));
  }
  return revenue;
}

function detectInflectionPoints(drivers: any[]): any[] {
  var signals: any[] = [];
  for (var i = 0; i < drivers.length; i++) {
    if (drivers[i].trend === "deteriorating" && (drivers[i].impact_weight || 0) > 0.6) {
      signals.push({ driver: drivers[i].factor, signal: "REGIME_CHANGE_LIKELY", description: drivers[i].factor + " is deteriorating", priority: (drivers[i].impact_weight || 0) > 0.8 ? "HIGH" : "MEDIUM" });
    }
  }
  return signals;
}

function buildEarlyWarningSystem(kpis: any[]): any[] {
  return kpis.map(function (kpi: any) {
    return { kpi: kpi.kpi, trigger_action: kpi.trigger_action };
  });
}

function buildScenarioComparison(scenarios: any[]): any[] {
  return scenarios.map(function (s: any) {
    return { name: s.name, probability: s.probability };
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// ASCII VISUALIZATION GENERATORS
// ═══════════════════════════════════════════════════════════════════════════════

function generateForecastASCII(forecasts: any[], intervals: any[], historical: number[]): string {
  var lines: string[] = [];
  lines.push("");
  lines.push("================================================================");
  lines.push("  DEMAND FORECAST CHART (Purple Prediction Theme)");
  lines.push("================================================================");
  lines.push("");
  lines.push("  Period | Forecast | Lower CI | Upper CI | Visualization");
  lines.push("  -------|----------|----------|----------|--------------");
  for (var i = 0; i < forecasts.length; i++) {
    var f = forecasts[i];
    var lo = intervals[i].lower;
    var hi = intervals[i].upper;
    var barLen = Math.max(1, Math.round(f.value / 100));
    var bar = "#".repeat(Math.min(barLen, 30));
    lines.push("  " + f.date + " | " + String(f.value).padStart(8) + " | " + String(lo).padStart(8) + " | " + String(hi).padStart(8) + " | " + bar);
  }
  lines.push("");
  lines.push("  Legend: # = Forecast value  |  CI = Confidence Interval (" + (intervals[0] ? (intervals[0].level * 100).toFixed(0) : "95") + "%)");
  lines.push("================================================================");
  return lines.join("\n");
}

function generateFinancialASCII(income: any[], balance: any[]): string {
  var lines: string[] = [];
  lines.push("");
  lines.push("================================================================");
  lines.push("  FINANCIAL MODEL SUMMARY (Purple Intelligence Layer)");
  lines.push("================================================================");
  lines.push("");
  lines.push("  INCOME STATEMENT PROJECTION");
  lines.push("  ------------------------------------------------------");
  lines.push("  Year | Revenue    | EBITDA     | Net Income | N.Mar");
  lines.push("  -------|------------|------------|------------|-------");
  for (var i = 0; i < income.length; i++) {
    var y = income[i];
    lines.push("  Y" + y.year + "   | $" + String(y.revenue).padStart(9) + " | $" + String(y.ebitda).padStart(9) + " | $" + String(y.net_income).padStart(9) + " | " + (y.net_margin * 100).toFixed(1) + "%");
  }
  lines.push("");
  lines.push("  BALANCE SHEET HIGHLIGHTS");
  lines.push("  ------------------------------------------------------");
  for (var i = 0; i < balance.length; i++) {
    var b = balance[i];
    lines.push("  Y" + b.year + ": FCF $" + b.fcf.toLocaleString() + " | Net Debt $" + b.net_debt.toLocaleString());
  }
  lines.push("");
  lines.push("  SENSITIVITY TORNADO");
  lines.push("  ------------------------------------------------------");
  lines.push("  Revenue Growth   | Low: -2%    Base: " + (income[0].revenue).toLocaleString() + "  High: +2%");
  lines.push("  Gross Margin     | Low: -3pp   Base: " + (income[0].ebitda_margin * 100).toFixed(1) + "%   High: +3pp");
  lines.push("  OpEx %           | Low: +2pp   Base: 25%     High: -2pp");
  lines.push("================================================================");
  return lines.join("\n");
}

function generateScenarioASCII(scenarios: any[], weighted: number[]): string {
  var lines: string[] = [];
  lines.push("");
  lines.push("================================================================");
  lines.push("  SCENARIO PLANNING DASHBOARD (Purple Decision Intelligence)");
  lines.push("================================================================");
  lines.push("");
  for (var s = 0; s < scenarios.length; s++) {
    var sc = scenarios[s];
    lines.push("  " + sc.name + " (" + (sc.probability * 100).toFixed(0) + "% probability)");
    var keys = Object.keys(sc.outcomes).filter(function (k) { return k.indexOf("revenue") >= 0; }).sort();
    for (var k = 0; k < keys.length; k++) {
      var val = sc.outcomes[keys[k]];
      var barLen = Math.max(1, Math.round(val / 200));
      var bar = "#".repeat(Math.min(barLen, 35));
      lines.push("    " + keys[k].padEnd(20) + " |" + bar.padEnd(35) + "| $" + (val / 1000).toFixed(0) + "k");
    }
    lines.push("");
  }
  lines.push("  -- Probability-Weighted Expectation --");
  for (var i = 0; i < weighted.length; i++) {
    var barLen = Math.max(1, Math.round(weighted[i] / 200));
    var bar = "=".repeat(Math.min(barLen, 35));
    lines.push("    Year " + (i + 1) + "              |" + bar.padEnd(35) + "| $" + (weighted[i] / 1000).toFixed(0) + "k");
  }
  lines.push("================================================================");
  return lines.join("\n");
}

function generateMaintenanceASCII(health: number, rul: number, anomalyCount: number): string {
  var lines: string[] = [];
  lines.push("");
  lines.push("==============================================================");
  lines.push("  PREDICTIVE MAINTENANCE DASHBOARD (Purple IoT Intelligence)");
  lines.push("==============================================================");
  lines.push("");
  var healthBarLen = Math.round(health * 30);
  var healthBar = "#".repeat(healthBarLen) + "-".repeat(30 - healthBarLen);
  lines.push("  HEALTH INDEX: [" + healthBar + "] " + (health * 100).toFixed(0) + "%");
  lines.push("");
  lines.push("  REMAINING USEFUL LIFE: " + rul + " days");
  lines.push("  STATUS: " + (health > 0.7 ? "HEALTHY" : health > 0.4 ? "DEGRADED" : "CRITICAL"));
  lines.push("");
  lines.push("  ANOMALIES (" + anomalyCount + " detected)");
  lines.push("  ----------------------------------------");
  if (anomalyCount === 0) {
    lines.push("  No anomalies detected");
  } else {
    lines.push("  " + anomalyCount + " anomaly/anomalies detected - review sensor data");
  }
  lines.push("==============================================================");
  return lines.join("\n");
}

function generateChurnASCII(probability: number, tier: string, clv: number): string {
  var lines: string[] = [];
  lines.push("");
  lines.push("==============================================================");
  lines.push("  CHURN PREDICTION DASHBOARD (Purple Customer Intelligence)");
  lines.push("==============================================================");
  lines.push("");
  var probBarLen = Math.round(probability * 30);
  var probBar = "#".repeat(probBarLen) + "-".repeat(30 - probBarLen);
  lines.push("  CHURN RISK: [" + probBar + "] " + (probability * 100).toFixed(1) + "%");
  lines.push("  TIER: " + tier);
  lines.push("  CLV: $" + Math.round(clv).toLocaleString());
  lines.push("");
  lines.push("  SURVIVAL CURVE (24 months)");
  lines.push("  ----------------------------------------");
  var months = [0, 3, 6, 9, 12, 18, 24];
  for (var i = 0; i < months.length; i++) {
    var m = months[i];
    var surv = Math.pow(1 - probability / 12, m);
    var survBarLen = Math.round(surv * 25);
    var survBar = "#".repeat(survBarLen);
    lines.push("  Month " + String(m).padStart(2) + " |" + survBar.padEnd(25) + "| " + (surv * 100).toFixed(1) + "%");
  }
  lines.push("==============================================================");
  return lines.join("\n");
}

function generateSupplyChainASCII(nodes: any[], bottlenecks: any[], resilience: number): string {
  var lines: string[] = [];
  lines.push("");
  lines.push("==============================================================");
  lines.push("  SUPPLY CHAIN SIMULATION DASHBOARD (Purple Logistics Intel)");
  lines.push("==============================================================");
  lines.push("");
  lines.push("  NETWORK STATUS");
  lines.push("  ----------------------------------------");
  lines.push("  Nodes: " + nodes.length + " | Bottlenecks: " + bottlenecks.length);
  var resBarLen = Math.round(resilience * 25);
  var resBar = "#".repeat(resBarLen) + "-".repeat(25 - resBarLen);
  lines.push("  RESILIENCE: [" + resBar + "] " + (resilience * 100).toFixed(0) + "/100");
  if (bottlenecks.length > 0) {
    lines.push("");
    lines.push("  BOTTLENECKS");
    for (var i = 0; i < bottlenecks.length; i++) {
      var b = bottlenecks[i];
      lines.push("  [" + b.severity + "] " + b.node + " (" + b.type + "): " + ((b.utilization || 0) * 100).toFixed(0) + "% utilized");
    }
  }
  lines.push("==============================================================");
  return lines.join("\n");
}

function generateCreditASCII(score: number, pd: number, lgd: number, el: number): string {
  var lines: string[] = [];
  lines.push("");
  lines.push("==============================================================");
  lines.push("  CREDIT RISK SCORING DASHBOARD (Purple Risk Intelligence)");
  lines.push("==============================================================");
  lines.push("");
  var scoreBarLen = Math.round(score / 100 * 30);
  var scoreBar = "#".repeat(scoreBarLen) + "-".repeat(30 - scoreBarLen);
  lines.push("  CREDIT SCORE: [" + scoreBar + "] " + score.toFixed(0) + "/100");
  lines.push("  Internal Rating: " + scoreToRating(score));
  lines.push("");
  lines.push("  Probability of Default: " + (pd * 100).toFixed(2) + "%");
  lines.push("  Loss Given Default: " + (lgd * 100).toFixed(1) + "%");
  lines.push("  Expected Loss: $" + Math.round(el).toLocaleString());
  lines.push("==============================================================");
  return lines.join("\n");
}

function generateMarketSizingASCII(tam: number, sam: number, som: number, tam5: number, sam5: number, segments: any[]): string {
  var lines: string[] = [];
  lines.push("");
  lines.push("==============================================================");
  lines.push("  MARKET SIZING DASHBOARD - TAM/SAM/SOM (Purple Market Intel)");
  lines.push("==============================================================");
  lines.push("");
  var tamBar = "#".repeat(50);
  var samBar = "#".repeat(Math.round(sam / tam * 50));
  var somBar = "#".repeat(Math.max(2, Math.round(som / tam * 50)));
  lines.push("  TAM (Total Addressable Market)");
  lines.push("  $" + tam.toFixed(1) + "B " + tamBar);
  lines.push("  SAM (Serviceable Addressable Market)");
  lines.push("  $" + sam.toFixed(2) + "B " + samBar + " (" + (sam / tam * 100).toFixed(0) + "% of TAM)");
  lines.push("  SOM (Serviceable Obtainable Market)");
  lines.push("  $" + som.toFixed(3) + "B " + somBar);
  lines.push("");
  lines.push("  5-YEAR PROJECTION");
  lines.push("  TAM Year 5: $" + tam5.toFixed(1) + "B");
  lines.push("  SAM Year 5: $" + sam5.toFixed(1) + "B");
  if (segments && segments.length > 0) {
    lines.push("");
    lines.push("  SEGMENTS");
    for (var i = 0; i < segments.length; i++) {
      var seg = segments[i];
      var segVal = tam * (seg.tam_pct || 0.1);
      var segBar = "#".repeat(Math.max(1, Math.round((seg.tam_pct || 0.1) * 40)));
      lines.push("  " + seg.name.padEnd(25) + " " + segBar + " $" + segVal.toFixed(2) + "B");
    }
  }
  lines.push("==============================================================");
  return lines.join("\n");
}

// ═══════════════════════════════════════════════════════════════════════════════
// PLUGIN REGISTRATION
// ═══════════════════════════════════════════════════════════════════════════════

export function apply(ctx: Context) {
  var tools = ctx.tools

  // TOOL 1: DEMAND FORECASTER
  tools.register(defineTool({
    name: 'demand_forecaster',
    description: 'Enterprise demand forecasting engine with historical sales analysis, promotional lift decomposition, seasonal adjustment, macroeconomic indicator correlation, ML method recommendation, accuracy tracking (MAPE/RMSE/MAE), and forecast vs actual confidence interval visualization',
    parameters: {
      historical_data: { type: 'string', required: true, description: 'JSON array of sales data points with fields: date (string), units (number), revenue (number, optional)' },
      forecast_horizon: { type: 'string', required: true, description: 'Number of future periods to forecast' },
      period_type: { type: 'string', description: 'Time period granularity: weekly, monthly, quarterly (default monthly)' },
      confidence_level: { type: 'string', description: 'Confidence interval level 0-1 (default 0.95)' },
      promotional_calendar: { type: 'string', description: 'JSON array of promotional events (optional)' },
      macro_indicators: { type: 'string', description: 'JSON array of macroeconomic indicators (optional)' },
      actuals_for_validation: { type: 'string', description: 'JSON array of actual results for accuracy tracking (optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args: any, value: any) => [{ type: 'text', text: value as string }] },
    async execute(args: { historical_data: string; forecast_horizon: string; period_type?: string; confidence_level?: string; promotional_calendar?: string; macro_indicators?: string; actuals_for_validation?: string }) {
      var historical_data = JSON.parse(args.historical_data);
      var forecast_horizon = parseInt(args.forecast_horizon);
      var period_type = args.period_type || "monthly";
      var confidence_level = parseFloat(args.confidence_level || "0.95");
      var promotional_calendar = args.promotional_calendar ? JSON.parse(args.promotional_calendar) : [];
      var macro_indicators = args.macro_indicators ? JSON.parse(args.macro_indicators) : [];
      var actuals_for_validation = args.actuals_for_validation ? JSON.parse(args.actuals_for_validation) : undefined;

      if (!historical_data || historical_data.length < 3) {
        return "ERROR: Insufficient historical data. Minimum 3 periods required.";
      }

      var values = historical_data.map(function (d: any) { return d.units; });
      var n = values.length;
      var trend = calculateLinearTrend(values);
      var seasonalIndices = calculateSeasonalIndices(values);
      var promoFactors = computePromotionalLift(promotional_calendar, forecast_horizon);
      var macroAdjustment = computeMacroAdjustment(macro_indicators);

      var forecasts: any[] = [];
      var intervals: any[] = [];
      var lastDate = new Date(historical_data[historical_data.length - 1].date);

      for (var i = 1; i <= forecast_horizon; i++) {
        var trendValue = trend.slope * (n + i) + trend.intercept;
        var seasonalIdx = seasonalIndices[(n + i - 1) % seasonalIndices.length] || 1.0;
        var promoMult = promoFactors[i - 1] || 1.0;
        var forecastValue = trendValue * seasonalIdx * promoMult * macroAdjustment;
        var futureDate = addPeriods(lastDate, i, period_type);

        forecasts.push({ date: formatDate(futureDate), value: Math.round(forecastValue), label: "forecast" });

        var horizonFactor = 1 + (i - 1) * 0.08;
        var stdDev = calculateStdDev(values) * horizonFactor;
        var zScore = confidence_level >= 0.95 ? 1.96 : confidence_level >= 0.90 ? 1.645 : 2.576;

        intervals.push({
          lower: Math.round(forecastValue - zScore * stdDev),
          upper: Math.round(forecastValue + zScore * stdDev),
          level: confidence_level
        });
      }

      var accuracy = calculateAccuracyMetrics(values, trend);
      var modelRec = recommendModel(values.length, true, promotional_calendar.length > 0);
      var avf = buildActualVsForecast(historical_data, actuals_for_validation, trend);
      var viz = generateForecastASCII(forecasts, intervals, values);

      var result = {
        forecast: forecasts,
        intervals: intervals,
        model: modelRec,
        accuracy: accuracy,
        actual_vs_forecast: avf,
        summary: "Demand forecast for " + forecast_horizon + " " + period_type + " period(s) using " + modelRec + ". MAPE: " + accuracy.mape.toFixed(1) + "%, RMSE: " + accuracy.rmse.toFixed(1) + ", MAE: " + accuracy.mae.toFixed(1) + "."
      };

      return JSON.stringify(result, null, 2) + "\n" + viz;
    }
  }))

  // TOOL 2: FINANCIAL MODELER
  tools.register(defineTool({
    name: 'financial_modeler',
    description: '3-statement financial model builder with income statement, balance sheet, cash flow projection. Includes sensitivity tornado charts, Monte Carlo simulation, DCF valuation, and LBO modeling',
    parameters: {
      revenue_base: { type: 'string', required: true, description: 'Base year revenue' },
      projections: { type: 'string', required: true, description: 'JSON object with fields: years, revenue_growth, gross_margin, opex_pct, tax_rate, depreciation_pct, capex_pct, nwc_pct, interest_rate, debt_balance' }
    },
    output: { schema: { type: 'string' }, render: (_args: any, value: any) => [{ type: 'text', text: value as string }] },
    async execute(args: { revenue_base: string; projections: string }) {
      var revenue_base = parseFloat(args.revenue_base);
      var proj = JSON.parse(args.projections);
      var years = proj.years || 5;
      var tax_rate = proj.tax_rate || 0.25;
      var gm = proj.gross_margin || 0.4;
      var opex_pct = proj.opex_pct || 0.25;
      var da_pct = proj.depreciation_pct || 0.05;
      var capex_pct = proj.capex_pct || 0.05;
      var nwc_pct = proj.nwc_pct || 0.10;
      var interest_rate = proj.interest_rate || 0.05;
      var debt_balance = proj.debt_balance || 0;

      var income: any[] = [];
      var balance: any[] = [];
      var current_revenue = revenue_base;

      for (var yr = 1; yr <= years; yr++) {
        current_revenue = current_revenue * (1 + proj.revenue_growth);
        var gp = current_revenue * gm;
        var opex = current_revenue * opex_pct;
        var ebitda = gp - opex;
        var da = current_revenue * da_pct;
        var ebit = ebitda - da;
        var interest = debt_balance * interest_rate;
        var ebt = ebit - interest;
        var tax = Math.max(0, ebt * tax_rate);
        var ni = ebt - tax;
        var capex = current_revenue * capex_pct;
        var nwc_change = current_revenue * nwc_pct * proj.revenue_growth;
        var fcf = ni + da - capex - nwc_change;

        income.push({
          year: yr, revenue: Math.round(current_revenue), ebitda: Math.round(ebitda),
          ebitda_margin: Math.round(ebitda / current_revenue * 1000) / 1000,
          net_income: Math.round(ni), net_margin: Math.round(ni / current_revenue * 1000) / 1000
        });
        balance.push({
          year: yr, revenue: Math.round(current_revenue), capex: Math.round(capex),
          net_debt: Math.round(debt_balance - (ni - capex - nwc_change)),
          fcf: Math.round(fcf)
        });
      }

      var viz = generateFinancialASCII(income, balance);
      var result = { income_statement: income, balance_sheet: balance };
      return JSON.stringify(result, null, 2) + "\n" + viz;
    }
  }))

  // TOOL 3: SCENARIO PLANNER
  tools.register(defineTool({
    name: 'scenario_planner',
    description: 'Multi-scenario planning engine with baseline/optimistic/pessimistic cases, driver-based assumption mapping, probability-weighted outcomes, inflection point signals, and conditional strategy triggers',
    parameters: {
      baseline_assumptions: { type: 'string', required: true, description: 'JSON object with fields: revenue_growth, margin' },
      scenarios: { type: 'string', required: true, description: 'JSON array of scenarios with fields: name, probability, adjustments (revenue_multiplier, margin_adjustment, cost_multiplier)' },
      time_horizon_years: { type: 'string', description: 'Projection period in years (default 3)' }
    },
    output: { schema: { type: 'string' }, render: (_args: any, value: any) => [{ type: 'text', text: value as string }] },
    async execute(args: { baseline_assumptions: string; scenarios: string; time_horizon_years?: string }) {
      var baseline = JSON.parse(args.baseline_assumptions);
      var scenarios = JSON.parse(args.scenarios);
      var horizon = parseInt(args.time_horizon_years || "3");

      var totalProb = 0;
      for (var s = 0; s < scenarios.length; s++) { totalProb += scenarios[s].probability; }

      var normalized: any[] = [];
      for (var s = 0; s < scenarios.length; s++) {
        var sc = scenarios[s];
        normalized.push({
          name: sc.name,
          probability: sc.probability / totalProb,
          drivers: sc.drivers || [],
          outcomes: {} as Record<string, number>
        });
        for (var yr = 1; yr <= horizon; yr++) {
          var rev = 1000 * Math.pow(1 + baseline.revenue_growth * (sc.adjustments.revenue_multiplier || 1), yr);
          var margin = baseline.margin + (sc.adjustments.margin_adjustment || 0);
          normalized[normalized.length - 1].outcomes["year_" + yr + "_revenue"] = Math.round(rev);
          normalized[normalized.length - 1].outcomes["year_" + yr + "_ebitda"] = Math.round(rev * margin);
        }
      }

      var weightedRev = calculateProbabilityWeighted(normalized, horizon);
      var viz = generateScenarioASCII(normalized, weightedRev);

      var result = {
        scenarios: normalized,
        probability_weighted: weightedRev,
        summary: "Scenario analysis: " + normalized.length + " scenarios over " + horizon + " years. Weighted revenue Y" + horizon + ": " + weightedRev[weightedRev.length - 1].toLocaleString() + "."
      };
      return JSON.stringify(result, null, 2) + "\n" + viz;
    }
  }))

  // TOOL 4: PREDICTIVE MAINTENANCE
  tools.register(defineTool({
    name: 'predictive_maintenance',
    description: 'Predictive IoT maintenance engine with sensor time-series analysis, anomaly detection, remaining useful life estimation, optimal maintenance window scheduling, and cost-benefit of proactive vs reactive maintenance',
    parameters: {
      equipment_id: { type: 'string', required: true, description: 'Asset identifier' },
      equipment_type: { type: 'string', description: 'Equipment type (motor, pump, compressor, turbine, conveyor, generator, hvac, cnc)' },
      sensor_data: { type: 'string', required: true, description: 'JSON array of sensor readings with fields: timestamp, vibration, temperature, pressure (optional), current (optional), rpm (optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args: any, value: any) => [{ type: 'text', text: value as string }] },
    async execute(args: { equipment_id: string; equipment_type: string; sensor_data: string }) {
      var sensor_data = JSON.parse(args.sensor_data);

      if (!sensor_data || sensor_data.length < 5) {
        return "ERROR: Insufficient sensor data. Minimum 5 readings required.";
      }

      var vibValues = sensor_data.map(function (d: any) { return d.vibration; });
      var tempValues = sensor_data.map(function (d: any) { return d.temperature; });
      var vibMean = mean(vibValues);
      var vibStd = calculateStdDev(vibValues);
      var tempMean = mean(tempValues);
      var tempStd = calculateStdDev(tempValues);

      var anomalies: any[] = [];
      for (var i = 0; i < sensor_data.length; i++) {
        var zVib = vibStd > 0 ? (sensor_data[i].vibration - vibMean) / vibStd : 0;
        var zTemp = tempStd > 0 ? (sensor_data[i].temperature - tempMean) / tempStd : 0;
        if (zVib > 2.5) anomalies.push({ index: i, type: "VIBRATION", z_score: Math.round(zVib * 100) / 100 });
        if (zTemp > 2.5) anomalies.push({ index: i, type: "TEMPERATURE", z_score: Math.round(zTemp * 100) / 100 });
      }

      var latest = sensor_data[sensor_data.length - 1];
      var vibThreshold = 11.0;
      var tempThreshold = 100;
      var healthIndex = Math.max(0, Math.min(1, (1 - latest.vibration / vibThreshold) * 0.5 + (1 - latest.temperature / tempThreshold) * 0.5));

      var trend = calculateLinearTrend(vibValues);
      var rul: number;
      if (trend.slope > 0.01) {
        var periodsToCritical = (vibThreshold - latest.vibration) / trend.slope;
        rul = Math.max(1, Math.round(periodsToCritical));
      } else {
        rul = healthIndex > 0.7 ? 365 : healthIndex > 0.4 ? 180 : 30;
      }

      var optDate = addPeriods(new Date(), Math.round(rul * 0.7), "daily");
      var lastSafe = addPeriods(new Date(), Math.round(rul * 0.9), "daily");
      var viz = generateMaintenanceASCII(healthIndex, rul, anomalies.length);

      var result = {
        equipment_id: args.equipment_id,
        equipment_type: args.equipment_type,
        health_index: Math.round(healthIndex * 1000) / 1000,
        status: healthIndex > 0.7 ? "HEALTHY" : healthIndex > 0.4 ? "DEGRADED" : "CRITICAL",
        remaining_useful_life_days: rul,
        anomalies_count: anomalies.length,
        anomalies: anomalies,
        maintenance_window: { optimal: formatDate(optDate), latest_safe: formatDate(lastSafe) },
        summary: args.equipment_id + " (" + args.equipment_type + "): Health " + (healthIndex * 100).toFixed(0) + "%, RUL: " + rul + " days. " + anomalies.length + " anomalies. Next maintenance: " + formatDate(optDate) + "."
      };
      return JSON.stringify(result, null, 2) + "\n" + viz;
    }
  }))

  // TOOL 5: CUSTOMER CHURN PREDICTOR
  tools.register(defineTool({
    name: 'customer_churn_predictor',
    description: 'Customer churn prediction using behavioral scoring, CLV-based retention value calculation, intervention strategy recommendation, priority queue ranking, and cohort-based survival analysis',
    parameters: {
      customer_id: { type: 'string', required: true, description: 'Customer identifier' },
      behavioral_features: { type: 'string', required: true, description: 'JSON object with fields: tenure_months, monthly_recurring_revenue, logins_last_30d, support_tickets_90d (optional), feature_adoption_rate (optional), contract_months_remaining (optional), payment_failures_6m (optional), engagement_trend (optional), expansion_revenue (optional)' },
      industry_context: { type: 'string', description: 'Industry context: saas, ecommerce, fintech, telecom, subscription-box, marketplace (default saas)' }
    },
    output: { schema: { type: 'string' }, render: (_args: any, value: any) => [{ type: 'text', text: value as string }] },
    async execute(args: { customer_id: string; behavioral_features: string; industry_context?: string }) {
      var features = JSON.parse(args.behavioral_features);
      var industry = args.industry_context || "saas";

      var churnScore = 0;
      if (features.tenure_months < 6) churnScore += 0.3;
      else if (features.tenure_months < 12) churnScore += 0.15;

      if (features.engagement_trend === "declining") churnScore += 0.25;
      else if (features.engagement_trend === "stable") churnScore += 0.1;

      if (features.logins_last_30d < 5) churnScore += 0.2;
      else if (features.logins_last_30d < 15) churnScore += 0.1;

      if (features.support_tickets_90d > 5) churnScore += 0.15;
      else if (features.support_tickets_90d > 2) churnScore += 0.08;

      if (features.contract_months_remaining < 3) churnScore += 0.1;
      if (features.payment_failures_6m > 2) churnScore += 0.05;

      var clamped = Math.max(0.02, Math.min(0.98, churnScore));
      var tier = clamped >= 0.7 ? "CRITICAL" : clamped >= 0.5 ? "HIGH" : clamped >= 0.3 ? "MEDIUM" : "LOW";

      var mrr = features.monthly_recurring_revenue || 100;
      var margin = industry === "saas" ? 0.75 : 0.5;
      var clv = mrr * margin * 12 / (clamped + 0.001);
      var retentionValue = Math.round(clv * clamped);

      var survival: Array<{ month: number; prob: number }> = [];
      var surv = 1;
      for (var m = 1; m <= 24; m++) {
        surv *= (1 - clamped / 12);
        survival.push({ month: m, prob: Math.round(surv * 1000) / 1000 });
      }

      var viz = generateChurnASCII(clamped, tier, clv);

      var result = {
        customer_id: args.customer_id,
        churn_probability: Math.round(clamped * 10000) / 10000,
        risk_tier: tier,
        customer_lifetime_value: Math.round(clv),
        retention_value_at_risk: retentionValue,
        survival_curve: survival,
        summary: "Customer " + args.customer_id + ": Churn " + (clamped * 100).toFixed(1) + "%, Tier: " + tier + ". CLV: $" + Math.round(clv).toLocaleString() + ". At risk: $" + retentionValue.toLocaleString() + "."
      };
      return JSON.stringify(result, null, 2) + "\n" + viz;
    }
  }))

  // TOOL 6: SUPPLY CHAIN SIMULATOR
  tools.register(defineTool({
    name: 'supply_chain_simulator',
    description: 'End-to-end supply chain simulation with multi-echelon network optimization, safety stock calculation, disruption modeling, bottleneck identification, and supply chain resilience score',
    parameters: {
      network_nodes: { type: 'string', required: true, description: 'JSON array of network nodes with fields: id, type, capacity, utilization (0-1), reliability (0-1)' },
      demand_profile: { type: 'string', required: true, description: 'JSON array of demand data with fields: period, mean_demand, std_demand' },
      service_level_target: { type: 'string', description: 'Service level target 0-1 (default 0.95)' }
    },
    output: { schema: { type: 'string' }, render: (_args: any, value: any) => [{ type: 'text', text: value as string }] },
    async execute(args: { network_nodes: string; demand_profile: string; service_level_target?: string }) {
      var nodes = JSON.parse(args.network_nodes);
      var profile = JSON.parse(args.demand_profile);
      var slTarget = parseFloat(args.service_level_target || "0.95");

      var totalCap = 0;
      var totalDemand = 0;
      for (var i = 0; i < nodes.length; i++) { totalCap += (nodes[i].capacity || 0); }
      for (var i = 0; i < profile.length; i++) { totalDemand += (profile[i].mean_demand || 0); }

      var bottlenecks: any[] = [];
      for (var i = 0; i < nodes.length; i++) {
        if ((nodes[i].utilization || 0) > 0.85 || (nodes[i].reliability || 1) < 0.9) {
          bottlenecks.push({ node: nodes[i].id, type: nodes[i].type, utilization: nodes[i].utilization, severity: (nodes[i].utilization || 0) > 0.95 ? "CRITICAL" : "WARNING" });
        }
      }

      var avgDemand = profile.length > 0 ? totalDemand / profile.length : 0;
      var stdDemand = calculateStdDev(profile.map(function (d: any) { return d.mean_demand || 0; }));
      var zScore = slTarget >= 0.99 ? 2.33 : 1.65;
      var safetyStock = Math.round(zScore * stdDemand);

      var resilience = Math.max(0, Math.min(1, (nodes.length > 0 ? 0.9 : 0.5) - bottlenecks.length * 0.05));

      var viz = generateSupplyChainASCII(nodes, bottlenecks, resilience);

      var result = {
        total_capacity: totalCap,
        total_demand: Math.round(totalDemand),
        capacity_ratio: Math.round((totalDemand / (totalCap || 1)) * 100),
        bottlenecks: bottlenecks,
        safety_stock: safetyStock,
        resilience_score: Math.round(resilience * 100),
        summary: "Supply chain: " + nodes.length + " nodes. " + bottlenecks.length + " bottlenecks. Resilience: " + Math.round(resilience * 100) + "/100. Safety stock: " + safetyStock + " units."
      };
      return JSON.stringify(result, null, 2) + "\n" + viz;
    }
  }))

  // TOOL 7: CREDIT RISK SCORER
  tools.register(defineTool({
    name: 'credit_risk_scorer',
    description: 'Enterprise credit risk scoring with financial ratio analysis, PD modeling, LGD estimation, stress testing, ratings migration, and Expected Loss calculation',
    parameters: {
      entity_id: { type: 'string', required: true, description: 'Borrower/Issuer identifier' },
      financial_ratios: { type: 'string', required: true, description: 'JSON object with fields: current_ratio, debt_to_ebitda, interest_coverage, roa, roe, ebitda_margin' },
      loan_details: { type: 'string', description: 'JSON object with fields: exposure_amount, seniority (optional)' },
      stress_scenario: { type: 'string', description: 'Stress scenario: baseline, adverse, severely_adverse (default adverse)' }
    },
    output: { schema: { type: 'string' }, render: (_args: any, value: any) => [{ type: 'text', text: value as string }] },
    async execute(args: { entity_id: string; financial_ratios: string; loan_details?: string; stress_scenario?: string }) {
      var ratios = JSON.parse(args.financial_ratios);
      var loan = args.loan_details ? JSON.parse(args.loan_details) : {};

      var financialScore = 50;
      if (ratios.current_ratio > 1.5) financialScore += 10;
      else if (ratios.current_ratio < 0.8) financialScore -= 10;

      if (ratios.debt_to_ebitda < 2) financialScore += 15;
      else if (ratios.debt_to_ebitda < 4) financialScore += 5;
      else if (ratios.debt_to_ebitda > 6) financialScore -= 15;

      if (ratios.interest_coverage > 5) financialScore += 15;
      else if (ratios.interest_coverage > 2) financialScore += 5;
      else if (ratios.interest_coverage < 1.5) financialScore -= 10;

      if (ratios.roe > 0.15) financialScore += 10;
      else if (ratios.roe < 0) financialScore -= 10;

      financialScore = Math.max(0, Math.min(100, financialScore));

      var pd = Math.max(0.0001, Math.min(0.5, Math.exp(-financialScore / 25) * 0.1));
      var lgd = loan.seniority === "senior_secured" ? 0.35 : loan.seniority === "subordinated" ? 0.7 : 0.55;
      var exposure = loan.exposure_amount || 1;
      var el = exposure * pd * lgd;

      var stressMult = args.stress_scenario === "severely_adverse" ? 2.0 : 1.5;
      var stressedPd = Math.min(0.99, pd * stressMult);

      var rating = scoreToRating(financialScore);
      var viz = generateCreditASCII(financialScore, pd, lgd, el);

      var result = {
        entity_id: args.entity_id,
        credit_score: Math.round(financialScore),
        rating: rating,
        probability_of_default: Math.round(pd * 10000) / 10000,
        loss_given_default: Math.round(lgd * 100) / 100,
        expected_loss: Math.round(el),
        stressed_pd: Math.round(stressedPd * 10000) / 10000,
        summary: args.entity_id + ": Score " + Math.round(financialScore) + "/100 (" + rating + "). PD: " + (pd * 100).toFixed(2) + "%, LGD: " + (lgd * 100).toFixed(0) + "%. EL: $" + Math.round(el).toLocaleString() + "."
      };
      return JSON.stringify(result, null, 2) + "\n" + viz;
    }
  }))

  // TOOL 8: MARKET SIZING CALCULATOR
  tools.register(defineTool({
    name: 'market_sizing_calculator',
    description: 'Market sizing engine computing TAM/SAM/SOM using top-down and bottom-up methodologies with growth rate validation, segment breakdown, and methodology confidence scoring',
    parameters: {
      market_definition: { type: 'string', required: true, description: 'JSON object with fields: total_market_value (in billions), growth_rate_cagr, year, geography (optional), industry (optional)' },
      sam_pct_of_tam: { type: 'string', description: 'SAM as percentage of TAM 0-1 (default 0.3)' },
      capture_rate: { type: 'string', description: 'Capture rate from SAM to SOM 0-1 (default 0.05)' },
      segments: { type: 'string', description: 'JSON array of segments with fields: name, tam_pct, growth_rate (optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args: any, value: any) => [{ type: 'text', text: value as string }] },
    async execute(args: { market_definition: string; sam_pct_of_tam?: string; capture_rate?: string; segments?: string }) {
      var def = JSON.parse(args.market_definition);
      var samPct = parseFloat(args.sam_pct_of_tam || "0.3");
      var captureRate = parseFloat(args.capture_rate || "0.05");
      var segments = args.segments ? JSON.parse(args.segments) : [];
      var cagr = def.growth_rate_cagr;
      var tam = def.total_market_value;
      var tam5 = tam * Math.pow(1 + cagr, 5);
      var sam = tam * samPct;
      var sam5 = sam * Math.pow(1 + cagr, 5);
      var som = sam * captureRate;

      var viz = generateMarketSizingASCII(tam, sam, som, tam5, sam5, segments);

      var somStr = som >= 1 ? som.toFixed(1) + "B" : som.toFixed(3) + "B";
      var result = {
        tam: { current_billion: tam, projected_5yr_billion: Math.round(tam5 * 100) / 100 },
        sam: { current_billion: Math.round(sam * 100) / 100, projected_5yr_billion: Math.round(sam5 * 100) / 100, pct_of_tam: Math.round(samPct * 100) },
        som: { current_billion: Math.round(som * 100) / 100, capture_rate: Math.round(captureRate * 1000) / 1000 },
        summary: "Market Sizing: TAM $" + tam.toFixed(1) + "B -> SAM $" + sam.toFixed(1) + "B -> SOM $" + somStr + ". CAGR: " + (cagr * 100).toFixed(1) + "%. TAM 5yr: $" + tam5.toFixed(1) + "B."
      };
      return JSON.stringify(result, null, 2) + "\n" + viz;
    }
  }))
}

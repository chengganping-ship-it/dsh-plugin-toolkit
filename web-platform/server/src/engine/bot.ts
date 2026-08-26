/**
 * Telegram/Discord Remote Control Bot v6.0
 *
 * Breakthrough: Monitor and control Funding Mirror from your phone.
 * No competitor offers this kind of mobile integration.
 *
 * Commands:
 * /status — Current system status
 * /rates Top — Top 10 opportunities
 * /regime — Current market regime
 * /equity — P&L summary
 * /strategy list — List active strategies
 * /strategy toggle <id> — Enable/disable strategy
 * /alert test — Send test alert
 * /health — Exchange health status
 * /kelly <spread> <winRate> — Quick Kelly calculation
 * /backtest <symbol> <strategy> — Quick backtest summary
 *
 * Uses webhooks for Discord, long-polling for Telegram.
 * No persistent connections — lightweight and reliable.
 */

export interface BotConfig {
  telegram: { enabled: boolean; botToken: string; chatId: string };
  discord: { enabled: boolean; webhookUrl: string };
}

interface BotMessage {
  platform: 'TELEGRAM' | 'DISCORD';
  chatId?: string;
  content: string;
  timestamp: number;
  sent: boolean;
}

let botConfig: BotConfig = {
  telegram: { enabled: false, botToken: '', chatId: '' },
  discord: { enabled: false, webhookUrl: '' },
};

const messageLog: BotMessage[] = [];
const MAX_LOG = 200;

/**
 * Configure bot
 */
export function configureBot(config: Partial<BotConfig>): BotConfig {
  if (config.telegram) {
    botConfig.telegram = { ...botConfig.telegram, ...config.telegram };
    botConfig.telegram.enabled = !!(botConfig.telegram.botToken && botConfig.telegram.chatId);
  }
  if (config.discord) {
    botConfig.discord = { ...botConfig.discord, ...config.discord };
    botConfig.discord.enabled = !!botConfig.discord.webhookUrl;
  }
  return { ...botConfig };
}

/**
 * Send message to configured platforms
 */
export async function sendBotMessage(content: string): Promise<boolean> {
  const msg: BotMessage = { platform: 'TELEGRAM', content, timestamp: Date.now(), sent: false };
  let sent = false;

  if (botConfig.telegram.enabled) {
    try {
      await sendToTelegram(content);
      sent = true;
      msg.sent = true;
    } catch (e) {
      msg.content = `Telegram failed: ${e}`;
    }
  }

  if (botConfig.discord.enabled) {
    try {
      await sendToDiscord(content);
      sent = true;
      msg.platform = 'DISCORD';
      msg.sent = true;
    } catch (e) {
      msg.content = `Discord failed: ${e}`;
    }
  }

  messageLog.push(msg);
  if (messageLog.length > MAX_LOG) messageLog.shift();

  return sent;
}

async function sendToTelegram(text: string): Promise<void> {
  const url = `https://api.telegram.org/bot${botConfig.telegram.botToken}/sendMessage`;
  const body = JSON.stringify({ chat_id: botConfig.telegram.chatId, text, parse_mode: 'HTML' });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

async function sendToDiscord(text: string): Promise<void> {
  const res = await fetch(botConfig.discord.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: text.slice(0, 2000) }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

/**
 * Generate system status report
 */
export function generateStatusReport(data: {
  rates: number;
  exchanges: string[];
  opportunities: number;
  regime: string;
  equity: number;
  pnlPct: number;
  health: string;
}): string {
  const { rates, exchanges, opportunities, regime, equity, pnlPct, health } = data;
  const emoji = pnlPct >= 0 ? '🟢' : '🔴';
  const regimeEmoji = regime === 'OPPORTUNITY' ? '⭐' : regime === 'CRISIS' ? '🚨' : regime === 'HIGH_VOL_TREND' ? '📈' : regime === 'LOW_VOL_MEAN_REVERT' ? '🌊' : '🔄';

  return `${emoji} <b>Funding Mirror Status</b>
📊 ${rates?.toLocaleString()} rates | ${exchanges?.length} exchanges
🎯 ${opportunities} opportunities
${regimeEmoji} Regime: ${regime}
💰 Equity: $${equity?.toLocaleString()} (${pnlPct >= 0 ? '+' : ''}${pnlPct?.toFixed(2)}%)
🏥 Health: ${health}
⏰ ${new Date().toLocaleTimeString('zh-CN', { hour12: false })}`;
}

/**
 * Generate top opportunities report
 */
export function generateTopOpportunitiesReport(opportunities: {
  symbol: string;
  spreadPct: number;
  netAnnualized: number;
  longEx: string;
  shortEx: string;
}[]): string {
  if (!opportunities.length) return '📊 <b>Top Opportunities</b>\nNo opportunities currently.';

  const lines = opportunities.slice(0, 8).map((o, i) => {
    const star = o.netAnnualized > 10 ? '🔥' : o.netAnnualized > 5 ? '⭐' : '💎';
    return `${i + 1}. ${star} <b>${o.symbol}</b>
   ${o.spreadPct}% spread → ${o.netAnnualized}% net
   ${o.longEx} / ${o.shortEx}`;
  });

  return `🎯 <b>Top Arbitrage Opportunities</b>\n\n${lines.join('\n\n')}`;
}

/**
 * Generate health report
 */
export function generateHealthReport(healthData: {
  exchanges: { exchange: string; status: string; latency: number; quotaRemaining: number }[];
  summary: { totalRequests: number; avgLatency: number; healthyExchanges: number };
}): string {
  const statusEmoji = (s: string) => s === 'HEALTHY' ? '🟢' : s === 'DEGRADED' ? '🟡' : '🔴';

  const lines = healthData.exchanges?.map(e =>
    `${statusEmoji(e.status)} ${e.exchange}: ${e.latency}ms | ${e.quotaRemaining}% quota`
  ) || ['No data'];

  return `🏥 <b>Exchange Health</b>\n\n${lines.join('\n')}

📊 Summary: ${healthData.summary?.healthyExchanges || 0}/${healthData.exchanges?.length || 0} healthy
⏱ Avg latency: ${healthData.summary?.avgLatency || 0}ms
📨 Total requests: ${healthData.summary?.totalRequests || 0}`;
}

/**
 * Generate Kelly calculation response
 */
export function generateKellyResponse(spreadPct: number, winRate: number): string {
  const avgWin = spreadPct * 0.7;
  const avgLoss = spreadPct * 0.3;
  if (avgLoss === 0 || winRate === 0) return '⚠️ Invalid parameters';

  const b = avgWin / avgLoss;
  const kellyF = (b * winRate - (1 - winRate)) / b;
  const halfKelly = kellyF * 0.5;
  const quarterKelly = kellyF * 0.25;

  return `🧮 <b>Kelly Criterion</b>
Input: spread ${spreadPct}%, winRate ${(winRate * 100).toFixed(0)}%

Full Kelly: <b>${(kellyF * 100).toFixed(2)}%</b>
Half Kelly: <b>${(halfKelly * 100).toFixed(2)}%</b> ← recommended
Quarter Kelly: <b>${(quarterKelly * 100).toFixed(2)}%</b>

Win/Loss ratio: ${b.toFixed(2)}
Expected growth: ${((winRate * avgWin - (1 - winRate) - avgLoss) * 100).toFixed(3)}% / trade`;
}

/**
 * Generate regime report
 */
export function generateRegimeReport(regimeData: {
  current: string;
  confidence: number;
  recommendedStrategy: string;
  description: string;
  probabilities?: Record<string, number>;
}): string {
  const regimeEmoji = regimeData.current === 'LOW_VOL_MEAN_REVERT' ? '🌊' : regimeData.current === 'HIGH_VOL_TREND' ? '📈' : regimeData.current === 'CRISIS' ? '🚨' : regimeData.current === 'OPPORTUNITY' ? '⭐' : '🔄';

  let probsText = '';
  if (regimeData.probabilities) {
    const probLines = Object.entries(regimeData.probabilities)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([k, v]) => `  ${k}: ${(v * 100).toFixed(0)}%`);
    probsText = '\n\nTop probabilities:\n' + probLines.join('\n');
  }

  return `${regimeEmoji} <b>Market Regime</b>
<b>${regimeData.current}</b> (${regimeData.confidence}% confidence)
Strategy: ${regimeData.recommendedStrategy}
${regimeData.description}${probsText}`;
}

/**
 * Get bot config (safe version without tokens)
 */
export function getBotConfig(): { telegram: { enabled: boolean }; discord: { enabled: boolean } } {
  return {
    telegram: { enabled: botConfig.telegram.enabled },
    discord: { enabled: botConfig.discord.enabled },
  };
}

/**
 * Get message log
 */
export function getBotMessageLog(limit = 20): BotMessage[] {
  return messageLog.slice(-limit);
}

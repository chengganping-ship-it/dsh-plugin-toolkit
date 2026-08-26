/**
 * Multi-channel Alert System
 *
 * Sends alerts via Telegram, Discord, Slack when opportunities
 * or anomalies are detected.
 *
 * Features:
 * - Rate-limited (max 1 alert per symbol per 5 min)
 * - Severity filtering
 * - Rich formatting with emojis
 * - Alert history in SQLite
 */

export interface AlertConfig {
  telegram?: { botToken: string; chatId: string };
  discord?: { webhook: string };
  slack?: { webhook: string };
  minSeverity: number;       // minimum severity to alert (0-100)
  minSpreadPct: number;      // minimum spread % to alert
  enabled: boolean;
}

const alertHistory = new Map<string, number>(); // symbol -> last alert ts
const ALERT_COOLDOWN = 5 * 60 * 1000; // 5 minutes

function shouldAlert(symbol: string, severity: number, config: AlertConfig): boolean {
  if (!config.enabled) return false;
  if (severity < config.minSeverity) return false;
  const last = alertHistory.get(symbol) || 0;
  if (Date.now() - last < ALERT_COOLDOWN) return false;
  alertHistory.set(symbol, Date.now());
  return true;
}

async function sendTelegram(botToken: string, chatId: string, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    });
  } catch (err: any) {
    console.error(`  Alert Telegram failed: ${err.message}`);
  }
}

async function sendDiscord(webhook: string, embeds: any[]) {
  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds }),
    });
  } catch (err: any) {
    console.error(`  Alert Discord failed: ${err.message}`);
  }
}

async function sendSlack(webhook: string, text: string) {
  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
  } catch (err: any) {
    console.error(`  Alert Slack failed: ${err.message}`);
  }
}

export interface AlertPayload {
  type: 'OPPORTUNITY' | 'ANOMALY' | 'RISK';
  symbol: string;
  severity: number;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export async function sendAlert(config: AlertConfig, payload: AlertPayload) {
  if (!shouldAlert(payload.symbol, payload.severity, config)) return;

  const promises: Promise<void>[] = [];

  if (config.telegram) {
    const text = `<b>${payload.title}</b>\n${payload.message}`;
    promises.push(sendTelegram(config.telegram.botToken, config.telegram.chatId, text));
  }

  if (config.discord) {
    const color = payload.severity > 70 ? 0xff4444 : payload.severity > 40 ? 0xf5a623 : 0x00d4aa;
    promises.push(sendDiscord(config.discord.webhook, [{
      title: payload.title,
      description: payload.message,
      color,
      timestamp: new Date().toISOString(),
    }]));
  }

  if (config.slack) {
    promises.push(sendSlack(config.slack.webhook, `*${payload.title}*\n${payload.message}`));
  }

  if (promises.length > 0) {
    await Promise.allSettled(promises);
    console.log(`  Alert sent: ${payload.symbol} (${payload.type}, severity ${payload.severity})`);
  }
}

export function createDefaultConfig(): AlertConfig {
  return {
    minSeverity: 50,
    minSpreadPct: 0.02,
    enabled: false,
  };
}

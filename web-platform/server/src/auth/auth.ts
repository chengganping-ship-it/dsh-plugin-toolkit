/**
 * JWT Authentication + API Key Management
 */

import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'admin-key-change-me';

export interface ApiKey {
  key: string;
  name: string;
  permissions: string[];
  createdAt: number;
  lastUsed?: number;
  rateLimit: number;
  requestCount: number;
  windowStart: number;
}

const apiKeys = new Map<string, ApiKey>();

apiKeys.set(hashKey(ADMIN_API_KEY), {
  key: ADMIN_API_KEY,
  name: 'admin',
  permissions: ['read', 'write', 'trade', 'admin'],
  createdAt: Date.now(),
  rateLimit: 1000,
  requestCount: 0,
  windowStart: Date.now(),
});

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export function generateApiKey(name: string, permissions: string[] = ['read']): ApiKey {
  const key = `fm_${crypto.randomBytes(24).toString('hex')}`;
  const apiKey: ApiKey = {
    key, name, permissions,
    createdAt: Date.now(),
    rateLimit: 60,
    requestCount: 0,
    windowStart: Date.now(),
  };
  apiKeys.set(hashKey(key), apiKey);
  return apiKey;
}

export function validateApiKey(key: string): ApiKey | null {
  const apiKey = apiKeys.get(hashKey(key));
  if (!apiKey) return null;

  const now = Date.now();
  if (now - apiKey.windowStart > 60000) {
    apiKey.windowStart = now;
    apiKey.requestCount = 0;
  }
  if (apiKey.requestCount >= apiKey.rateLimit) return null;
  apiKey.requestCount++;
  apiKey.lastUsed = now;
  return apiKey;
}

export function checkPermission(apiKey: ApiKey, permission: string): boolean {
  return apiKey.permissions.includes(permission) || apiKey.permissions.includes('admin');
}

export function listApiKeys(): Omit<ApiKey, 'key'>[] {
  return Array.from(apiKeys.values()).map(k => ({
    ...k,
    key: k.key.slice(0, 8) + '...' + k.key.slice(-4),
  }));
}

export function revokeApiKey(keyPrefix: string): boolean {
  for (const [hash, key] of apiKeys) {
    if (key.key.startsWith(keyPrefix) || hash === hashKey(keyPrefix)) {
      apiKeys.delete(hash);
      return true;
    }
  }
  return false;
}

export function signToken(payload: Record<string, any>): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifyToken(token: string): Record<string, any> | null {
  try {
    const [data, sig] = token.split('.');
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');
    if (sig !== expected) return null;
    return JSON.parse(Buffer.from(data, 'base64url').toString());
  } catch {
    return null;
  }
}

import Redis from "ioredis";

/**
 * Persistent agent data store using Redis (via REDIS_URL).
 * Stores registration data, computed reputation, and CIDs
 * so any user can look up an agent by address.
 */

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    const url = process.env.REDIS_URL;
    if (!url) throw new Error("REDIS_URL not configured");
    redis = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 2 });
  }
  return redis;
}

export interface StoredAgent {
  agentId: string;
  name: string;
  type: string;
  capabilities: string[];
  filecoin: {
    identityCID: string;
    historyCID: string;
    proofCID: string;
  };
  reputation: {
    totalScore: number;
    breakdown: Record<string, number>;
    actionCount: number;
  };
  proof: {
    root: string;
    leaves: string[];
    actionCount: number;
  };
  registeredAt: string;
  lastUpdated: string;
}

function agentKey(address: string): string {
  return `agent:${address.toLowerCase()}`;
}

/**
 * Save agent data after registration or reputation calculation.
 */
export async function saveAgent(address: string, data: StoredAgent): Promise<void> {
  try {
    const r = getRedis();
    await r.set(agentKey(address), JSON.stringify(data));
    await r.sadd("agents:all", address.toLowerCase());
  } catch (error) {
    console.error("[Store] Failed to save agent:", error);
  }
}

/**
 * Look up agent data by address.
 */
export async function getAgent(address: string): Promise<StoredAgent | null> {
  try {
    const r = getRedis();
    const raw = await r.get(agentKey(address));
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("[Store] Failed to get agent:", error);
    return null;
  }
}

/**
 * Get all registered agent addresses.
 */
export async function getAllAgentAddresses(): Promise<string[]> {
  try {
    const r = getRedis();
    return await r.smembers("agents:all");
  } catch (error) {
    console.error("[Store] Failed to get agent list:", error);
    return [];
  }
}

/**
 * Check if Redis store is available (env var set).
 */
export function isStoreAvailable(): boolean {
  return !!process.env.REDIS_URL;
}

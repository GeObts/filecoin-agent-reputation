import { kv } from "@vercel/kv";

/**
 * Persistent agent data store using Vercel KV (Redis).
 * Stores registration data, computed reputation, and CIDs
 * so any user can look up an agent by address.
 */

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
    await kv.set(agentKey(address), data);
    // Also add to the set of all registered agents
    await kv.sadd("agents:all", address.toLowerCase());
  } catch (error) {
    console.error("[Store] Failed to save agent:", error);
  }
}

/**
 * Look up agent data by address.
 */
export async function getAgent(address: string): Promise<StoredAgent | null> {
  try {
    return await kv.get<StoredAgent>(agentKey(address));
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
    return await kv.smembers("agents:all");
  } catch (error) {
    console.error("[Store] Failed to get agent list:", error);
    return [];
  }
}

/**
 * Check if KV store is available (env vars set).
 */
export function isStoreAvailable(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

/**
 * Environment variable access.
 *
 * NEXT_PUBLIC_* vars must be accessed with literal property names
 * so Next.js can inline them at build time for the client bundle.
 * Dynamic access (process.env[name]) does NOT work on the client.
 */

// --- Server-side only (not exposed to client) ---
export const serverEnv = {
  get GITHUB_TOKEN() { return process.env.GITHUB_TOKEN ?? ""; },
  get PAYMENT_RECIPIENT_ADDRESS() { return process.env.PAYMENT_RECIPIENT_ADDRESS ?? ""; },
  get PRIVATE_KEY() { return process.env.PRIVATE_KEY ?? ""; },
  get BASESCAN_API_KEY() { return process.env.BASESCAN_API_KEY ?? ""; },
};

// --- Public (NEXT_PUBLIC_*) — direct access required for client inlining ---
export const publicEnv = {
  AGENT_REGISTRY_ADDRESS: (process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS ?? "0x644337Ca322C90098b5F3657Bde2b661e28d9e0E") as `0x${string}`,
  REPUTATION_ORACLE_ADDRESS: (process.env.NEXT_PUBLIC_REPUTATION_ORACLE_ADDRESS ?? "0xb7FaEDd691a1d9e02A348a09456F6D3E39355FF1") as `0x${string}`,
  CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID ?? "84532",
  WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "https://filecoin-agent-reputation.vercel.app",
  API_URL: process.env.NEXT_PUBLIC_API_URL ?? "/api",
};

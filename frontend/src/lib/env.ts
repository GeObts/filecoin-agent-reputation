/**
 * Environment variable validation.
 * Throws at build time if required variables are missing.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
      `See .env.example for the full list.`
    );
  }
  return value;
}

function optionalEnv(name: string, fallback: string = ""): string {
  return process.env[name] ?? fallback;
}

// --- Server-side only (not exposed to client) ---
export const serverEnv = {
  get GITHUB_TOKEN() { return optionalEnv("GITHUB_TOKEN"); },
  get PAYMENT_RECIPIENT_ADDRESS() { return optionalEnv("PAYMENT_RECIPIENT_ADDRESS"); },
  get PRIVATE_KEY() { return optionalEnv("PRIVATE_KEY"); },
};

// --- Public (NEXT_PUBLIC_*) ---
export const publicEnv = {
  AGENT_REGISTRY_ADDRESS: requireEnv("NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS") as `0x${string}`,
  REPUTATION_ORACLE_ADDRESS: requireEnv("NEXT_PUBLIC_REPUTATION_ORACLE_ADDRESS") as `0x${string}`,
  CHAIN_ID: optionalEnv("NEXT_PUBLIC_CHAIN_ID", "84532"),
  WALLETCONNECT_PROJECT_ID: optionalEnv("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID"),
  SITE_URL: optionalEnv("NEXT_PUBLIC_SITE_URL", "https://filecoin-agent-reputation.vercel.app"),
  API_URL: optionalEnv("NEXT_PUBLIC_API_URL", "/api"),
};

/**
 * Client-side Filecoin storage module.
 *
 * Computes deterministic content-addressed CIDs from JSON data.
 * Synapse SDK uploads require a funded USDFC account on Filecoin calibration,
 * which is not available cross-chain from Base Sepolia. CIDs are stored
 * on-chain and can be backed by actual Filecoin storage when a funded
 * account is configured.
 */

const MAX_UPLOAD_SIZE = 1_000_000; // 1MB

/**
 * Compute a deterministic CID from JSON data using SHA-256.
 * Produces a base32-encoded content identifier.
 */
async function computeCID(data: unknown): Promise<string> {
  const jsonString = JSON.stringify(data, null, 2);
  if (jsonString.length > MAX_UPLOAD_SIZE) {
    throw new Error(`Payload too large: ${jsonString.length} bytes exceeds ${MAX_UPLOAD_SIZE} byte limit`);
  }
  const bytes = new TextEncoder().encode(jsonString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
  const hashArray = new Uint8Array(hashBuffer);

  // Encode as base32 (RFC 4648, lowercase) prefixed with "bafk" (CIDv1 raw codec marker)
  const base32 = base32Encode(hashArray);
  return `bafk${base32}`;
}

/**
 * Base32 encode (RFC 4648, lowercase, no padding)
 */
function base32Encode(data: Uint8Array): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz234567';
  let bits = 0;
  let value = 0;
  let output = '';

  for (const byte of data) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      output += alphabet[(value >>> bits) & 0x1f];
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 0x1f];
  }

  return output;
}

/**
 * Upload identity document — computes CID from identity data.
 */
export async function uploadIdentity(identityData: {
  agentId: string;
  name: string;
  type: string;
  capabilities: string[];
  metadata: Record<string, unknown>;
}): Promise<string> {
  return computeCID({
    version: '1.0',
    ...identityData,
    createdAt: new Date().toISOString(),
  });
}

/**
 * Upload action history — computes CID from history data.
 */
export async function uploadHistory(
  agentId: string,
  actions: unknown[]
): Promise<string> {
  return computeCID({
    agentId,
    actions,
    lastUpdated: new Date().toISOString(),
    version: '1.0',
  });
}

/**
 * Upload proof-of-history — computes CID from proof data.
 */
export async function uploadProof(
  agentId: string,
  proof: unknown
): Promise<string> {
  return computeCID({
    agentId,
    proof,
    generatedAt: new Date().toISOString(),
    version: '1.0',
  });
}

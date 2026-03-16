import { initSynapse, getSynapse } from "./synapse";
import { initReputation, getReputation } from "./reputation";

/**
 * Initialize Synapse (requires private key for uploads).
 */
export function ensureSynapse() {
  try {
    getSynapse();
  } catch {
    // Use a dummy key for serverless - actual uploads happen client-side
    const dummyKey = process.env.PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000001';
    initSynapse(dummyKey);
  }
}

export function ensureReputation() {
  try {
    getReputation();
  } catch {
    initReputation(process.env.GITHUB_TOKEN);
  }
}

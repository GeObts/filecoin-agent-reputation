import { initSynapse, getSynapse } from "./synapse";
import { initReputation, getReputation } from "./reputation";

/**
 * Initialize read-only Synapse (for retrieval routes).
 */
export function ensureSynapse() {
  try {
    getSynapse();
  } catch {
    initSynapse();
  }
}

export function ensureReputation() {
  try {
    getReputation();
  } catch {
    initReputation(process.env.GITHUB_TOKEN);
  }
}

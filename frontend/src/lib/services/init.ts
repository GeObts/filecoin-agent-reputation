import { initSynapse, getSynapse } from "./synapse";
import { initReputation, getReputation } from "./reputation";

export function ensureServices() {
  try {
    getSynapse();
  } catch {
    const pk = process.env.PRIVATE_KEY;
    if (!pk) throw new Error("PRIVATE_KEY env var required");
    initSynapse(pk);
  }

  try {
    getReputation();
  } catch {
    initReputation(process.env.GITHUB_TOKEN);
  }
}

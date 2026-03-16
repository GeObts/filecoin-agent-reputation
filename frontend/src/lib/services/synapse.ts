import { Synapse } from '@filoz/synapse-sdk';
import { http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// Dummy local account for read-only Synapse (download only, no signing).
// Synapse SDK rejects json-rpc accounts with non-custom transports,
// so we use a local account to bypass the check on the server side.
const READONLY_ACCOUNT = privateKeyToAccount(
  '0x0000000000000000000000000000000000000000000000000000000000000001'
);

/**
 * Read-only Synapse Storage Service for Filecoin retrieval (server-side)
 */
export class SynapseService {
  private synapse: Synapse;

  constructor() {
    this.synapse = Synapse.create({
      account: READONLY_ACCOUNT,
      transport: http(),
      source: null,
    });

    console.log('[Synapse] Initialized in read-only mode');
  }

  /**
   * Retrieve JSON data from Filecoin by pieceCid
   */
  async retrieveJSON(cid: string): Promise<unknown> {
    const bytes = await this.synapse.storage.download({ pieceCid: cid });
    const text = new TextDecoder().decode(bytes);
    return JSON.parse(text);
  }
}

// Singleton instance
let synapseInstance: SynapseService | null = null;

export function initSynapse(): SynapseService {
  if (!synapseInstance) {
    synapseInstance = new SynapseService();
  }
  return synapseInstance;
}

export function getSynapse(): SynapseService {
  if (!synapseInstance) {
    throw new Error('Synapse not initialized. Call initSynapse() first.');
  }
  return synapseInstance;
}

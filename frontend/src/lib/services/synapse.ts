import { Synapse } from '@filoz/synapse-sdk';
import { http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

/**
 * Synapse Storage Service for Filecoin interaction
 */
export class SynapseService {
  private synapse: Synapse | null = null;

  constructor(privateKey: string) {
    if (!privateKey || !/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
      throw new Error('Invalid private key format: must be 0x followed by 64 hex characters');
    }

    const account = privateKeyToAccount(privateKey as `0x${string}`);
    this.initializeSynapse(account);
  }

  private initializeSynapse(account: ReturnType<typeof privateKeyToAccount>) {
    try {
      this.synapse = Synapse.create({
        account,
        transport: http(),
        source: null,
      });

      console.log('[Synapse] Initialized for Calibration testnet');
    } catch (error) {
      console.error('[Synapse] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Upload JSON data to Filecoin and return pieceCid
   */
  async uploadJSON(data: any): Promise<string> {
    if (!this.synapse) {
      throw new Error('Synapse not initialized');
    }

    const MAX_UPLOAD_SIZE = 1_000_000; // 1MB

    try {
      const jsonString = JSON.stringify(data, null, 2);
      if (jsonString.length > MAX_UPLOAD_SIZE) {
        throw new Error(`Payload too large: ${jsonString.length} bytes exceeds ${MAX_UPLOAD_SIZE} byte limit`);
      }
      const bytes = new TextEncoder().encode(jsonString);

      const result = await this.synapse.storage.upload(bytes);

      console.log('[Synapse] Uploaded to Filecoin:', result.pieceCid);
      return String(result.pieceCid);
    } catch (error) {
      console.error('[Synapse] Upload failed:', error);
      throw error;
    }
  }

  /**
   * Retrieve JSON data from Filecoin by pieceCid
   */
  async retrieveJSON(cid: string): Promise<any> {
    if (!this.synapse) {
      throw new Error('Synapse not initialized');
    }

    try {
      const bytes = await this.synapse.storage.download({ pieceCid: cid });
      const text = new TextDecoder().decode(bytes);
      return JSON.parse(text);
    } catch (error) {
      console.error('[Synapse] Retrieval failed:', error);
      throw error;
    }
  }

  /**
   * Upload identity document to Filecoin
   */
  async uploadIdentity(identityData: {
    agentId: string;
    name: string;
    type: string;
    capabilities: string[];
    metadata: any;
    publicKey?: string;
  }): Promise<string> {
    const identity = {
      version: '1.0',
      ...identityData,
      createdAt: new Date().toISOString()
    };

    return this.uploadJSON(identity);
  }

  /**
   * Upload action history to Filecoin
   */
  async uploadHistory(agentId: string, actions: any[]): Promise<string> {
    const history = {
      agentId,
      actions,
      lastUpdated: new Date().toISOString(),
      version: '1.0'
    };

    return this.uploadJSON(history);
  }

  /**
   * Upload proof-of-history to Filecoin
   */
  async uploadProof(agentId: string, proof: any): Promise<string> {
    const proofData = {
      agentId,
      proof,
      generatedAt: new Date().toISOString(),
      version: '1.0'
    };

    return this.uploadJSON(proofData);
  }
}

// Singleton instance
let synapseInstance: SynapseService | null = null;

export function initSynapse(privateKey: string): SynapseService {
  if (!synapseInstance) {
    synapseInstance = new SynapseService(privateKey);
  }
  return synapseInstance;
}

export function getSynapse(): SynapseService {
  if (!synapseInstance) {
    throw new Error('Synapse not initialized. Call initSynapse() first.');
  }
  return synapseInstance;
}

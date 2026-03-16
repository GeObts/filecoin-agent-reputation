import { Synapse } from '@filoz/synapse-sdk';
import { calibration } from '@filoz/synapse-core/chains';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

/**
 * Synapse Storage Service for Filecoin interaction
 */
export class SynapseService {
  private synapse: Synapse | null = null;
  private account: any;

  constructor(privateKey: string) {
    if (!privateKey || !privateKey.startsWith('0x')) {
      throw new Error('Invalid private key format');
    }

    this.account = privateKeyToAccount(privateKey as `0x${string}`);
    this.initializeSynapse();
  }

  private async initializeSynapse() {
    try {
      this.synapse = Synapse.create({
        account: this.account,
        transport: http(),
        source: null,
      });

      console.log('[Synapse] Initialized');
    } catch (error) {
      console.error('[Synapse] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Upload JSON data to Filecoin and return CID
   */
  async uploadJSON(data: any): Promise<string> {
    if (!this.synapse) {
      throw new Error('Synapse not initialized');
    }

    try {
      const jsonString = JSON.stringify(data, null, 2);
      const encoder = new TextEncoder();
      const bytes = encoder.encode(jsonString);

      const result = await this.synapse.storage.upload(bytes);
      
      const cidString = result.pieceCid.toString();
      console.log('[Synapse] Uploaded to Filecoin:', cidString);
      return cidString;
    } catch (error) {
      console.error('[Synapse] Upload failed:', error);
      throw error;
    }
  }

  /**
   * Retrieve JSON data from Filecoin by CID
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

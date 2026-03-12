// On-chain struct types (matching Solidity)

export interface AgentIdentity {
  owner: `0x${string}`;
  identityCID: string;
  currentStateCID: string;
  registeredAt: bigint;
  lastUpdated: bigint;
  isActive: boolean;
}

export interface Reputation {
  totalScore: bigint;
  historyCID: string;
  proofOfHistoryCID: string;
  lastCalculated: bigint;
  actionCount: bigint;
}

export interface ScoreBreakdown {
  codeContributions: bigint;
  blockchainActivity: bigint;
  agentInteractions: bigint;
  uptime: bigint;
}

// Backend API types

export interface CreateIdentityRequest {
  agentId: string;
  name: string;
  type?: string;
  capabilities?: string[];
  metadata?: Record<string, unknown>;
}

export interface CreateIdentityResponse {
  success: boolean;
  cid: string;
  agentId: string;
  message: string;
}

export interface FilecoinIdentity {
  success: boolean;
  identity: Record<string, unknown>;
  cid: string;
}

export interface CalculateReputationRequest {
  agentAddress: string;
  githubUsername?: string;
}

export interface CalculateReputationResponse {
  success: boolean;
  agentAddress: string;
  reputation: number;
  filecoin: {
    historyCID: string;
    proofCID: string;
  };
  actionCount: number;
}

export interface FilecoinHistory {
  success: boolean;
  history: Record<string, unknown>;
  cid: string;
}

export interface FilecoinProof {
  success: boolean;
  proof: Record<string, unknown>;
  cid: string;
}

export interface RegisterAgentRequest {
  agentId: string;
  name: string;
  type?: string;
  capabilities?: string[];
  metadata?: Record<string, unknown>;
  githubUsername?: string;
}

export interface RegisterAgentResponse {
  success: boolean;
  agentId: string;
  filecoin: {
    identityCID: string;
    historyCID: string;
    proofCID: string;
  };
  reputation: number;
  message: string;
}

// UI types

export interface Action {
  timestamp: string;
  type: "code_contribution" | "blockchain_transaction" | "agent_interaction" | "uptime";
  platform?: string;
  details: Record<string, unknown>;
  score: number;
}

export interface AgentProfile {
  address: `0x${string}`;
  identity: AgentIdentity;
  reputation: Reputation;
  breakdown: ScoreBreakdown;
  hasProof: boolean;
}

export type ScoreCategory = "Excellent" | "Good" | "Fair" | "Poor" | "Unknown";

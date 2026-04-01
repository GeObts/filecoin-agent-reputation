import { publicEnv } from "./env";

export const AGENT_REGISTRY_ADDRESS = publicEnv.AGENT_REGISTRY_ADDRESS;
export const REPUTATION_ORACLE_ADDRESS = publicEnv.REPUTATION_ORACLE_ADDRESS;

export const agentRegistryAbi = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "agentAddress", type: "address" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" },
    ],
    name: "AgentDeactivated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "agentAddress", type: "address" },
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: false, internalType: "string", name: "identityCID", type: "string" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" },
    ],
    name: "AgentRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "agentAddress", type: "address" },
      { indexed: false, internalType: "string", name: "newStateCID", type: "string" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" },
    ],
    name: "AgentUpdated",
    type: "event",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "agentList",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "agents",
    outputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "string", name: "identityCID", type: "string" },
      { internalType: "string", name: "currentStateCID", type: "string" },
      { internalType: "uint256", name: "registeredAt", type: "uint256" },
      { internalType: "uint256", name: "lastUpdated", type: "uint256" },
      { internalType: "bool", name: "isActive", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "agentAddress", type: "address" }],
    name: "deactivateAgent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "agentAddress", type: "address" }],
    name: "getAgent",
    outputs: [
      {
        components: [
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "string", name: "identityCID", type: "string" },
          { internalType: "string", name: "currentStateCID", type: "string" },
          { internalType: "uint256", name: "registeredAt", type: "uint256" },
          { internalType: "uint256", name: "lastUpdated", type: "uint256" },
          { internalType: "bool", name: "isActive", type: "bool" },
        ],
        internalType: "struct AgentRegistry.AgentIdentity",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAgentCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "agentAddress", type: "address" }],
    name: "isAgentActive",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "agentAddress", type: "address" },
      { internalType: "string", name: "identityCID", type: "string" },
    ],
    name: "registerAgent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "agentAddress", type: "address" },
      { internalType: "string", name: "newStateCID", type: "string" },
    ],
    name: "updateAgentState",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const reputationOracleAbi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "agentAddress", type: "address" },
      { indexed: false, internalType: "uint256", name: "newScore", type: "uint256" },
      { indexed: false, internalType: "string", name: "historyCID", type: "string" },
      { indexed: false, internalType: "string", name: "proofCID", type: "string" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" },
    ],
    name: "ReputationUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "updater", type: "address" },
      { indexed: false, internalType: "bool", name: "authorized", type: "bool" },
    ],
    name: "UpdaterAuthorized",
    type: "event",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "authorizedUpdaters",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "agentAddress", type: "address" }],
    name: "getReputation",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "totalScore", type: "uint256" },
          { internalType: "string", name: "historyCID", type: "string" },
          { internalType: "string", name: "proofOfHistoryCID", type: "string" },
          { internalType: "bytes32", name: "proofHash", type: "bytes32" },
          { internalType: "uint256", name: "lastCalculated", type: "uint256" },
          { internalType: "uint256", name: "actionCount", type: "uint256" },
        ],
        internalType: "struct ReputationOracle.Reputation",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "agentAddress", type: "address" }],
    name: "getScore",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "agentAddress", type: "address" }],
    name: "getScoreBreakdown",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "codeContributions", type: "uint256" },
          { internalType: "uint256", name: "blockchainActivity", type: "uint256" },
          { internalType: "uint256", name: "agentInteractions", type: "uint256" },
          { internalType: "uint256", name: "uptime", type: "uint256" },
        ],
        internalType: "struct ReputationOracle.ScoreBreakdown",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "agentAddress", type: "address" }],
    name: "hasProof",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "reputations",
    outputs: [
      { internalType: "uint256", name: "totalScore", type: "uint256" },
      { internalType: "string", name: "historyCID", type: "string" },
      { internalType: "string", name: "proofOfHistoryCID", type: "string" },
      { internalType: "bytes32", name: "proofHash", type: "bytes32" },
      { internalType: "uint256", name: "lastCalculated", type: "uint256" },
      { internalType: "uint256", name: "actionCount", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "scoreBreakdowns",
    outputs: [
      { internalType: "uint256", name: "codeContributions", type: "uint256" },
      { internalType: "uint256", name: "blockchainActivity", type: "uint256" },
      { internalType: "uint256", name: "agentInteractions", type: "uint256" },
      { internalType: "uint256", name: "uptime", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "updater", type: "address" },
      { internalType: "bool", name: "authorized", type: "bool" },
    ],
    name: "setAuthorizedUpdater",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "agentAddress", type: "address" },
      { internalType: "uint256", name: "totalScore", type: "uint256" },
      { internalType: "string", name: "historyCID", type: "string" },
      { internalType: "string", name: "proofCID", type: "string" },
      { internalType: "uint256", name: "actionCount", type: "uint256" },
    ],
    name: "updateReputation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "agentAddress", type: "address" },
      { internalType: "uint256", name: "codeContributions", type: "uint256" },
      { internalType: "uint256", name: "blockchainActivity", type: "uint256" },
      { internalType: "uint256", name: "agentInteractions", type: "uint256" },
      { internalType: "uint256", name: "uptime", type: "uint256" },
    ],
    name: "updateScoreBreakdown",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "agentAddress", type: "address" },
      { internalType: "uint256", name: "totalScore", type: "uint256" },
      { internalType: "string", name: "historyCID", type: "string" },
      { internalType: "string", name: "proofCID", type: "string" },
      { internalType: "bytes32", name: "proofHash", type: "bytes32" },
      { internalType: "uint256", name: "actionCount", type: "uint256" },
    ],
    name: "updateReputationWithProof",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "agentAddress", type: "address" },
      { internalType: "bytes32", name: "claimedProofHash", type: "bytes32" },
    ],
    name: "verifyProofHash",
    outputs: [{ internalType: "bool", name: "valid", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "agentAddress", type: "address" }],
    name: "getProofHash",
    outputs: [{ internalType: "bytes32", name: "hash", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

# Agent Registration on FARS

> **Security Notice**: Never hardcode private keys in source code. Always load keys from environment variables or a secure vault. Verify contract addresses on [BaseScan](https://sepolia.basescan.org) before interacting. This guide targets **Base Sepolia (testnet)** — do not use mainnet funds.

## Overview

The Filecoin Agent Reputation System (FARS) lets AI agents register an on-chain identity on **Base Sepolia** with a content-addressed identity CID. Registration stores the agent's identity on-chain via the `AgentRegistry` contract and computes a reputation score from verifiable actions (GitHub contributions, blockchain activity, etc.).

## Network & Contracts

| Contract | Address | Chain |
|---|---|---|
| AgentRegistry | `0x644337Ca322C90098b5F3657Bde2b661e28d9e0E` | Base Sepolia (84532) |
| ReputationOracle | `0xb7FaEDd691a1d9e02A348a09456F6D3E39355FF1` | Base Sepolia (84532) |

Base Sepolia RPC: `https://sepolia.base.org`

## Registration Flow

### Step 1: Compute Identity CID

Build an identity object and compute its CID (SHA-256, base32-encoded):

```json
{
  "version": "1.0",
  "agentId": "0xYourAgentAddress",
  "name": "My AI Agent",
  "type": "autonomous_agent",
  "capabilities": ["data_analysis", "code_generation"],
  "metadata": {},
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

**Agent types**: `autonomous_agent`, `data_processor`, `content_creator`, `defi_agent`, `governance_agent`

**Capabilities**: `data_analysis`, `code_generation`, `blockchain_interaction`, `content_creation`, `task_automation`, `governance_voting`

The CID is computed by:
1. `JSON.stringify(data, null, 2)` the identity object
2. SHA-256 hash the UTF-8 bytes
3. Base32 encode (RFC 4648, lowercase, no padding)
4. Prefix with `bafk`

### Step 2: Calculate Reputation (Optional)

Call the reputation API to score actions from GitHub and other sources:

```
POST /api/reputation/calculate
Content-Type: application/json

{
  "agentAddress": "0xYourAgentAddress",
  "githubUsername": "your-github-username"
}
```

**Response:**

```json
{
  "success": true,
  "agentAddress": "0x...",
  "actions": [...],
  "reputation": {
    "totalScore": 120,
    "breakdown": {
      "codeContributions": 100,
      "blockchainActivity": 10,
      "agentInteractions": 5,
      "uptime": 5
    },
    "actionCount": 12
  },
  "proof": {
    "root": "abc123...",
    "leaves": ["..."],
    "timestamp": "2025-01-01T00:00:00.000Z",
    "actionCount": 12
  }
}
```

### Step 3: Register On-Chain

Call `registerAgent` on the AgentRegistry contract:

```solidity
function registerAgent(address agentAddress, string identityCID) external
```

**Using viem:**

```typescript
import { createWalletClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// SECURITY: Always load private keys from environment variables, never hardcode them
const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
const client = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
});

const AGENT_REGISTRY = '0x644337Ca322C90098b5F3657Bde2b661e28d9e0E';

const hash = await client.writeContract({
  address: AGENT_REGISTRY,
  abi: [{
    inputs: [
      { name: 'agentAddress', type: 'address' },
      { name: 'identityCID', type: 'string' },
    ],
    name: 'registerAgent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  }],
  functionName: 'registerAgent',
  args: [account.address, identityCID],
});
```

**Using cast (Foundry):**

```bash
cast send 0x644337Ca322C90098b5F3657Bde2b661e28d9e0E \
  "registerAgent(address,string)" \
  0xYourAgentAddress \
  "bafkYourIdentityCID" \
  --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY
```

### Step 4: Verify Registration

Check if the agent is registered:

```bash
cast call 0x644337Ca322C90098b5F3657Bde2b661e28d9e0E \
  "isAgentActive(address)(bool)" \
  0xYourAgentAddress \
  --rpc-url https://sepolia.base.org
```

Read agent data:

```bash
cast call 0x644337Ca322C90098b5F3657Bde2b661e28d9e0E \
  "getAgent(address)" \
  0xYourAgentAddress \
  --rpc-url https://sepolia.base.org
```

## Full Script Example (TypeScript)

```typescript
import { createWalletClient, createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const AGENT_REGISTRY = '0x644337Ca322C90098b5F3657Bde2b661e28d9e0E';
const FARS_API = 'https://your-fars-instance.com/api';

const registerAgentAbi = [{
  inputs: [
    { name: 'agentAddress', type: 'address' },
    { name: 'identityCID', type: 'string' },
  ],
  name: 'registerAgent',
  outputs: [],
  stateMutability: 'nonpayable',
  type: 'function',
}] as const;

const isAgentActiveAbi = [{
  inputs: [{ name: 'agentAddress', type: 'address' }],
  name: 'isAgentActive',
  outputs: [{ name: '', type: 'bool' }],
  stateMutability: 'view',
  type: 'function',
}] as const;

// --- Helpers ---

async function computeCID(data: unknown): Promise<string> {
  const json = JSON.stringify(data, null, 2);
  const bytes = new TextEncoder().encode(json);
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  const alphabet = 'abcdefghijklmnopqrstuvwxyz234567';
  let bits = 0, value = 0, b32 = '';
  for (const byte of hash) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) { bits -= 5; b32 += alphabet[(value >>> bits) & 0x1f]; }
  }
  if (bits > 0) b32 += alphabet[(value << (5 - bits)) & 0x1f];
  return `bafk${b32}`;
}

// --- Main ---

async function register() {
  // 0. Validate environment
  if (!process.env.PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY environment variable is required');
  }

  const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http('https://sepolia.base.org'),
  });

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http('https://sepolia.base.org'),
  });

  // 1. Check if already registered
  const isActive = await publicClient.readContract({
    address: AGENT_REGISTRY,
    abi: isAgentActiveAbi,
    functionName: 'isAgentActive',
    args: [account.address],
  });

  if (isActive) {
    console.log('Agent already registered');
    return;
  }

  // 2. Compute identity CID
  const identityCID = await computeCID({
    version: '1.0',
    agentId: account.address,
    name: 'My AI Agent',
    type: 'autonomous_agent',
    capabilities: ['data_analysis', 'blockchain_interaction'],
    metadata: {},
    createdAt: new Date().toISOString(),
  });

  console.log('Identity CID:', identityCID);

  // 3. Calculate reputation (optional — skip on failure)
  try {
    const repResponse = await fetch(`${FARS_API}/reputation/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentAddress: account.address,
        githubUsername: 'your-github-username', // optional
      }),
    });

    if (!repResponse.ok) {
      console.warn(`Reputation API returned ${repResponse.status}: ${repResponse.statusText}`);
    } else {
      const repData = await repResponse.json();
      console.log('Reputation:', repData.reputation?.totalScore ?? 0);
    }
  } catch (err) {
    console.warn('Reputation API unavailable, skipping:', (err as Error).message);
  }

  // 4. Register on-chain
  let hash: `0x${string}`;
  try {
    hash = await walletClient.writeContract({
      address: AGENT_REGISTRY,
      abi: registerAgentAbi,
      functionName: 'registerAgent',
      args: [account.address, identityCID],
    });
  } catch (err) {
    const message = (err as Error).message;
    if (message.includes('revert')) {
      throw new Error(`Contract reverted: ${message}`);
    }
    if (message.includes('insufficient funds')) {
      throw new Error('Insufficient ETH for gas. Fund your wallet on Base Sepolia.');
    }
    throw new Error(`Transaction failed: ${message}`);
  }

  console.log('Transaction:', `https://sepolia.basescan.org/tx/${hash}`);

  // 5. Wait for confirmation
  const receipt = await publicClient.waitForTransactionReceipt({
    hash,
    timeout: 60_000, // 60s timeout
  });

  if (receipt.status === 'reverted') {
    throw new Error(`Transaction reverted: ${hash}`);
  }

  console.log('Confirmed in block', receipt.blockNumber);
}

register().catch((err) => {
  console.error('Registration failed:', err.message);
  process.exit(1);
});
```

## Contract Read Functions

| Function | Args | Returns |
|---|---|---|
| `isAgentActive(address)` | agent address | `bool` |
| `getAgent(address)` | agent address | `AgentIdentity` struct |
| `getAgentCount()` | none | `uint256` |
| `getReputation(address)` | agent address | `Reputation` struct (on ReputationOracle) |
| `getScore(address)` | agent address | `uint256` total score |
| `getScoreBreakdown(address)` | agent address | `ScoreBreakdown` struct |
| `hasProof(address)` | agent address | `bool` |

## AgentIdentity Struct

```solidity
struct AgentIdentity {
    address owner;
    string identityCID;
    string currentStateCID;
    uint256 registeredAt;
    uint256 lastUpdated;
    bool isActive;
}
```

## Reputation Struct

```solidity
struct Reputation {
    uint256 totalScore;
    string historyCID;
    string proofOfHistoryCID;
    uint256 lastCalculated;
    uint256 actionCount;
}
```

## Web UI

Agents can also register via the web interface at `/register`, which provides a guided 5-step flow with wallet connection.

## Security Best Practices

- **Never hardcode private keys** in source code, scripts, or config files. Use environment variables or a secrets manager.
- **Verify contract addresses** on [BaseScan](https://sepolia.basescan.org) before sending transactions.
- **This is a testnet deployment** (Base Sepolia). Do not send mainnet ETH to these addresses.
- **The `/api/reputation/calculate` endpoint** is unauthenticated. Do not expose it to the public internet without rate limiting in production.
- **Validate all CIDs** before submitting on-chain — malformed CIDs waste gas and may be rejected by the contract.

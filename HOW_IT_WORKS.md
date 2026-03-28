# How It Works: Filecoin Agent Reputation System (FARS)

## Overview

The **Filecoin Agent Reputation System (FARS)** creates a decentralized, portable identity and reputation framework for AI agents. Using Filecoin for immutable storage and smart contracts for on-chain verification, agents can build verifiable reputation that travels with them across platforms.

---

## The Problem

AI agents today face three critical challenges:

1. **No Persistent Identity** - Agents are ephemeral, tied to specific platforms
2. **Unverifiable Claims** - No way to prove past actions or capabilities
3. **Platform Lock-In** - Reputation doesn't transfer between services

**FARS solves this** by anchoring agent identity and reputation to Filecoin, creating a universal, cryptographically verifiable record.

---

## Core Components

### 1. Agent Identity

Every agent has a unique **Identity Document** stored on Filecoin containing:

- **Agent address** (Ethereum-compatible)
- **Public metadata** (name, description, capabilities)
- **GitHub account** (for code contribution tracking)
- **Creation timestamp**

**Example Identity CID:**
```
bafybeib30783065443339426139416236363341323044363563633665
```

This CID is **permanent** and **portable** - it represents the agent across all platforms.

### 2. Reputation Score

Agents earn reputation from **verifiable on-chain and off-chain actions**:

| Category | Examples | Points |
|----------|----------|--------|
| **Code Contributions** | GitHub PRs, commits, documentation | 1-10 per action |
| **Blockchain Activity** | Smart contract interactions, token transfers | 1-5 per action |
| **Agent Interactions** | Verified communication with other agents | 2-8 per action |
| **Uptime & Reliability** | Consistent availability, response times | 1-3 per day |

**Total Score Formula:**
```
Reputation = (Code × 300) + (Blockchain × 50) + (Interactions × 25) + (Uptime × 25)
```

### 3. Proof-of-History

Every reputation update includes a **cryptographic proof** stored on Filecoin:

- **History CID** - Complete action log (timestamped, signed)
- **Proof CID** - Merkle tree root of all actions
- **Action Count** - Total verifiable actions

This creates an **auditable trail** that anyone can verify independently.

---

## How Agents Register

### Step 1: Generate Identity

```bash
# Using the FARS CLI
fars register 0xYourAgentAddress YourGitHubUsername

# Output:
# ✅ Identity created
# CID: bafybeib3078306544333942...
# Uploading to Filecoin...
```

**What happens:**
1. System generates identity JSON document
2. Uploads to Filecoin via Synapse SDK
3. Returns permanent CID

### Step 2: On-Chain Registration

```bash
# Agent identity registered to smart contract
AgentRegistry.registerAgent(agentAddress, identityCID)
```

**Smart Contract:** `0x644337Ca322C90098b5F3657Bde2b661e28d9e0E` (Base Sepolia)

**What's stored on-chain:**
- Agent address
- Identity CID (Filecoin reference)
- Registration timestamp
- Active/inactive status

### Step 3: Initial Reputation

```bash
# Reputation oracle records first score
ReputationOracle.updateReputation(
  agentAddress,
  initialScore,
  historyCID,
  proofCID,
  actionCount
)
```

**Smart Contract:** `0xb7FaEDd691a1d9e02A348a09456F6D3E39355FF1` (Base Sepolia)

---

## How Reputation Updates

### Automatic Tracking

FARS automatically tracks:

1. **GitHub Activity** (via GitHub API)
   - Pull requests merged
   - Issues resolved
   - Documentation improved
   - Code reviews completed

2. **Blockchain Actions** (via chain indexers)
   - Smart contract deployments
   - Token transfers
   - DAO votes
   - NFT mints

3. **Agent-to-Agent Communication** (via message signing)
   - Verified task completion
   - Collaboration events
   - Service provision

### Periodic Updates

Every **24 hours**, the reputation service:

1. Queries all data sources
2. Calculates new score
3. Generates proof-of-history
4. Uploads to Filecoin
5. Updates on-chain oracle

**Gas costs:** ~0.0001 ETH per update on Base

---

## How to Verify Reputation

### Using the CLI

```bash
# Verify any agent's reputation
fars verify 0xAgentAddress

# Output:
# ✅ Identity verified on Filecoin
# CID: bafybeib3078306544333942...
# Reputation Score: 400
# GitHub: GeObts
# Registered: 2026-03-11
# Last Updated: 2026-03-11 17:09 UTC
```

### Using Smart Contracts

```solidity
// Read agent data
(address owner, string memory identityCID, string memory stateCID, uint256 registeredAt, bool isActive) 
  = AgentRegistry.getAgent(agentAddress);

// Read reputation
(uint256 score, string memory historyCID, string memory proofCID, uint256 actionCount, uint256 lastUpdated) 
  = ReputationOracle.getReputation(agentAddress);
```

### Verifying Filecoin Data

```bash
# Fetch identity from Filecoin
ipfs get <identity_CID>

# Verify signature matches on-chain data
# Check timestamp is valid
# Confirm action count matches history length
```

---

## Architecture

```
┌─────────────────┐
│   AI Agent      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│        FARS Backend API                 │
│  • GitHub Scanner                       │
│  • Blockchain Indexer                   │
│  • Reputation Calculator                │
└────────┬────────────────────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌─────────┐ ┌──────────────────┐
│Filecoin │ │ Smart Contracts  │
│Storage  │ │  (Base Sepolia)  │
│         │ │                  │
│Identity │ │ • AgentRegistry  │
│History  │ │ • ReputationOracle│
│Proofs   │ │                  │
└─────────┘ └──────────────────┘
```

### Data Flow

1. **Agent Action** → Event logged (GitHub, blockchain, etc.)
2. **FARS Backend** → Indexes action, updates internal state
3. **Daily Sync** → Calculates new score, generates proofs
4. **Filecoin Upload** → Stores updated history + proofs
5. **On-Chain Update** → Smart contract records new CID + score

---

## Technical Details

### Storage Layer (Filecoin)

- **Protocol:** Synapse SDK
- **Network:** Filecoin Calibration Testnet (mainnet ready)
- **Data Format:** JSON (gzipped for large histories)
- **Retrieval:** IPFS gateway + direct Filecoin API

### Smart Contracts (Base Sepolia)

**AgentRegistry.sol**
```solidity
function registerAgent(address agentAddress, string memory identityCID) public
function updateAgentState(address agentAddress, string memory stateCID) public
function getAgent(address agentAddress) public view returns (Agent memory)
```

**ReputationOracle.sol**
```solidity
function updateReputation(
  address agentAddress,
  uint256 score,
  string memory historyCID,
  string memory proofOfHistoryCID,
  uint256 actionCount
) public

function getReputation(address agentAddress) public view returns (Reputation memory)
```

### API Endpoints

All paid endpoints use **x402 micropayments** (USDC on Base):

```
# Free endpoints
GET    /health                           # Free
GET    /api/pricing                      # Free

# Paid endpoints (x402 required)
POST   /api/identity/create              # $0.10 USDC
GET    /api/identity/:cid                # $0.01 USDC
POST   /api/reputation/calculate         # $0.25 USDC
GET    /api/reputation/:address          # $0.05 USDC
GET    /api/history/:cid                 # $0.03 USDC
GET    /api/proof/:cid                   # $0.03 USDC
POST   /api/agent/register               # $0.50 USDC (full flow)
```

**Why x402?**
- Prevents API spam/abuse
- Economic sybil resistance (paid attestations)
- Sustainable infrastructure funding
- Pay-per-call (no subscriptions)

---

## Use Cases

### 1. Autonomous Hiring

A DAO needs an agent for data analysis:

```bash
# Query agents with data science skills + reputation > 500
SELECT * FROM agents WHERE skills LIKE '%data%' AND reputation > 500

# Verify top candidate's history on Filecoin
fars verify 0xTopCandidateAddress

# Hire with confidence based on verifiable track record
```

### 2. Cross-Platform Portability

Agent moves from Platform A to Platform B:

```
Platform A                      Platform B
    │                               │
    ├── Agent worked here 6 months  │
    ├── Reputation: 850             │
    │                               │
    └─────── Agent migrates ────────┤
                                    │
                            ┌───────▼────────┐
                            │ FARS Lookup    │
                            │ CID: bafybe... │
                            └───────┬────────┘
                                    │
                            Platform B sees:
                            • Full history
                            • Verified score
                            • Proof on Filecoin
```

**No trust required** - Platform B independently verifies Filecoin data.

### 3. Reputation Staking

High-reputation agents can **stake their reputation** as collateral:

```solidity
// Lock reputation to guarantee service quality
ReputationStaking.lockReputation(agentAddress, requiredScore, duration);

// If service fails, reputation is slashed
ReputationStaking.slashReputation(agentAddress, penaltyAmount);
```

---

## Security Model

### Identity Ownership

- **Agent address** = Private key holder controls identity
- **On-chain registration** = Only owner can update
- **Multi-sig support** = Enterprise agents can use multi-sig

### Proof Verification

1. **Filecoin CID** matches on-chain record
2. **Action signatures** verified against agent key
3. **Timestamp ordering** prevents backdating
4. **Merkle proofs** prevent selective disclosure

### Anti-Gaming Mechanisms

- **Sybil resistance** - GitHub account age + contribution quality
- **Action throttling** - Max reputation per day
- **Slashing** - Provably false claims result in score reduction
- **Human review** - Disputes resolved by governance DAO

---

## Roadmap

### Phase 1 (Current - March 2026)
- ✅ Smart contracts deployed
- ✅ Filecoin integration working
- ✅ GitHub reputation tracking
- ✅ CLI tool
- ✅ Basic API

### Phase 2 (April 2026)
- [ ] Web dashboard
- [ ] Additional data sources (Twitter, Discord)
- [ ] Reputation staking contracts
- [ ] Mainnet deployment

### Phase 3 (Q2 2026)
- [ ] Cross-chain support (Ethereum, Polygon, Arbitrum)
- [ ] Agent marketplace integration
- [ ] Reputation-based access control (token gating)
- [ ] DAO governance for disputes

### Phase 4 (Q3 2026)
- [ ] Zero-knowledge proofs (private reputation)
- [ ] Federated reputation (multiple oracles)
- [ ] Enterprise SaaS offering
- [ ] Mobile app

---

## FAQ

### Q: Is my agent's data private?

**A:** Identity and reputation scores are **public by default** (needed for verification). Future releases will support zero-knowledge proofs for selective disclosure.

### Q: What if my private key is compromised?

**A:** You can **transfer ownership** on-chain to a new address. Your Filecoin history remains intact but points to the new owner.

### Q: How much does it cost to use FARS?

**A:**
- **Gas fees** (Base network):
  - Registration: ~0.0002 ETH (one-time)
  - Reputation updates: ~0.0001 ETH per update
- **API fees** (x402 micropayments in USDC):
  - Agent registration: $0.50
  - Reputation calculation: $0.25
  - Reputation query: $0.05
  - Identity/history retrieval: $0.01-$0.03
- **Free tier**: 10 queries/day (health checks, pricing info)
- **Filecoin storage:** Covered by protocol fees

### Q: Can I use FARS on mainnet?

**A:** Currently deployed on Base Sepolia (testnet). Mainnet launch planned for April 2026 after security audits.

### Q: How do I integrate FARS into my app?

**A:**
```javascript
// Install SDK
npm install @fars/sdk

// Query reputation
import { FARS } from '@fars/sdk';
const reputation = await FARS.getReputation('0xAgentAddress');

// Display agent profile
<AgentProfile address="0x..." showReputation={true} />
```

### Q: What prevents fake GitHub contributions?

**A:** We check:
- Account age (must be > 6 months)
- PR quality (lines changed, files touched)
- Repository legitimacy (stars, forks, activity)
- Maintainer reviews (approved vs rejected)

---

## Getting Started

### For Agents

```bash
# 1. Install CLI
npm install -g @fars/cli

# 2. Register your agent
fars register <your_agent_address> <github_username>

# 3. Start building reputation!
# (Actions are tracked automatically)
```

### For Developers

```bash
# Clone the repo
git clone https://github.com/GeObts/filecoin-agent-reputation
cd filecoin-agent-reputation

# Install dependencies
npm install

# Run backend
cd backend && npm run dev

# Run tests
npm test
```

### For Platforms

```javascript
// Verify agent before allowing access
const agent = await FARS.getAgent('0xAddress');
if (agent.reputation.score < 100) {
  throw new Error('Insufficient reputation');
}

// Log agent actions to earn them reputation
await FARS.logAction({
  agentAddress: '0xAddress',
  actionType: 'task_completed',
  metadata: { taskId: 123, quality: 'excellent' }
});
```

---

## Community & Support

- **GitHub:** [github.com/GeObts/filecoin-agent-reputation](https://github.com/GeObts/filecoin-agent-reputation)
- **Documentation:** [docs.fars.io](https://docs.fars.io) *(coming soon)*
- **Discord:** [discord.gg/fars](https://discord.gg/fars) *(coming soon)*
- **Twitter:** [@FARSProtocol](https://twitter.com/FARSProtocol) *(coming soon)*

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Code style guidelines
- How to submit PRs
- Bounty program
- Governance proposals

---

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

**Built with:**
- Filecoin (Synapse SDK)
- Base (Ethereum L2)
- Solidity (Smart Contracts)
- TypeScript (Backend)
- Node.js (CLI)

<<<<<<< HEAD
**Hackathon:** PL_Genesis - Frontiers of Collaboration (March 2026)
=======
>>>>>>> 6b5457b95709baa3b3ce27057aea5d4226f98ee3

# Filecoin Agent Reputation System (FARS)

**Decentralized identity and reputation for AI agents, anchored on Filecoin.**

<<<<<<< HEAD
🏆 **Hackathon:** PL_Genesis - Frontiers of Collaboration  
🎯 **Challenge:** Filecoin #3 - Agent Reputation & Portable Identity  
📅 **Timeline:** March 10-16, 2026  
👤 **Team:** Goyabean / 0xdas / beanbot / teeclaw

## Overview

FARS creates a trustless, portable reputation system for AI agents using Filecoin for immutable storage and smart contracts for on-chain verification. Agents can build reputation across platforms and prove their history cryptographically.
=======
FARS provides a trustless, portable reputation system for AI agents using Filecoin for immutable storage and smart contracts for on-chain verification. Agents can build reputation across platforms and prove their history cryptographically.

---

## Features

- **On-Chain Identity**: ERC-8004 agent registration on Base
- **Immutable Storage**: Agent state and credentials stored on Filecoin
- **Verifiable Reputation**: Cryptographic proofs of contributions and achievements
- **Portable Identity**: Agents own their reputation across platforms
- **REST API**: Simple integration for agents and applications

---
>>>>>>> 6b5457b95709baa3b3ce27057aea5d4226f98ee3

## Architecture

```
<<<<<<< HEAD
AI Agent → Backend API → Reputation Service → Filecoin (Synapse SDK)
                  ↓
            Smart Contracts (Base Sepolia)
```

**Components:**
- **AgentRegistry.sol** - Maps agent addresses to Filecoin CIDs
- **ReputationOracle.sol** - Stores reputation scores with cryptographic proofs
- **Synapse SDK** - Handles Filecoin storage operations
- **Reputation Service** - Calculates scores from GitHub PRs, on-chain activity
- **CLI Tool** - Verify identities, calculate scores, register agents

## Demo

### Verify an Agent

```bash
cd cli
npx tsx src/index.ts verify 0x0eD39Ba9Ab663A20D65cc6e3927dDe40e37309d4
```

Output:
```
🔍 Verifying agent identity...

✅ Identity verified on Filecoin
CID: bafybeib30783065443339426139416236363341323044363563633665
Reputation Score: 400
GitHub: GeObts
Registered: 2026-03-11
```

### Calculate Reputation Score

```bash
npx tsx src/index.ts score GeObts
```

### Register New Agent

```bash
npx tsx src/index.ts register 0xYourAddress YourGitHub
```

## Smart Contracts (Base Sepolia)

- **AgentRegistry:** `0x644337Ca322C90098b5F3657Bde2b661e28d9e0E`
- **ReputationOracle:** `0xb7FaEDd691a1d9e02A348a09456F6D3E39355FF1`

[View on BaseScan](https://sepolia.basescan.org/address/0x644337Ca322C90098b5F3657Bde2b661e28d9e0E)

## Installation

### Prerequisites
- Node.js 18+
- pnpm or npm

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Add your keys to .env
npm run dev
```

### CLI Setup

```bash
cd cli
npm install
npm run build
```

## Tech Stack

- **Smart Contracts:** Solidity
- **Backend:** TypeScript, Express
- **Storage:** Filecoin via Synapse SDK
- **Data Sources:** GitHub API (Octokit)
- **Blockchain:** Base Sepolia (EVM)

## Reputation Scoring

Agents earn reputation from:
- **Code Contributions** (GitHub PRs, commits)
- **Blockchain Activity** (transactions, contract interactions)
- **Agent Interactions** (verified cross-agent communication)
- **Uptime** (availability and reliability)

## Why Filecoin?

- **Immutability** - Identity documents can't be altered
- **Portability** - Same CID works across all platforms
- **Decentralization** - No single point of control
- **Proof-of-History** - Cryptographic verification of past actions

## Roadmap

- [x] Smart contract deployment
- [x] Backend API with Filecoin integration
- [x] CLI tool for verification
- [x] GitHub reputation scoring
- [ ] Frontend UI
- [ ] Cross-chain verification
- [ ] Additional data sources (Twitter, Discord)
- [ ] Merkle tree proof-of-history
=======
AI Agent → Backend API → Smart Contracts (Base)
                ↓
          Filecoin Storage (Synapse SDK)
```

**Components:**
- **Smart Contracts**: AgentRegistry + ReputationOracle on Base Sepolia
- **Backend API**: Node.js + Express REST API
- **CLI Tool**: Command-line interface for registration and verification
- **Storage**: Filecoin via Synapse SDK for state persistence

---

## Quick Start

### Prerequisites

- Node.js 18+
- Ethereum wallet with Base Sepolia testnet ETH

### Installation

```bash
# Clone repository
git clone https://github.com/GeObts/filecoin-agent-reputation.git
cd filecoin-agent-reputation

# Install backend dependencies
cd backend
npm install

# Install CLI dependencies
cd ../cli
npm install
```

### Configuration

Create `backend/.env`:

```bash
PRIVATE_KEY=your_private_key_here
WALLET_ADDRESS=your_wallet_address_here
GITHUB_TOKEN=your_github_token_here

# Contract addresses (Base Sepolia)
AGENT_REGISTRY_ADDRESS=0x644337Ca322C90098b5F3657Bde2b661e28d9e0E
REPUTATION_ORACLE_ADDRESS=0xb7FaEDd691a1d9e02A348a09456F6D3E39355FF1

# RPC endpoints
BASE_SEPOLIA_RPC=https://sepolia.base.org
FILECOIN_CALIBRATION_RPC=https://api.calibration.node.glif.io/rpc/v1
```

### Running the Backend

```bash
cd backend
npm start
```

API runs on `http://localhost:3000`

---

## Usage

### Register an Agent

```bash
cd cli
npm run register -- \
  --name "MyAgent" \
  --description "AI assistant" \
  --github-id 12345
```

### Verify Agent Identity

```bash
npm run verify -- --address 0x...
```

### Query Reputation Score

```bash
npm run score -- --address 0x...
```

---

## API Endpoints

### `POST /api/agents/register`

Register a new agent on-chain.

**Request:**
```json
{
  "name": "agent-name",
  "description": "What the agent does",
  "githubId": 12345,
  "contributionProofs": [...]
}
```

**Response:**
```json
{
  "address": "0x...",
  "tx": "0x...",
  "stateCID": "bafy..."
}
```

### `GET /api/agents/:address`

Retrieve agent profile and reputation.

**Response:**
```json
{
  "name": "agent-name",
  "reputationScore": 400,
  "stateCID": "bafy...",
  "verified": true
}
```

---

## Smart Contracts

### AgentRegistry

Manages agent identities on Base Sepolia.

**Address:** `0x644337Ca322C90098b5F3657Bde2b661e28d9e0E`

**Methods:**
- `registerAgent(name, stateCID)` - Register new agent
- `updateState(agentId, newCID)` - Update agent state
- `getAgent(address)` - Query agent data

### ReputationOracle

Tracks and updates agent reputation scores.

**Address:** `0xb7FaEDd691a1d9e02A348a09456F6D3E39355FF1`

**Methods:**
- `updateReputation(agentId, score)` - Update score
- `getReputation(address)` - Query current score

---

## Documentation

- [How It Works](./HOW_IT_WORKS.md) - System architecture and technical details
- [API Documentation](./docs/API.md) - Full REST API reference
- [Quick Start Guide](./docs/QUICK_START.md) - Step-by-step setup

---

## Tech Stack

- **Blockchain**: Base (Ethereum L2)
- **Storage**: Filecoin (via Synapse SDK)
- **Backend**: Node.js + Express + ethers.js
- **Contracts**: Solidity 0.8.20
- **CLI**: TypeScript

---
>>>>>>> 6b5457b95709baa3b3ce27057aea5d4226f98ee3

## License

MIT

<<<<<<< HEAD
## Contact

- **GitHub:** [@GeObts](https://github.com/GeObts)
- **Agent:** beansai.eth
- **Address:** 0x0eD39Ba9Ab663A20D65cc6e3927dDe40e37309d4
=======
---

## Contributing

Contributions welcome! Please open an issue or pull request.

---

**Built with ❤️ for the future of decentralized AI agents.**
>>>>>>> 6b5457b95709baa3b3ce27057aea5d4226f98ee3

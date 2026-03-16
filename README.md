# Filecoin Agent Reputation System (FARS)

**Decentralized identity and reputation for AI agents, anchored on Filecoin.**

🏆 **Hackathon:** PL_Genesis - Frontiers of Collaboration  
🎯 **Challenge:** Filecoin #3 - Agent Reputation & Portable Identity  
📅 **Timeline:** March 10-16, 2026  
👤 **Team:** Goyabean / 0xdas / beanbot / teeclaw

---

## Overview

FARS provides a trustless, portable reputation system for AI agents using Filecoin for immutable storage and smart contracts for on-chain verification. Agents can build reputation across platforms and prove their history cryptographically.

---

## Features

- **On-Chain Identity**: ERC-8004 agent registration on Base
- **Immutable Storage**: Agent state and credentials stored on Filecoin
- **Verifiable Reputation**: Cryptographic proofs of contributions and achievements
- **Portable Identity**: Agents own their reputation across platforms
- **REST API**: Simple integration for agents and applications

---

## Architecture

```
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

⚠️ **SECURITY WARNING**: Never commit `.env` files to git! They contain private keys and sensitive credentials.

Frontend configuration (`.env.local`):

```bash
# API Configuration (uses frontend serverless routes)
NEXT_PUBLIC_API_URL=/api

# Contract Addresses (Base Sepolia)
NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS=0x644337Ca322C90098b5F3657Bde2b661e28d9e0E
NEXT_PUBLIC_REPUTATION_ORACLE_ADDRESS=0xb7FaEDd691a1d9e02A348a09456F6D3E39355FF1

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_CHAIN_NAME=Base Sepolia

# Optional: GitHub token for reputation calculations
GITHUB_TOKEN=your_github_token_here  # KEEP SECRET - DO NOT COMMIT
```

Backend configuration (optional - frontend includes serverless API routes):

```bash
# Only needed if running standalone backend
PRIVATE_KEY=your_private_key_here  # ⚠️ NEVER COMMIT THIS
WALLET_ADDRESS=your_wallet_address_here
GITHUB_TOKEN=your_github_token_here

# Contract addresses (Base Sepolia)
AGENT_REGISTRY_ADDRESS=0x644337Ca322C90098b5F3657Bde2b661e28d9e0E
REPUTATION_ORACLE_ADDRESS=0xb7FaEDd691a1d9e02A348a09456F6D3E39355FF1

# RPC endpoints
BASE_SEPOLIA_RPC=https://sepolia.base.org
FILECOIN_CALIBRATION_RPC=https://api.calibration.node.glif.io/rpc/v1
```

### Running the Application

**Production (Vercel):**
- Live at: https://filecoin-agent-reputation.vercel.app
- Frontend includes serverless API routes (no separate backend needed)

**Local Development:**

```bash
# Frontend (includes API routes)
cd frontend
npm run dev
```

Frontend runs on `http://localhost:3000` with built-in API at `/api/*`

**Optional Standalone Backend:**

```bash
# Only if you want to run backend separately
cd backend
npm start
```

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

## License

MIT

---

## Contributing

Contributions welcome! Please open an issue or pull request.

---

**Built with ❤️ for the future of decentralized AI agents.**

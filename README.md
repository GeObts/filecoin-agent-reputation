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
- **💳 x402 Micropayments**: Pay-per-call pricing with USDC on Base (prevents spam, sustainable revenue)

---

## Architecture

```
AI Agent → Next.js Frontend (Vercel) → Smart Contracts (Base)
                ↓
          Filecoin Storage (Synapse SDK)
```

**Components:**
- **Frontend**: Next.js with RainbowKit wallet integration
- **Serverless API**: Next.js API routes (`/api/*`) deployed to Vercel
- **Smart Contracts**: AgentRegistry + ReputationOracle on Base Sepolia
- **Storage**: Filecoin via Synapse SDK for state persistence
- **CLI Tool**: Command-line interface for advanced operations (optional)

---

## Quick Start

### Live Demo

🌐 **Production:** https://filecoin-agent-reputation.vercel.app

### Prerequisites

- Node.js 18+
- Ethereum wallet with Base Sepolia testnet ETH

### Installation

```bash
# Clone repository
git clone https://github.com/GeObts/filecoin-agent-reputation.git
cd filecoin-agent-reputation

# Install frontend dependencies (includes API routes)
cd frontend
npm install

# Copy environment file
cp .env.example .env.local
# Edit .env.local with your values (optional GITHUB_TOKEN)
```

### Configuration

⚠️ **SECURITY WARNING**: Never commit `.env` files to git! They contain private keys and sensitive credentials.

> **Note for this repository**: A `.env` file was accidentally committed in early development and later removed. If you're deploying this code, **use fresh API keys and wallet addresses** - do not reuse any credentials from git history.

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

**Local Development:**

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:3000` with serverless API routes at `/api/*`

**Deployment to Vercel:**

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Set root directory to `frontend/`
4. Add environment variables in Vercel dashboard:
   - `GITHUB_TOKEN` (optional - for GitHub activity verification)
   - All `NEXT_PUBLIC_*` vars are already in `.env.local`
5. Deploy

The `/backend` folder is ignored via `.vercelignore` - all API routes are in `frontend/src/app/api/`

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
- [x402 Payment Integration](./docs/X402_INTEGRATION.md) - Micropayments, pricing, business model
- [Quick Start Guide](./docs/QUICK_START.md) - Step-by-step setup

---

## Business Model

FARS uses **x402 micropayments** (USDC on Base) for sustainable infrastructure:

### Pricing
- **Free Tier**: 10 queries/day (health checks, public info)
- **Agent Registration**: $0.50 one-time
- **Reputation Query**: $0.05 (lightweight lookup)
- **Reputation Calculation**: $0.25 (full analysis + Filecoin storage)
- **Identity Operations**: $0.01 - $0.10

### Why Pay-Per-Call?
1. **Prevents Spam**: Economic barrier discourages API abuse
2. **Sybil Resistance**: Paid attestations prevent fake reviews
3. **No Subscriptions**: Pay only for what you use
4. **Instant Settlement**: USDC payments settle in seconds on Base

See [X402_INTEGRATION.md](./docs/X402_INTEGRATION.md) for full pricing details.

## Tech Stack

- **Blockchain**: Base (Ethereum L2)
- **Storage**: Filecoin (via Synapse SDK)
- **Backend**: Node.js + Express + ethers.js
- **Contracts**: Solidity 0.8.20
- **CLI**: TypeScript
- **Payments**: x402 Protocol (USDC on Base)

---

## License

MIT

---

## Contributing

Contributions welcome! Please open an issue or pull request.

---

**Built with ❤️ for the future of decentralized AI agents.**

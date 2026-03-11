# Filecoin Agent Reputation System (FARS)

**Decentralized identity and reputation for AI agents, anchored on Filecoin.**

🏆 **Hackathon:** PL_Genesis - Frontiers of Collaboration  
🎯 **Challenge:** Filecoin #3 - Agent Reputation & Portable Identity  
📅 **Timeline:** March 10-16, 2026  
👤 **Team:** beanbot / beansai.eth

## Overview

FARS creates a trustless, portable reputation system for AI agents using Filecoin for immutable storage and smart contracts for on-chain verification. Agents can build reputation across platforms and prove their history cryptographically.

## Architecture

```
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

## License

MIT

## Contact

- **GitHub:** [@GeObts](https://github.com/GeObts)
- **Agent:** beansai.eth
- **Address:** 0x0eD39Ba9Ab663A20D65cc6e3927dDe40e37309d4

# Filecoin Agent Reputation System (FARS)

**Decentralized identity and reputation for AI agents, anchored on Filecoin.**

**Hackathon:** PL_Genesis - Frontiers of Collaboration
**Challenge:** Filecoin #3 - Agent Reputation & Portable Identity
**Team:** Goyabean / 0xdas / beanbot / teeclaw
**Live Demo:** https://filecoin-agent-reputation.vercel.app

---

## Overview

FARS provides a trustless, portable reputation system for AI agents. Agents register on-chain, build verifiable reputation from real activity, and carry that identity across platforms — all backed by immutable Filecoin storage and cryptographic proofs.

### Key Features

- **On-Chain Identity** — ERC-8004 agent registration on Base with Filecoin-anchored CIDs
- **Verifiable Reputation** — SHA-256 Merkle tree proofs of agent activity, stored on Filecoin
- **Portable Identity** — Agents own their reputation; it travels across platforms via CID
- **x402 Micropayments** — Pay-per-call API pricing in USDC on Base (prevents spam, funds infrastructure)
- **On-Chain Proof Verification** — `verifyProofHash()` lets anyone check a Merkle root against the contract

---

## Architecture

```
AI Agent (any platform)
        │
        ▼
┌──────────────────────────────────────────┐
│       FARS API (Next.js Serverless)      │
│  x402 Payment Verification (USDC)        │
│  Reputation Calculation (SHA-256 Merkle)  │
│  Identity Management                     │
└────────────┬──────────────┬──────────────┘
             │              │
        ┌────▼────┐    ┌────▼──────┐
        │Filecoin │    │   Base    │
        │ Storage │    │ Sepolia  │
        │         │    │          │
        │Identity │    │Registry  │
        │History  │    │Oracle    │
        │Proofs   │    │          │
        └─────────┘    └──────────┘
```

**Stack:** Next.js 16 + React 19 | RainbowKit + wagmi | Solidity 0.8.20 | Synapse SDK | x402 Protocol

---

## Smart Contracts (Base Sepolia)

| Contract | Address | Purpose |
|----------|---------|---------|
| **AgentRegistry** | [`0x644337...9e0E`](https://sepolia.basescan.org/address/0x644337Ca322C90098b5F3657Bde2b661e28d9e0E) | Agent identity registration, state CID management |
| **ReputationOracle** | [`0xb7FaED...5FF1`](https://sepolia.basescan.org/address/0xb7FaEDd691a1d9e02A348a09456F6D3E39355FF1) | Reputation scores, proof CIDs, on-chain proof verification |

### Key Contract Methods

```solidity
// Register agent with Filecoin identity CID
AgentRegistry.registerAgent(agentAddress, identityCID)

// Update reputation with Merkle proof hash
ReputationOracle.updateReputationWithProof(agentAddress, score, historyCID, proofCID, proofHash, actionCount)

// Anyone can verify a proof on-chain
ReputationOracle.verifyProofHash(agentAddress, claimedProofHash) → bool
```

---

## API Endpoints

All paid endpoints use [x402 micropayments](./docs/X402_INTEGRATION.md) (USDC on Base).

| Endpoint | Method | Price | Description |
|----------|--------|-------|-------------|
| `/api/health` | GET | Free | Health check |
| `/api/pricing` | GET | Free | Pricing info |
| `/api/agent/register` | POST | $0.50 | Register agent (full flow) |
| `/api/identity/create` | POST | $0.10 | Create identity document |
| `/api/identity/:cid` | GET | $0.01 | Retrieve identity by CID |
| `/api/reputation/calculate` | POST | $0.25 | Calculate reputation score |
| `/api/history/:cid` | GET | $0.03 | Retrieve action history |
| `/api/proof/:cid` | GET | $0.03 | Retrieve proof-of-history |

---

## Quick Start

### Live Demo

Visit https://filecoin-agent-reputation.vercel.app — connect a Base Sepolia wallet to register and view agents.

### Local Development

```bash
git clone https://github.com/GeObts/filecoin-agent-reputation.git
cd filecoin-agent-reputation/frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your values

# Run dev server
npm run dev
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS` | Yes | AgentRegistry contract address |
| `NEXT_PUBLIC_REPUTATION_ORACLE_ADDRESS` | Yes | ReputationOracle contract address |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Yes | From [cloud.walletconnect.com](https://cloud.walletconnect.com) |
| `GITHUB_TOKEN` | No | For GitHub activity in reputation scores |
| `PAYMENT_RECIPIENT_ADDRESS` | No | Your wallet for x402 payments (blank = dev mode) |

### Deploy to Vercel

1. Import repo in Vercel dashboard
2. Set root directory to `frontend/`
3. Add environment variables in Vercel settings
4. Deploy

---

## How It Works

1. **Register** — Agent calls `registerAgent()` with a Filecoin identity CID
2. **Build Reputation** — FARS tracks GitHub activity, blockchain transactions, and agent interactions
3. **Generate Proof** — Actions are hashed with SHA-256 into a Merkle tree; root is stored on-chain
4. **Verify** — Anyone can call `verifyProofHash()` to check an agent's proof against the contract
5. **Port Identity** — The Filecoin CID is permanent and platform-agnostic

See [HOW_IT_WORKS.md](./HOW_IT_WORKS.md) for the full technical deep dive.

---

## Project Structure

```
frontend/              Main application (Next.js 16)
  src/app/api/         Serverless API routes (Vercel)
  src/components/      React components (shadcn + custom)
  src/lib/             Services, contracts, utilities
  src/hooks/           React hooks (wagmi, GSAP, Filecoin)
contracts/             Solidity smart contracts
  src/                 AgentRegistry.sol, ReputationOracle.sol
cli/                   CLI tool for agent operations
backend/               Express backend (deprecated; replaced by serverless)
docs/                  API reference, x402 integration guide
```

---

## Documentation

- [How It Works](./HOW_IT_WORKS.md) — Architecture, scoring formula, proof system
- [x402 Integration](./docs/X402_INTEGRATION.md) — Micropayments, pricing, business model
- [Quick Start](./docs/QUICK_START.md) — Setup and first registration
- [Submission](./SUBMISSION.md) — Hackathon submission summary

---

## Security

- Build-time environment validation prevents missing config
- Security headers (X-Frame-Options, CSP, HSTS) on all responses
- x402 payment proof format validation
- SHA-256 Merkle tree proofs (not base64)
- On-chain proof hash verification

> **Note:** A `.env` file was accidentally committed early in development and later removed. If deploying, use fresh credentials — do not reuse anything from git history.

---

## License

MIT

---

**Built for PL_Genesis - Frontiers of Collaboration (March 2026)**

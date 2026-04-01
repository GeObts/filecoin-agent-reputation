# FARS - Filecoin Agent Reputation System
## PL_Genesis Hackathon | Filecoin Challenge #3

**Team:** Goyabean / 0xdas / beanbot / teeclaw
**Live Demo:** https://filecoin-agent-reputation.vercel.app
**GitHub:** https://github.com/GeObts/filecoin-agent-reputation

---

## What is FARS?

A decentralized reputation and identity system for AI agents. Agents register on-chain, build verifiable reputation from real blockchain activity, and carry that identity across platforms -- all backed by immutable Filecoin storage and cryptographic proofs.

**The problem:** AI agents have no portable, verifiable reputation. Every platform starts them at zero. There's no way to prove an agent is trustworthy.

**Our solution:** FARS gives every agent a permanent, cryptographically verifiable reputation anchored on Filecoin and Base.

---

## How It Works

```
1. Agent registers via API  -->  Identity CID computed + stored
2. Blockchain activity scanned  -->  Reputation score calculated
3. Merkle proof generated  -->  SHA-256 tree of all actions
4. Data persisted  -->  Redis (instant) + Filecoin CIDs (permanent)
5. Anyone can verify  -->  On-chain proof hash verification
```

---

## Architecture

```
AI Agent (any platform)
        |
        v
+------------------------------------------+
|       FARS API (Next.js Serverless)      |
|  x402 Payment Verification (USDC)        |
|  Reputation Calculation (SHA-256 Merkle)  |
|  Persistent Redis Storage                |
+----------+--------------+---------------+
           |              |
      +----v----+    +----v------+
      |Filecoin |    |   Base    |
      | Storage |    | Sepolia  |
      |         |    |          |
      |Identity |    |Registry  |
      |History  |    |Oracle    |
      |Proofs   |    |          |
      +---------+    +----------+
```

---

## Smart Contracts (Base Sepolia)

| Contract | Address |
|----------|---------|
| AgentRegistry | 0x644337Ca322C90098b5F3657Bde2b661e28d9e0E |
| ReputationOracle | 0xb7FaEDd691a1d9e02A348a09456F6D3E39355FF1 |

Key contract features:
- registerAgent() -- On-chain agent identity with Filecoin CID
- updateReputationWithProof() -- Score + Merkle root anchored on-chain
- verifyProofHash() -- Trustless on-chain proof verification
- getScoreBreakdown() -- Transparent scoring categories

---

## Tech Stack

- **Frontend:** Next.js 16, React 19, RainbowKit, wagmi, Tailwind CSS
- **Smart Contracts:** Solidity 0.8.20 on Base Sepolia
- **Storage:** Filecoin (via Synapse SDK), Redis (Vercel)
- **Payments:** x402 Protocol (USDC on Base)
- **Deployment:** Vercel (serverless)

---

## API Endpoints (Live)

| Endpoint | Method | Price | Description |
|----------|--------|-------|-------------|
| /api/health | GET | Free | Health check |
| /api/pricing | GET | Free | Full pricing info |
| /api/agent/register | POST | $0.50 | Register agent with CIDs + reputation |
| /api/agent/[address] | GET | Free | Look up stored agent data |
| /api/reputation/calculate | POST | $0.25 | Compute reputation + Merkle proof |
| /api/identity/create | POST | $0.10 | Create identity document |
| /api/identity/[cid] | GET | $0.01 | Retrieve identity by CID |
| /api/history/[cid] | GET | $0.03 | Retrieve history by CID |
| /api/proof/[cid] | GET | $0.03 | Retrieve proof by CID |

Payment: USDC on Base via x402 headers. Dev mode: payments disabled (no recipient configured).

---

## Features Demonstrated

### 1. On-Chain Agent Identity
Agents register with a wallet address and receive content-addressed CIDs for their identity, history, and proof documents. All stored on Filecoin.

### 2. Verifiable Reputation Scoring
Reputation is calculated from real blockchain activity (Base Sepolia transactions). Scores are broken down into categories: agent tasks, blockchain activity, interactions, uptime.

### 3. Cryptographic Proof of History
Every reputation calculation generates a SHA-256 Merkle tree of all tracked actions. The Merkle root can be verified on-chain via verifyProofHash().

### 4. Persistent Storage
Agent registration data is persisted in Redis so anyone can look up any registered agent at any time. CIDs provide content-addressed references to Filecoin-stored documents.

### 5. x402 Micropayments
Pay-per-call API pricing in USDC on Base. No subscriptions. Prevents spam and funds infrastructure. Graceful dev-mode bypass.

### 6. Full Web UI
Dashboard with agent stats, leaderboard, registration wizard, agent profile pages, and a Verify page that checks on-chain + stored + computed reputation.

---

## What Makes FARS Different

1. **Truly Portable** -- Reputation lives on Filecoin, not locked to any platform
2. **Cryptographically Verifiable** -- Merkle proofs prevent fake histories
3. **Economically Sustainable** -- x402 micropayments fund infrastructure
4. **Sybil Resistant** -- Paid attestations prevent spam/fake reviews
5. **Platform Agnostic** -- Any agent on any platform can integrate via REST API

---

## Try It

1. Visit https://filecoin-agent-reputation.vercel.app
2. Connect wallet (Base Sepolia)
3. Register an agent or search existing ones
4. Verify an agent's reputation on the Verify page

API test:
```bash
# Check health
curl https://filecoin-agent-reputation.vercel.app/api/health

# Register an agent
curl -X POST https://filecoin-agent-reputation.vercel.app/api/agent/register \
  -H "Content-Type: application/json" \
  -d '{"agentId":"0xYOUR_ADDRESS","name":"my-agent","type":"assistant","capabilities":["chat"]}'

# Look up an agent
curl https://filecoin-agent-reputation.vercel.app/api/agent/0xYOUR_ADDRESS

# Calculate reputation
curl -X POST https://filecoin-agent-reputation.vercel.app/api/reputation/calculate \
  -H "Content-Type: application/json" \
  -d '{"agentAddress":"0xYOUR_ADDRESS"}'
```

---

## Future Roadmap

- Mainnet deployment (Base + Filecoin mainnet)
- Cross-chain reputation (Ethereum, Arbitrum, Polygon)
- Zero-knowledge proofs for private reputation
- Agent marketplace integration
- Reputation staking contracts

---

## Team

**Goyabean** -- Lead developer
**0xdas / beanbot / teeclaw** -- AI agent team

Built for PL_Genesis Hackathon -- Filecoin Challenge #3: Agent Reputation & Portable Identity

---

**GitHub:** https://github.com/GeObts/filecoin-agent-reputation
**Live:** https://filecoin-agent-reputation.vercel.app
**License:** MIT

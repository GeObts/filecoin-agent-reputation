# PL_Genesis Hackathon Submission

## Project: Filecoin Agent Reputation System (FARS)

**Challenge:** Filecoin #3 - Agent Reputation & Portable Identity  
**Team:** Goyabean (@Goya_bean)  
**GitHub:** https://github.com/GeObts/filecoin-agent-reputation  
**Live Demo:** https://filecoin-agent-reputation.vercel.app  
**Deployed:** March 31, 2026

---

## 🎯 What We Built

A **decentralized reputation and identity system** for AI agents, combining:

- **Filecoin** for immutable storage of agent identities, histories, and proofs
- **Base L2** for on-chain agent registry and reputation oracle smart contracts
- **x402 Protocol** for micropayments (USDC on Base) to prevent spam and fund infrastructure
- **Synapse SDK** for Filecoin integration
- **Next.js** serverless API deployed on Vercel

---

## ✨ Key Features

### 1. **On-Chain Agent Identity**
- ERC-8004 compatible agent registration
- Permanent Filecoin CIDs for portable identity
- Verifiable across any platform

### 2. **Reputation Tracking**
- GitHub activity analysis (PRs, commits, contributions)
- Blockchain activity monitoring
- Cryptographic proof generation
- Merkle tree verification

### 3. **x402 Micropayments**
- Pay-per-call API pricing (no subscriptions)
- USDC on Base for instant settlement
- Economic sybil resistance
- Sustainable revenue model

### 4. **Filecoin Integration**
- **Synapse SDK** for uploads/retrieval
- Identity documents stored permanently
- Action histories with tamper-proof proofs
- Merkle roots for efficient verification

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│              AI Agent (Any Platform)                │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│         FARS API (Next.js Serverless)               │
│  • x402 Payment Verification (USDC)                 │
│  • Reputation Calculation                           │
│  • Identity Management                              │
└────────────┬────────────────────┬────────────────────┘
             │                    │
        ┌────▼────┐          ┌───▼───────┐
        │Filecoin │          │   Base    │
        │Storage  │          │ Contracts │
        │         │          │           │
        │Identity │          │ Registry  │
        │History  │          │ Oracle    │
        │Proofs   │          │           │
        └─────────┘          └───────────┘
```

---

## 🔧 Technical Implementation

### Smart Contracts (Base Sepolia)

**AgentRegistry**: `0x644337Ca322C90098b5F3657Bde2b661e28d9e0E`
- Register new agents
- Update agent state CIDs
- Query agent metadata

**ReputationOracle**: `0xb7FaEDd691a1d9e02A348a09456F6D3E39355FF1`
- Track reputation scores
- Store history/proof CIDs
- Verify action counts

### Filecoin Integration

Using **Synapse SDK** for:
- Uploading identity documents
- Storing action histories
- Persisting cryptographic proofs
- Retrieving data via CIDs

### x402 Micropayments

**Pricing Structure:**
```
FREE:
  /health                     → $0.00
  /api/pricing                → $0.00

BASIC ($0.01-$0.03):
  /api/identity/:cid          → $0.01
  /api/history/:cid           → $0.03
  /api/proof/:cid             → $0.03

PREMIUM ($0.05-$0.10):
  /api/reputation/:address    → $0.05
  /api/identity/create        → $0.10

ENTERPRISE ($0.25-$0.50):
  /api/reputation/calculate   → $0.25
  /api/agent/register         → $0.50
```

**Payment Token:** USDC (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)  
**Network:** Base (chainId 8453)  
**Recipient:** beansai.eth (`0x0eD39Ba9Ab663A20D65cc6e3927dDe40e37309d4`)

---

## 💡 Innovation

### Why FARS is Different

1. **Truly Portable** - Agent reputation lives on Filecoin, not locked to any platform
2. **Cryptographically Verifiable** - Merkle proofs prevent fake histories
3. **Economic Sustainability** - x402 payments fund infrastructure at scale
4. **Sybil Resistant** - Paid attestations prevent spam/fake reviews
5. **Platform Agnostic** - Any service can integrate via simple REST API

### Business Model

Unlike traditional reputation systems (free but unsustainable or subscription-based), FARS uses **micropayments**:

- Agents pay tiny amounts per use (~$0.01-$0.50)
- No monthly subscriptions or commitments
- Infrastructure self-funds through usage
- Scales naturally with adoption

**Example revenue**: 1,000 active agents → ~$2,000/month

---

## 📊 Impact

### For AI Agents
- Build verifiable reputation across platforms
- Prove capabilities cryptographically
- Portable identity that travels with them

### For Platforms
- Trusted agent discovery
- Reduce fraud/sybil attacks
- Easy integration (REST API)

### For Filecoin Ecosystem
- Real-world storage use case
- Demonstrates Synapse SDK capabilities
- Combines storage + compute + payments

---

## 🚀 Live Demo

**Production Site:** https://filecoin-agent-reputation.vercel.app

**Try It:**
1. Connect wallet (Base Sepolia)
2. Register an agent identity
3. View reputation scores
4. Query Filecoin-stored data

**API Pricing:** https://filecoin-agent-reputation.vercel.app/api/pricing

---

## 📦 Deliverables

### Code
- ✅ GitHub repo: https://github.com/GeObts/filecoin-agent-reputation
- ✅ Smart contracts deployed (Base Sepolia)
- ✅ Frontend deployed (Vercel)
- ✅ Comprehensive documentation

### Documentation
- ✅ README.md - Quick start guide
- ✅ HOW_IT_WORKS.md - Technical deep dive
- ✅ X402_INTEGRATION.md - Payment system docs
- ✅ AUDIT.md - Security considerations

### Live System
- ✅ Functional API with x402 payments
- ✅ Filecoin storage via Synapse SDK
- ✅ GitHub reputation tracking
- ✅ Web3 wallet integration

---

## 🔮 Future Roadmap

### Phase 2 (Post-Hackathon)
- [ ] Mainnet deployment (Base + Filecoin)
- [ ] Additional data sources (Twitter, Discord)
- [ ] Reputation staking contracts
- [ ] Security audit

### Phase 3 (Q2 2026)
- [ ] Cross-chain support (Ethereum, Polygon, Arbitrum)
- [ ] Agent marketplace integration
- [ ] Zero-knowledge proofs (private reputation)
- [ ] Mobile app

---

## 🏆 Why This Matters for PL_Genesis

**Filecoin Use Case:**
- Demonstrates **storage utility** beyond archival
- Shows **Synapse SDK** in production
- Proves **real-world viability** of decentralized storage

**Ecosystem Impact:**
- Creates **economic flywheel** (storage + payments + compute)
- Enables **new agent economies**
- Bridges **AI agents + Web3**

**Technical Achievement:**
- Full-stack integration (Filecoin + Base + x402)
- Production-ready architecture
- Sustainable business model

---

## 📞 Contact

**Team:** Goyabean  
**GitHub:** https://github.com/GeObts  
**Telegram:** @Goya_bean  
**Project:** https://github.com/GeObts/filecoin-agent-reputation  

---

## 📄 License

MIT License - see LICENSE for details

---

**Built with ❤️ for the future of decentralized AI agents.**

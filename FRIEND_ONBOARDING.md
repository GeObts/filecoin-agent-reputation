# 🤝 Friend Onboarding - Filecoin Agent Reputation System

## TL;DR

**Project:** Filecoin Agent Reputation System (FARS)  
**Hackathon:** Protocol Labs PL_Genesis  
**Bounty:** $2,500 (Filecoin Challenge #3) + $5,000 (Fresh Code eligible)  
**Deadline:** March 16, 2026 (6 days!)  
**Status:** Day 1 of build - core infrastructure done, now deploying + testing

---

## What We're Building

**One-liner:** LinkedIn for AI agents, but trustless and on-chain.

**Problem:** AI agents can't prove who they are or show their reputation when moving between platforms.

**Solution:** Decentralized identity + reputation system where:
- Agent identities stored as immutable CIDs on Filecoin
- Reputation calculated from verifiable on-chain actions (GitHub PRs, transactions, etc.)
- Works across any blockchain (Ethereum, Base, etc.)
- Cryptographic proofs anchor everything

**Demo Agent:** beansai.eth (real agent with real GitHub PRs + on-chain history)

---

## Tech Stack

### Smart Contracts
- Solidity 0.8.20+
- 2 contracts: AgentRegistry.sol + ReputationOracle.sol
- Deploy to: Base Sepolia

### Backend
- Node.js + TypeScript
- Express API (6 REST endpoints)
- Synapse SDK for Filecoin storage
- Octokit for GitHub data

### Frontend (To Build)
- Next.js 14+
- Agent profile viewer
- Reputation dashboard
- Identity verifier tool

### CLI (To Build)
- TypeScript + Commander.js
- Commands: register, verify, score, history

---

## What's Done (March 9)

✅ Smart contracts written (~280 lines)  
✅ Backend services written (~490 lines)  
✅ API endpoints implemented (6 routes)  
✅ Architecture designed  
✅ Documentation complete  

**Total:** ~650 lines of production code already written!

---

## What's NOT Done (Need Help With)

❌ Contracts not deployed (need Base Sepolia deployment)  
❌ Backend not tested with real Filecoin  
❌ No frontend UI yet  
❌ No CLI tool yet  
❌ No demo video  

---

## How You Can Help

### Option 1: Smart Contracts
**Skills needed:** Solidity, Foundry/Remix  
**Tasks:**
- Review contracts for security issues
- Deploy to Base Sepolia testnet
- Write deployment scripts
- Test contract interactions

**Files:**
- `contracts/src/AgentRegistry.sol`
- `contracts/src/ReputationOracle.sol`

### Option 2: Frontend
**Skills needed:** Next.js, React, Tailwind  
**Tasks:**
- Build agent profile page
- Create reputation dashboard
- Build identity verifier tool
- Polish UI/UX

**Needs:**
- `/agent/[id]` page (show identity + reputation)
- `/verify` page (verify any agent)
- Landing page

### Option 3: Backend/Testing
**Skills needed:** TypeScript, Node.js, testing  
**Tasks:**
- Test Synapse SDK with real Filecoin
- Write unit tests (Vitest)
- Test API endpoints
- Deploy backend service

**Files:**
- `backend/src/services/synapse.ts`
- `backend/src/services/reputation.ts`
- `backend/src/api/routes.ts`

### Option 4: CLI Tool
**Skills needed:** TypeScript, Commander.js  
**Tasks:**
- Build CLI commands (register, verify, score, history)
- Add progress indicators
- Handle errors gracefully
- Package for npm

**Files:**
- `cli/src/index.ts` (needs to be written)

### Option 5: Demo Video
**Skills needed:** Video editing, storytelling  
**Tasks:**
- Write demo script
- Record walkthrough
- Edit video (3-5 min)
- Add captions/overlays

---

## Getting Started

### 1. Clone Repo
```bash
cd ~/.openclaw/workspace/filecoin-agent-reputation
git remote -v  # (check if you have access)
```

### 2. Install Dependencies
```bash
# Backend
cd backend && npm install

# Frontend (when you start)
cd frontend && npm install

# CLI (when you start)
cd cli && npm install
```

### 3. Get API Keys
You'll need:
- Synapse SDK credentials (for Filecoin)
- GitHub token (for fetching PR data)
- Base Sepolia testnet tokens

*Ask Goyabean for credentials or use your own.*

### 4. Pick a Task
Choose from options above, or suggest something else!

### 5. Coordinate
Message Goyabean on Telegram: @Goya_bean

---

## Timeline

**Today (Day 1 - March 10):**
- Install dependencies ✅
- Deploy contracts
- Test Filecoin integration
- Create beansai.eth identity

**Days 2-3 (March 11-12):**
- Reputation scoring + history
- Cross-platform verification
- Proof-of-history

**Days 4-5 (March 13-14):**
- Frontend UI
- CLI tool
- Polish + testing

**Day 6 (March 15):**
- Demo video
- Final submission

---

## Architecture Quick View

```
┌─────────────────┐
│   Frontend      │ ← Need help here!
│   (Next.js)     │
└────────┬────────┘
         │
┌────────▼────────┐
│   Backend API   │ ✅ Done!
│   (Express)     │
└────┬───────┬────┘
     │       │
┌────▼───┐ ┌▼──────────┐
│ Smart  │ │ Filecoin  │
│Contract│ │ (Synapse) │
│(Base)  │ │           │
└────────┘ └───────────┘
```

---

## Why This Project Will Win

1. **Real Agent:** Using beansai.eth with actual GitHub PRs + on-chain activity
2. **Novel Approach:** CID-rooted identity is unique
3. **Meets All Requirements:** Checks every box in Filecoin Challenge #3
4. **Clean Code:** Well-architected, easy to understand
5. **Buildable:** Realistic scope for 6 days

---

## Key Resources

- **Project Folder:** `~/.openclaw/workspace/filecoin-agent-reputation/`
- **Full Spec:** `protocol-labs-hackathon-project.md`
- **Progress Log:** `PROGRESS.md`
- **Quick Start:** `docs/QUICK_START.md`

---

## Questions?

Ask Goyabean on Telegram: @Goya_bean

Let's ship this! 🚀

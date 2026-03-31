# Quick Start Guide

## Overview

This guide walks you through registering an AI agent on FARS and verifying its identity.

---

## Prerequisites

- Node.js 18+ installed
- Ethereum wallet with Base Sepolia testnet ETH
- GitHub account (for contribution proofs)

---

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Copy `frontend/.env.example` to `frontend/.env.local` and fill in values:

```bash
cp frontend/.env.example frontend/.env.local
```

Key variables:
- `NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS` — deployed AgentRegistry on Base Sepolia
- `NEXT_PUBLIC_REPUTATION_ORACLE_ADDRESS` — deployed ReputationOracle on Base Sepolia
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — get one at https://cloud.walletconnect.com
- `GITHUB_TOKEN` — optional, for reputation calculations
- `PAYMENT_RECIPIENT_ADDRESS` — your wallet for x402 payments (leave blank in dev)

### 3. Get Testnet ETH

Get Base Sepolia ETH from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

---

## Register an Agent

### Step 1: Start the Dev Server

```bash
cd frontend
npm run dev
```

App runs on `http://localhost:3000`

### Step 2: Register via CLI

```bash
cd cli

npm run register -- \
  --name "MyAgent" \
  --description "AI coding assistant" \
  --github-id 12345
```

**Response:**
```json
{
  "tx": "0x...",
  "agentAddress": "0x...",
  "stateCID": "bafy..."
}
```

### Step 3: Verify Registration

```bash
npm run verify -- --address 0x...
```

**Output:**
```
✅ Agent verified on-chain
Name: MyAgent
State CID: bafy...
Reputation: 0
```

---

## Update Reputation

After the agent completes work (e.g., GitHub PRs, smart contract deployments), update reputation:

```bash
npm run score -- \
  --address 0x... \
  --score 400
```

The backend will:
1. Generate contribution proofs
2. Upload state to Filecoin
3. Update on-chain reputation

---

## Query Agent Data

### Via CLI

```bash
npm run verify -- --address 0x...
```

### Via API

```bash
# Query agent reputation (x402 payment required in production)
curl https://filecoin-agent-reputation.vercel.app/api/reputation/calculate \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"agentAddress": "0x..."}'

# Check agent identity by CID
curl https://filecoin-agent-reputation.vercel.app/api/identity/<CID>

# Health check (free)
curl https://filecoin-agent-reputation.vercel.app/api/health
```

**Response (reputation):**
```json
{
  "success": true,
  "agentAddress": "0x...",
  "reputation": {
    "totalScore": 225,
    "breakdown": { "agentTasks": 100, "uptime": 50, ... },
    "actionCount": 2
  }
}
```

---

## Next Steps

- **Build integrations**: Use the REST API in your applications
- **Add contribution types**: Extend proof generation for new work types
- **Deploy to mainnet**: Move from testnet to production
- **Create frontend**: Build a UI for agent discovery

---

## Troubleshooting

### Transaction Reverts

- Check wallet has sufficient Base Sepolia ETH
- Verify contract addresses match deployed versions
- Ensure RPC endpoint is accessible

### State Upload Fails

- Verify Filecoin RPC endpoint is correct
- Check Synapse SDK credentials (if using authenticated storage)

### API Errors

- Confirm backend is running (`npm start`)
- Check `.env` configuration
- Verify private key format (0x prefix)

---

## Resources

- [Contract Addresses](../README.md#smart-contracts)
- [API Reference](./API.md)
- [Architecture](../HOW_IT_WORKS.md)
- [Base Sepolia Explorer](https://sepolia.basescan.org/)

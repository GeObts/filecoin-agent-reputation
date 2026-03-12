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
# Backend
cd backend
npm install

# CLI
cd ../cli
npm install
```

### 2. Configure Environment

Create `backend/.env`:

```bash
PRIVATE_KEY=your_private_key_here
WALLET_ADDRESS=your_wallet_address_here
GITHUB_TOKEN=your_github_token_here

AGENT_REGISTRY_ADDRESS=0x644337Ca322C90098b5F3657Bde2b661e28d9e0E
REPUTATION_ORACLE_ADDRESS=0xb7FaEDd691a1d9e02A348a09456F6D3E39355FF1

BASE_SEPOLIA_RPC=https://sepolia.base.org
FILECOIN_CALIBRATION_RPC=https://api.calibration.node.glif.io/rpc/v1
```

### 3. Get Testnet ETH

Get Base Sepolia ETH from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

---

## Register an Agent

### Step 1: Start the Backend

```bash
cd backend
npm start
```

Server runs on `http://localhost:3000`

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
curl http://localhost:3000/api/agents/0x...
```

**Response:**
```json
{
  "name": "MyAgent",
  "description": "AI coding assistant",
  "reputationScore": 400,
  "stateCID": "bafy...",
  "verified": true,
  "contributions": [...]
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

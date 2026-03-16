# FARS Self-Registration Skill

## Overview

Enables AI agents to register themselves on the Filecoin Agent Reputation System (FARS) programmatically via API, without manual form submission.

## When to Use

- Agent wants to create on-chain identity
- Agent needs verifiable reputation tracking
- Agent wants portable credentials across platforms
- Agent is autonomously joining a network

## Prerequisites

- Ethereum wallet address (agent's identity)
- Base Sepolia ETH (~0.0001 for on-chain registration)
- Optional: GitHub username (for code contribution score)

## API Endpoint

**Base URL:** `https://filecoin-agent-reputation.vercel.app/api` (production)  
**Local:** `http://localhost:3000/api` (development)

**Method:** `POST /agent/register`

### Request Body

```json
{
  "agentId": "0x...",
  "name": "My Agent Name",
  "type": "autonomous_agent",
  "capabilities": ["code_generation", "data_analysis", "blockchain_interaction"],
  "metadata": {
    "version": "1.0.0",
    "platform": "OpenClaw",
    "contact": "agent@example.com"
  },
  "githubUsername": "username"
}
```

### Response

```json
{
  "success": true,
  "agentId": "0x...",
  "filecoin": {
    "identityCID": "bafy...",
    "historyCID": "bafy...",
    "proofCID": "bafy..."
  },
  "reputation": {
    "totalScore": 450,
    "breakdown": {
      "codeContributions": 300,
      "blockchainActivity": 50,
      "agentInteractions": 75,
      "uptime": 25
    }
  },
  "message": "Agent fully registered on Filecoin"
}
```

## Usage (OpenClaw)

### Step 1: Prepare Agent Data

```bash
export AGENT_ADDRESS="0x0eD39Ba9Ab663A20D65cc6e3927dDe40e37309d4"
export AGENT_NAME="beanbot"
export GITHUB_USER="GeObts"
```

### Step 2: Register via API

```bash
curl -X POST https://filecoin-agent-reputation.vercel.app/api/agent/register \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "'"$AGENT_ADDRESS"'",
    "name": "'"$AGENT_NAME"'",
    "type": "autonomous_agent",
    "capabilities": [
      "code_generation",
      "blockchain_interaction",
      "task_automation",
      "governance_voting",
      "smart_contract_deployment"
    ],
    "metadata": {
      "version": "1.0.0",
      "platform": "OpenClaw",
      "telegram": "@CleanbeansBot"
    },
    "githubUsername": "'"$GITHUB_USER"'"
  }'
```

### Step 3: Register On-Chain (Base Sepolia)

After getting CIDs from API response, register on Base smart contract:

```bash
# Using cast (Foundry)
cast send 0x644337Ca322C90098b5F3657Bde2b661e28d9e0E \
  "registerAgent(address,string)" \
  $AGENT_ADDRESS \
  "ipfs://bafy..." \
  --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY
```

## Script Example

Save as `register-fars.sh`:

```bash
#!/bin/bash

# FARS Self-Registration Script
set -e

AGENT_ADDRESS="${1:-$WALLET_ADDRESS}"
AGENT_NAME="${2:-beanbot}"
GITHUB_USER="${3:-}"

if [ -z "$AGENT_ADDRESS" ]; then
  echo "Usage: ./register-fars.sh <agent_address> [name] [github_username]"
  exit 1
fi

echo "🤖 Registering agent on FARS..."
echo "Address: $AGENT_ADDRESS"
echo "Name: $AGENT_NAME"

# Step 1: Register via API
RESPONSE=$(curl -s -X POST https://filecoin-agent-reputation.vercel.app/api/agent/register \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "'"$AGENT_ADDRESS"'",
    "name": "'"$AGENT_NAME"'",
    "type": "autonomous_agent",
    "capabilities": [
      "code_generation",
      "blockchain_interaction",
      "task_automation"
    ],
    "githubUsername": "'"$GITHUB_USER"'"
  }')

echo "✅ API Response:"
echo "$RESPONSE" | jq .

# Extract CIDs
IDENTITY_CID=$(echo "$RESPONSE" | jq -r '.filecoin.identityCID')
REPUTATION=$(echo "$RESPONSE" | jq -r '.reputation.totalScore')

echo ""
echo "📊 Results:"
echo "  Identity CID: $IDENTITY_CID"
echo "  Reputation Score: $REPUTATION"
echo ""
echo "🔗 Next: Register on-chain using identity CID"
echo "  Contract: 0x644337Ca322C90098b5F3657Bde2b661e28d9e0E"
echo "  Network: Base Sepolia"
```

## Available Capabilities

See `shared-capabilities.json` for full list (80+ capabilities including):

**Technical:**
- code_generation, code_review, bug_detection
- smart_contract_deployment, security_audit
- api_integration, database_management
- monitoring_alerts, log_analysis

**Trading/DeFi:**
- token_trading, nft_minting, defi_yield_farming
- liquidity_provision, price_prediction
- portfolio_management, risk_assessment

**Content:**
- content_creation, image_generation, video_editing
- social_media_posting, seo_optimization
- document_generation, report_writing

**Business:**
- email_management, calendar_scheduling
- crm_integration, lead_generation
- financial_forecasting, invoice_processing

## On-Chain Verification

After registration, verify on BaseScan:

```
https://sepolia.basescan.org/address/0x644337Ca322C90098b5F3657Bde2b661e28d9e0E#readContract
```

Query `getAgent(address)` with your agent address.

## Troubleshooting

**Error: "agentId and name required"**
- Ensure both fields are provided in request body

**Error: "Service initialization failed"**
- Backend may be down or Filecoin connection issue
- Check API health: `curl https://filecoin-agent-reputation.vercel.app/health`

**Transaction reverted on-chain**
- Ensure you have Base Sepolia ETH
- Check if agent already registered: `isActive(address)`

## Production Deployment

For mainnet deployment:
1. Update contract address to Base mainnet registry
2. Use production API endpoint
3. Ensure sufficient Base mainnet ETH for gas

---

**Last Updated:** 2026-03-16

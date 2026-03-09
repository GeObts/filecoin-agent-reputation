# Quick Start Guide - FARS

## Day 1 Progress ✅

**Completed:**
- ✅ Project structure created
- ✅ Smart contracts implemented (AgentRegistry + ReputationOracle)
- ✅ Backend services built (Synapse + Reputation)
- ✅ API endpoints designed
- ✅ TypeScript configuration

**Next Steps:**

### 1. Install Dependencies

```bash
cd ~/.openclaw/workspace/filecoin-agent-reputation/backend
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and add:
# - Your private key (for Filecoin testnet)
# - GitHub token (from ~/.github-token)
```

### 3. Get Testnet Tokens

**Filecoin Calibration:**
- Visit: https://faucet.calibration.fildev.network/
- Request test FIL for your wallet

**Base Sepolia:**
- Visit: https://faucet.quicknode.com/base/sepolia
- Request test ETH

### 4. Deploy Smart Contracts

```bash
# Option 1: Using Remix IDE (easiest)
# 1. Go to https://remix.ethereum.org/
# 2. Copy contracts/src/AgentRegistry.sol
# 3. Compile with Solidity 0.8.20+
# 4. Deploy to Base Sepolia
# 5. Save contract address to .env

# Option 2: Using Foundry (if installed)
cd contracts
forge build
forge create --rpc-url $BASE_SEPOLIA_RPC \
  --private-key $PRIVATE_KEY \
  src/AgentRegistry.sol:AgentRegistry
```

### 5. Run Backend

```bash
cd backend
pnpm dev
```

Server will start on http://localhost:3000

### 6. Test API

```bash
# Health check
curl http://localhost:3000/health

# Create identity (example)
curl -X POST http://localhost:3000/api/identity/create \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "0x0eD39Ba9Ab663A20D65cc6e3927dDe40e37309d4",
    "name": "beansai.eth",
    "type": "autonomous_agent",
    "capabilities": ["trading", "code_contribution"],
    "metadata": {
      "ens": "beansai.eth",
      "erc8004": "14450"
    }
  }'
```

### 7. Register beansai.eth Agent

```bash
curl -X POST http://localhost:3000/api/agent/register \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "0x0eD39Ba9Ab663A20D65cc6e3927dDe40e37309d4",
    "name": "beansai.eth",
    "type": "autonomous_agent",
    "capabilities": ["trading", "code_contribution", "on_chain_operations"],
    "metadata": {
      "ens": "beansai.eth",
      "erc8004": { "agentId": "14450" }
    },
    "githubUsername": "GeObts"
  }'
```

This will:
1. Create identity document → upload to Filecoin
2. Fetch GitHub PRs from @GeObts
3. Calculate reputation score
4. Upload history + proof to Filecoin
5. Return all CIDs

## API Endpoints

### Identity
- `POST /api/identity/create` - Create agent identity
- `GET /api/identity/:cid` - Retrieve identity from Filecoin

### Reputation
- `POST /api/reputation/calculate` - Calculate reputation
- `GET /api/history/:cid` - Get action history
- `GET /api/proof/:cid` - Get proof-of-history

### Full Registration
- `POST /api/agent/register` - Complete agent registration

## Project Structure

```
backend/
├── src/
│   ├── services/
│   │   ├── synapse.ts       # Filecoin storage via Synapse SDK
│   │   └── reputation.ts    # Reputation calculation
│   ├── api/
│   │   └── routes.ts        # API endpoints
│   └── index.ts             # Server entry point
├── package.json
├── tsconfig.json
└── .env

contracts/
└── src/
    ├── AgentRegistry.sol    # Agent identity registry
    └── ReputationOracle.sol # Reputation scores with proofs
```

## Day 2 Plan

**Tomorrow (March 10):**
1. Deploy contracts to Base Sepolia
2. Test Synapse SDK with real Filecoin Calibration testnet
3. Create beansai.eth identity on Filecoin
4. Fetch real GitHub PR history
5. Calculate and store reputation

**Target:** beansai.eth agent fully registered with live CIDs

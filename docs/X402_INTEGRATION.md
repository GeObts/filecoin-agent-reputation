# x402 Payment Integration

FARS uses the **x402 protocol** for micropayments, enabling sustainable API monetization and economic sybil resistance.

## Why x402?

1. **Prevent Spam**: Small payments discourage API abuse
2. **Sustainable Revenue**: Agents pay for what they use
3. **Economic Sybil Resistance**: Attestation submissions cost money, preventing fake reviews
4. **Instant Settlement**: Payments settle on-chain in seconds (USDC on Base)
5. **No Accounts**: Pay-per-call model, no subscriptions or API keys required

## Payment Configuration

**Token**: USDC on Base  
**Chain**: Base (Chain ID: 8453)  
**Protocol**: x402 Payment Protocol  
**Recipient**: Configured via `PAYMENT_RECIPIENT_ADDRESS` environment variable

## Pricing Tiers

### FREE Tier
**Daily Limit**: 10 requests  
**Endpoints**:
- `GET /api/health` - Free
- `GET /api/pricing` - Free

### BASIC Tier ($0.01 - $0.03 USDC)
**Daily Limit**: 100 requests per address  
**Endpoints**:
- `GET /api/identity/:cid` - $0.01
- `GET /api/history/:cid` - $0.03
- `GET /api/proof/:cid` - $0.03

### PREMIUM Tier ($0.05 - $0.25 USDC)
**Daily Limit**: 1,000 requests per address  
**Endpoints**:
- `GET /api/reputation/:address` - $0.05 (lightweight query)
- `POST /api/reputation/calculate` - $0.25 (full calculation + Filecoin storage)

### ENTERPRISE Tier ($0.10 - $0.50 USDC)
**Daily Limit**: Unlimited  
**Endpoints**:
- `POST /api/identity/create` - $0.10
- `POST /api/agent/register` - $0.50 (full registration flow)

## How to Use x402

### 1. Install x402 Client

```bash
npm install @x402/core @x402/extensions
```

### 2. Make a Paid API Request

```typescript
import { X402Client } from '@x402/core';

const client = new X402Client({
  privateKey: process.env.PRIVATE_KEY, // Your wallet
  chainId: 8453 // Base
});

// Call paid endpoint
const response = await client.post('/api/reputation/calculate', {
  agentAddress: '0x...',
  githubUsername: 'myagent'
}, {
  baseURL: 'https://your-fars-api.vercel.app',
  payment: {
    token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC
    amount: '0.25' // $0.25 USDC
  }
});

console.log(response.data);
```

### 3. Using cURL with x402 Headers

You can also construct x402 payment headers manually:

```bash
# 1. Generate payment proof off-chain
# 2. Include x402 headers in request

curl -X POST https://your-fars-api.vercel.app/api/reputation/calculate \
  -H "Content-Type: application/json" \
  -H "X-Payment-Address: 0x..." \
  -H "X-Payment-Signature: 0x..." \
  -H "X-Payment-Nonce: 123456" \
  -d '{
    "agentAddress": "0x...",
    "githubUsername": "myagent"
  }'
```

### 4. Check Pricing Programmatically

```bash
curl https://your-fars-api.vercel.app/api/pricing
```

Response:
```json
{
  "message": "FARS API Pricing",
  "currency": "USDC",
  "chain": "Base",
  "prices": {
    "IDENTITY_CREATE": "0.10",
    "IDENTITY_RETRIEVE": "0.01",
    "REPUTATION_CALCULATE": "0.25",
    "REPUTATION_QUERY": "0.05",
    "HISTORY_RETRIEVE": "0.03",
    "PROOF_RETRIEVE": "0.03",
    "AGENT_REGISTER": "0.50"
  },
  "paymentInfo": {
    "protocol": "x402",
    "instructions": "Include x402 payment headers with USDC payment proof on Base"
  }
}
```

## Response Headers

All paid endpoints include pricing information in response headers:

```
X-API-Price: 0.25
X-Payment-Token: USDC
X-Payment-Chain: Base
X-Payment-Recipient: 0x...
```

## Rate Limiting

Rate limits are enforced **per wallet address** based on payment tier:

- **FREE**: 10 requests/day
- **BASIC**: 100 requests/day
- **PREMIUM**: 1,000 requests/day
- **ENTERPRISE**: Unlimited

If you exceed your rate limit:

```json
{
  "error": "Rate limit exceeded",
  "tier": "BASIC",
  "limit": 100,
  "resetIn": "24 hours",
  "upgrade": "Use x402 payment or upgrade tier for higher limits"
}
```

## Business Model

### Revenue Streams

1. **API Usage**: Per-call micropayments for reputation queries
2. **Agent Registration**: One-time fee to register new agents
3. **Attestation Submission**: Economic sybil resistance via paid attestations
4. **Enterprise Access**: Unlimited API access for high-volume users

### Example Economics

**Scenario**: 1,000 agents using FARS

- Agent registration: 1,000 × $0.50 = **$500**
- Monthly reputation updates: 1,000 × 4 × $0.25 = **$1,000/month**
- Reputation queries: 10,000 × $0.05 = **$500/month**

**Total**: ~$2,000/month recurring revenue

### Value Proposition

- **For Agents**: Pay only for what you use, no subscriptions
- **For Platforms**: Trusted reputation data with cryptographic proof
- **For FARS**: Sustainable revenue to maintain infrastructure

## Security Considerations

### Payment Verification

The x402 middleware automatically verifies:
1. ✅ Payment signature is valid
2. ✅ Payment amount matches endpoint price
3. ✅ Payment token is USDC
4. ✅ Payment is on Base chain
5. ✅ Nonce is unique (prevents replay attacks)

### Sybil Resistance

Economic barriers prevent:
- Fake attestation spam ($0.10+ per attestation)
- API abuse (rate limits + payments)
- Reputation manipulation (costs scale with activity)

### Fallback Behavior

If x402 is not configured (missing `PAYMENT_RECIPIENT_ADDRESS`):
- API **continues to work** (free mode)
- Warning logged: `[x402] No payment recipient configured - payments disabled`
- Useful for development/testing

## Development Setup

### Local Testing (Free Mode)

```bash
# .env
# Omit PAYMENT_RECIPIENT_ADDRESS to disable payments
PRIVATE_KEY=0x...
GITHUB_TOKEN=ghp_...
```

API runs in free mode - no payments required.

### Production Deployment (Paid Mode)

```bash
# .env
PAYMENT_RECIPIENT_ADDRESS=0x...  # Your wallet to receive payments
PRIVATE_KEY=0x...
GITHUB_TOKEN=ghp_...
```

x402 payments are now enforced on all paid endpoints.

## Monitoring & Analytics

Track payment metrics:

```typescript
// Log payment events
app.use((req, res, next) => {
  if (req.headers['x-payment-address']) {
    console.log('[x402] Payment received:', {
      endpoint: req.path,
      from: req.headers['x-payment-address'],
      price: res.getHeader('X-API-Price')
    });
  }
  next();
});
```

## Future Enhancements

### Planned Features

1. **Subscription Plans**: Monthly unlimited access for fixed price
2. **Bulk Discounts**: Volume-based pricing tiers
3. **Refunds**: Partial refunds for failed operations
4. **Payment Tokens**: Support ETH, DAI, other stablecoins
5. **Multi-Chain**: Expand to Optimism, Arbitrum, Polygon

### Agent Marketplace Integration

Future: Allow agents to **earn revenue** by offering their own x402 services:

```typescript
// Agent exposes paid API
app.get('/api/agents/:id/services/forecast',
  x402Payment('1.00'), // $1 per forecast
  async (req, res) => {
    const forecast = await agent.generateForecast();
    res.json(forecast);
  }
);
```

**Use Case**: High-reputation agents monetize their proven track record.

## Resources

- **x402 Docs**: https://docs.x402.org
- **x402 GitHub**: https://github.com/coinbase/x402
- **Base Network**: https://base.org
- **USDC on Base**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

## Support

For x402 integration questions:
- Discord: [FARS Community](https://discord.gg/fars)
- GitHub Issues: https://github.com/GeObts/filecoin-agent-reputation/issues
- x402 Support: https://x402.org/support

---

**Built with x402 for sustainable decentralized infrastructure** 💳

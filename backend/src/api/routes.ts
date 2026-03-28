import { Router } from 'express';
import { getSynapse } from '../services/synapse.js';
import { getReputation } from '../services/reputation.js';
import { x402Payment, X402_PRICING, PricingTier, rateLimitByTier } from '../middleware/x402.js';

export const apiRouter = Router();

/**
 * GET /api/pricing
 * Public endpoint - pricing information
 */
apiRouter.get('/pricing', (req, res) => {
  res.json({
    message: 'FARS API Pricing',
    currency: 'USDC',
    chain: 'Base',
    prices: X402_PRICING,
    tiers: {
      FREE: {
        dailyLimit: 10,
        endpoints: ['GET /health', 'GET /pricing']
      },
      BASIC: {
        priceRange: '$0.01 - $0.03',
        endpoints: ['GET /identity/:cid', 'GET /history/:cid', 'GET /proof/:cid']
      },
      PREMIUM: {
        priceRange: '$0.05 - $0.25',
        endpoints: ['POST /reputation/calculate']
      },
      ENTERPRISE: {
        priceRange: '$0.10 - $0.50',
        endpoints: ['POST /identity/create', 'POST /agent/register']
      }
    },
    paymentInfo: {
      protocol: 'x402',
      instructions: 'Include x402 payment headers with USDC payment proof on Base',
      learnMore: 'https://docs.x402.org'
    }
  });
});

/**
 * POST /api/identity/create
 * Create and upload agent identity to Filecoin
 * Price: $0.10 USDC
 */
apiRouter.post('/identity/create',
  ...x402Payment(X402_PRICING.IDENTITY_CREATE),
  rateLimitByTier(PricingTier.ENTERPRISE),
  async (req, res) => {
    try {
      const { agentId, name, type, capabilities, metadata } = req.body;

      if (!agentId || !name) {
        return res.status(400).json({ error: 'agentId and name required' });
      }

      const synapse = getSynapse();
      const cid = await synapse.uploadIdentity({
        agentId,
        name,
        type: type || 'autonomous_agent',
        capabilities: capabilities || [],
        metadata: metadata || {}
      });

      res.json({
        success: true,
        cid,
        agentId,
        message: 'Identity created and uploaded to Filecoin',
        paid: X402_PRICING.IDENTITY_CREATE
      });
    } catch (error: any) {
      console.error('[API] Identity creation failed:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/identity/:cid
 * Retrieve identity from Filecoin by CID
 * Price: $0.01 USDC
 */
apiRouter.get('/identity/:cid',
  ...x402Payment(X402_PRICING.IDENTITY_RETRIEVE),
  rateLimitByTier(PricingTier.BASIC),
  async (req, res) => {
    try {
      const { cid } = req.params;
      const synapse = getSynapse();
      const identity = await synapse.retrieveJSON(cid);

      res.json({
        success: true,
        identity,
        cid,
        paid: X402_PRICING.IDENTITY_RETRIEVE
      });
    } catch (error: any) {
      console.error('[API] Identity retrieval failed:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * POST /api/reputation/calculate
 * Calculate reputation for an agent
 * Price: $0.25 USDC
 */
apiRouter.post('/reputation/calculate',
  ...x402Payment(X402_PRICING.REPUTATION_CALCULATE),
  rateLimitByTier(PricingTier.PREMIUM),
  async (req, res) => {
    try {
      const { agentAddress, githubUsername } = req.body;

      if (!agentAddress) {
        return res.status(400).json({ error: 'agentAddress required' });
      }

      const reputation = getReputation();
      
      // Aggregate actions from all sources
      const actions = await reputation.aggregateActions(agentAddress, githubUsername);
      
      // Calculate reputation score
      const score = reputation.calculateReputation(actions);
      
      // Generate proof
      const proof = reputation.generateProof(actions);

      // Upload to Filecoin
      const synapse = getSynapse();
      const historyCID = await synapse.uploadHistory(agentAddress, actions);
      const proofCID = await synapse.uploadProof(agentAddress, proof);

      res.json({
        success: true,
        agentAddress,
        reputation: score,
        filecoin: {
          historyCID,
          proofCID
        },
        actionCount: actions.length,
        paid: X402_PRICING.REPUTATION_CALCULATE
      });
    } catch (error: any) {
      console.error('[API] Reputation calculation failed:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/reputation/:address
 * Query reputation score (lightweight)
 * Price: $0.05 USDC
 */
apiRouter.get('/reputation/:address',
  ...x402Payment(X402_PRICING.REPUTATION_QUERY),
  rateLimitByTier(PricingTier.PREMIUM),
  async (req, res) => {
    try {
      const { address } = req.params;
      const reputation = getReputation();
      
      // Lightweight query - just calculate score from known data
      const actions = await reputation.aggregateActions(address);
      const score = reputation.calculateReputation(actions);

      res.json({
        success: true,
        address,
        reputation: score,
        actionCount: actions.length,
        paid: X402_PRICING.REPUTATION_QUERY
      });
    } catch (error: any) {
      console.error('[API] Reputation query failed:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/history/:cid
 * Retrieve action history from Filecoin
 * Price: $0.03 USDC
 */
apiRouter.get('/history/:cid',
  ...x402Payment(X402_PRICING.HISTORY_RETRIEVE),
  rateLimitByTier(PricingTier.BASIC),
  async (req, res) => {
    try {
      const { cid } = req.params;
      const synapse = getSynapse();
      const history = await synapse.retrieveJSON(cid);

      res.json({
        success: true,
        history,
        cid,
        paid: X402_PRICING.HISTORY_RETRIEVE
      });
    } catch (error: any) {
      console.error('[API] History retrieval failed:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/proof/:cid
 * Retrieve proof-of-history from Filecoin
 * Price: $0.03 USDC
 */
apiRouter.get('/proof/:cid',
  ...x402Payment(X402_PRICING.PROOF_RETRIEVE),
  rateLimitByTier(PricingTier.BASIC),
  async (req, res) => {
    try {
      const { cid } = req.params;
      const synapse = getSynapse();
      const proof = await synapse.retrieveJSON(cid);

      res.json({
        success: true,
        proof,
        cid,
        paid: X402_PRICING.PROOF_RETRIEVE
      });
    } catch (error: any) {
      console.error('[API] Proof retrieval failed:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * POST /api/agent/register
 * Full agent registration flow (identity + reputation)
 * Price: $0.50 USDC (premium endpoint)
 */
apiRouter.post('/agent/register',
  ...x402Payment(X402_PRICING.AGENT_REGISTER),
  rateLimitByTier(PricingTier.ENTERPRISE),
  async (req, res) => {
    try {
      const {
        agentId,
        name,
        type,
        capabilities,
        metadata,
        githubUsername
      } = req.body;

      if (!agentId || !name) {
        return res.status(400).json({ error: 'agentId and name required' });
      }

      const synapse = getSynapse();
      const reputation = getReputation();

      // 1. Create and upload identity
      const identityCID = await synapse.uploadIdentity({
        agentId,
        name,
        type: type || 'autonomous_agent',
        capabilities: capabilities || [],
        metadata: metadata || {}
      });

      // 2. Aggregate actions and calculate reputation
      const actions = await reputation.aggregateActions(agentId, githubUsername);
      const score = reputation.calculateReputation(actions);
      const proof = reputation.generateProof(actions);

      // 3. Upload history and proof
      const historyCID = await synapse.uploadHistory(agentId, actions);
      const proofCID = await synapse.uploadProof(agentId, proof);

      res.json({
        success: true,
        agentId,
        filecoin: {
          identityCID,
          historyCID,
          proofCID
        },
        reputation: score,
        message: 'Agent fully registered on Filecoin',
        paid: X402_PRICING.AGENT_REGISTER
      });
    } catch (error: any) {
      console.error('[API] Agent registration failed:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

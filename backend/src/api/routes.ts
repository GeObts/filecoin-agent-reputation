import { Router } from 'express';
import { getSynapse } from '../services/synapse.js';
import { getReputation } from '../services/reputation.js';

export const apiRouter = Router();

/**
 * POST /api/identity/create
 * Create and upload agent identity to Filecoin
 */
apiRouter.post('/identity/create', async (req, res) => {
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
      message: 'Identity created and uploaded to Filecoin'
    });
  } catch (error: any) {
    console.error('[API] Identity creation failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/identity/:cid
 * Retrieve identity from Filecoin by CID
 */
apiRouter.get('/identity/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const synapse = getSynapse();
    const identity = await synapse.retrieveJSON(cid);

    res.json({
      success: true,
      identity,
      cid
    });
  } catch (error: any) {
    console.error('[API] Identity retrieval failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/reputation/calculate
 * Calculate reputation for an agent
 */
apiRouter.post('/reputation/calculate', async (req, res) => {
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
      actionCount: actions.length
    });
  } catch (error: any) {
    console.error('[API] Reputation calculation failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/history/:cid
 * Retrieve action history from Filecoin
 */
apiRouter.get('/history/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const synapse = getSynapse();
    const history = await synapse.retrieveJSON(cid);

    res.json({
      success: true,
      history,
      cid
    });
  } catch (error: any) {
    console.error('[API] History retrieval failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/proof/:cid
 * Retrieve proof-of-history from Filecoin
 */
apiRouter.get('/proof/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const synapse = getSynapse();
    const proof = await synapse.retrieveJSON(cid);

    res.json({
      success: true,
      proof,
      cid
    });
  } catch (error: any) {
    console.error('[API] Proof retrieval failed:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/agent/register
 * Full agent registration flow (identity + reputation)
 */
apiRouter.post('/agent/register', async (req, res) => {
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
      message: 'Agent fully registered on Filecoin'
    });
  } catch (error: any) {
    console.error('[API] Agent registration failed:', error);
    res.status(500).json({ error: error.message });
  }
});

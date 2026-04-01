import { NextRequest, NextResponse } from "next/server";
import { ensureReputation } from "@/lib/services/init";
import { getReputation } from "@/lib/services/reputation";
import { uploadIdentity, uploadHistory, uploadProof } from "@/lib/synapse-client";
import { saveAgent, isStoreAvailable } from "@/lib/store";
import { withPayment, X402_PRICING } from "@/lib/x402";

async function handler(req: NextRequest) {
  try {
    ensureReputation();

    const body = await req.json();
    const {
      agentId,
      name,
      type,
      capabilities,
      metadata,
      githubUsername
    } = body;

    if (!agentId || !name) {
      return NextResponse.json(
        { error: 'agentId and name required' },
        { status: 400 }
      );
    }

    const reputation = getReputation();

    // 1. Create and compute identity CID
    const identityCID = await uploadIdentity({
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

    // 3. Compute history and proof CIDs
    const historyCID = await uploadHistory(agentId, actions);
    const proofCID = await uploadProof(agentId, proof);

    // 4. Persist to KV store so anyone can look up this agent
    if (isStoreAvailable()) {
      await saveAgent(agentId, {
        agentId,
        name,
        type: type || 'autonomous_agent',
        capabilities: capabilities || [],
        filecoin: { identityCID, historyCID, proofCID },
        reputation: score,
        proof,
        registeredAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      agentId,
      filecoin: { identityCID, historyCID, proofCID },
      reputation: score,
      proof,
      message: 'Agent registered with content-addressed CIDs'
    });
  } catch (error: unknown) {
    console.error('[API] Agent registration failed:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const POST = withPayment(X402_PRICING.AGENT_REGISTER, handler);

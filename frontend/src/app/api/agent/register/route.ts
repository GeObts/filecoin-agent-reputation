import { NextRequest, NextResponse } from "next/server";
import { ensureSynapse } from "@/lib/services/init";
import { ensureReputation } from "@/lib/services/init";
import { getSynapse } from "@/lib/services/synapse";
import { getReputation } from "@/lib/services/reputation";
import { withPayment, X402_PRICING } from "@/lib/x402";

async function handler(req: NextRequest) {
  try {
    ensureSynapse();
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

    return NextResponse.json({
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
  } catch (error: unknown) {
    console.error('[API] Agent registration failed:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const POST = withPayment(X402_PRICING.AGENT_REGISTER, handler);

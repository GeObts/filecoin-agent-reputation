import { NextRequest, NextResponse } from "next/server";
import { ensureServices } from "@/lib/services/init";
import { getSynapse } from "@/lib/services/synapse";
import { getReputation } from "@/lib/services/reputation";
import { registerAgentSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    ensureServices();
    const body = await req.json();

    const parsed = registerAgentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { agentId, name, type, capabilities, metadata, githubUsername } = parsed.data;

    const synapse = getSynapse();
    const reputation = getReputation();

    // 1. Create and upload identity
    const identityCID = await synapse.uploadIdentity({
      agentId,
      name,
      type: type || "autonomous_agent",
      capabilities: capabilities || [],
      metadata: metadata || {},
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
        proofCID,
      },
      reputation: score,
      message: "Agent fully registered on Filecoin",
    });
  } catch (error: unknown) {
    console.error("[API] Agent registration failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

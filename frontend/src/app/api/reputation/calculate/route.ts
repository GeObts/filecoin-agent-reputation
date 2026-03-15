import { NextRequest, NextResponse } from "next/server";
import { ensureServices } from "@/lib/services/init";
import { getSynapse } from "@/lib/services/synapse";
import { getReputation } from "@/lib/services/reputation";
import { calculateReputationSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    ensureServices();
    const body = await req.json();

    const parsed = calculateReputationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { agentAddress, githubUsername } = parsed.data;

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

    return NextResponse.json({
      success: true,
      agentAddress,
      reputation: score,
      filecoin: {
        historyCID,
        proofCID,
      },
      actionCount: actions.length,
    });
  } catch (error: unknown) {
    console.error("[API] Reputation calculation failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

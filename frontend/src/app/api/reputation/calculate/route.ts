import { NextRequest, NextResponse } from "next/server";
import { ensureReputation } from "@/lib/services/init";
import { getReputation } from "@/lib/services/reputation";
import { calculateReputationSchema } from "@/lib/validation";
import { withPayment, X402_PRICING } from "@/lib/x402";

async function handler(req: NextRequest) {
  try {
    ensureReputation();
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

    // Return raw data — client uploads to Filecoin via Synapse
    return NextResponse.json({
      success: true,
      agentAddress,
      actions,
      reputation: score,
      proof,
    });
  } catch (error: unknown) {
    console.error("[API] Reputation calculation failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export const POST = withPayment(X402_PRICING.REPUTATION_CALCULATE, handler);

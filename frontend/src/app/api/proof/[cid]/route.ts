import { NextRequest, NextResponse } from "next/server";
import { ensureSynapse } from "@/lib/services/init";
import { getSynapse } from "@/lib/services/synapse";
import { cidString } from "@/lib/validation";
import { withPayment, X402_PRICING } from "@/lib/x402";

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ cid: string }> }
) {
  try {
    ensureSynapse();
    const { cid } = await params;

    const parsed = cidString.safeParse(cid);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid CID format" }, { status: 400 });
    }

    const synapse = getSynapse();
    const proof = await synapse.retrieveJSON(parsed.data);

    return NextResponse.json({ success: true, proof, cid: parsed.data });
  } catch (error: unknown) {
    console.error("[API] Proof retrieval failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ cid: string }> }
) {
  return withPayment(X402_PRICING.PROOF_RETRIEVE, async (r) => handler(r, context))(req);
}

import { NextRequest, NextResponse } from "next/server";
import { cidString } from "@/lib/validation";
import { withPayment, X402_PRICING } from "@/lib/x402";

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ cid: string }> }
) {
  try {
    const { cid } = await params;

    const parsed = cidString.safeParse(cid);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid CID format" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      cid: parsed.data,
      storage: "content-addressed",
      message: "CID is a content-addressed hash of the proof-of-history. " +
        "Verify by re-computing the CID from the on-chain proof data.",
    });
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

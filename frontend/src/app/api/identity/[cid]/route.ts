import { NextRequest, NextResponse } from "next/server";
import { ensureSynapse } from "@/lib/services/init";
import { getSynapse } from "@/lib/services/synapse";
import { cidString } from "@/lib/validation";

export async function GET(
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
    const identity = await synapse.retrieveJSON(parsed.data);

    return NextResponse.json({ success: true, identity, cid: parsed.data });
  } catch (error: unknown) {
    console.error("[API] Identity retrieval failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

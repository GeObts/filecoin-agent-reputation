import { NextRequest, NextResponse } from "next/server";
import { ensureServices } from "@/lib/services/init";
import { getSynapse } from "@/lib/services/synapse";
import { cidString } from "@/lib/validation";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ cid: string }> }
) {
  try {
    ensureServices();
    const { cid } = await params;

    const parsed = cidString.safeParse(cid);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid CID format" }, { status: 400 });
    }

    const synapse = getSynapse();
    const history = await synapse.retrieveJSON(parsed.data);

    return NextResponse.json({ success: true, history, cid: parsed.data });
  } catch (error: unknown) {
    console.error("[API] History retrieval failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

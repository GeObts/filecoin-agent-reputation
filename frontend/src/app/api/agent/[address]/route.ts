import { NextRequest, NextResponse } from "next/server";
import { getAgent, isStoreAvailable } from "@/lib/store";

/**
 * GET /api/agent/[address] — Look up stored agent data by wallet address
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;

    if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
      return NextResponse.json({ error: "Invalid address format" }, { status: 400 });
    }

    if (!isStoreAvailable()) {
      return NextResponse.json(
        { error: "Store not configured", stored: false },
        { status: 503 }
      );
    }

    const agent = await getAgent(address);

    if (!agent) {
      return NextResponse.json({
        stored: false,
        address,
        message: "No stored data for this agent. Register via POST /api/agent/register.",
      });
    }

    return NextResponse.json({
      stored: true,
      address,
      ...agent,
    });
  } catch (error: unknown) {
    console.error("[API] Agent lookup failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

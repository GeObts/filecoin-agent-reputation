import { NextRequest, NextResponse } from "next/server";
import { ensureServices } from "@/lib/services/init";
import { getSynapse } from "@/lib/services/synapse";
import { createIdentitySchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    ensureServices();
    const body = await req.json();

    const parsed = createIdentitySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { agentId, name, type, capabilities, metadata } = parsed.data;

    const synapse = getSynapse();
    const cid = await synapse.uploadIdentity({
      agentId,
      name,
      type: type || "autonomous_agent",
      capabilities: capabilities || [],
      metadata: metadata || {},
    });

    return NextResponse.json({
      success: true,
      cid,
      agentId,
      message: "Identity created and uploaded to Filecoin",
    });
  } catch (error: unknown) {
    console.error("[API] Identity creation failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

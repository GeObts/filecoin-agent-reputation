import { NextRequest, NextResponse } from "next/server";
import { ensureSynapse } from "@/lib/services/init";
import { getSynapse } from "@/lib/services/synapse";

export async function POST(req: NextRequest) {
  try {
    ensureSynapse();
    const body = await req.json();
    const { agentId, name, type, capabilities, metadata } = body;

    if (!agentId || !name) {
      return NextResponse.json(
        { error: 'agentId and name required' },
        { status: 400 }
      );
    }

    const synapse = getSynapse();
    const cid = await synapse.uploadIdentity({
      agentId,
      name,
      type: type || 'autonomous_agent',
      capabilities: capabilities || [],
      metadata: metadata || {}
    });

    return NextResponse.json({
      success: true,
      cid,
      agentId,
      message: 'Identity created and uploaded to Filecoin'
    });
  } catch (error: unknown) {
    console.error('[API] Identity creation failed:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

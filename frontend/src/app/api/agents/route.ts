import { NextResponse } from "next/server";
import { getAllAgentAddresses, getAgent, isStoreAvailable } from "@/lib/store";

/**
 * GET /api/agents — List all stored agents
 */
export async function GET() {
  if (!isStoreAvailable()) {
    return NextResponse.json({ agents: [], count: 0 });
  }

  try {
    const addresses = await getAllAgentAddresses();
    const agents = await Promise.all(
      addresses.map(async (addr) => {
        const data = await getAgent(addr);
        return data ? { address: addr, ...data } : null;
      })
    );

    const validAgents = agents
      .filter((a): a is NonNullable<typeof a> => !!a)
      .sort((a, b) => (b.reputation?.totalScore ?? 0) - (a.reputation?.totalScore ?? 0));

    return NextResponse.json({ agents: validAgents, count: validAgents.length });
  } catch (error) {
    console.error("[API] Failed to list agents:", error);
    return NextResponse.json({ agents: [], count: 0 });
  }
}

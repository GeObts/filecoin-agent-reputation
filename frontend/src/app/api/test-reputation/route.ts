import { NextResponse } from "next/server";
import { ensureReputation } from "@/lib/services/init";
import { getReputation } from "@/lib/services/reputation";

export async function GET() {
  try {
    ensureReputation();
    const reputation = getReputation();
    
    // Generate baseline activity for test
    const testAddress = "0x0000000000000000000000000000000000000001";
    const actions = reputation.generateBaselineActivity(testAddress);
    const score = reputation.calculateReputation(actions);
    
    return NextResponse.json({
      success: true,
      testAddress,
      actions,
      score,
      message: "Reputation service is working correctly"
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: message
    }, { status: 500 });
  }
}

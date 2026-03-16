import { NextResponse } from "next/server";
import { ensureReputation } from "@/lib/services/init";
import { getReputation } from "@/lib/services/reputation";

export async function GET() {
  try {
    ensureReputation();
    const reputation = getReputation();
    
    // Generate baseline activity for test
    const testAddress = "0x0eD39Ba9Ab663A20D65cc6e3927dDe40e37309d4";
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
      error: message,
      stack: error instanceof Error ? error.stack : undefined 
    }, { status: 500 });
  }
}

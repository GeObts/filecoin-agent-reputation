import { NextRequest, NextResponse } from "next/server";
import { X402_PRICING, PAYMENT_CONFIG } from "@/lib/x402";

/**
 * GET /api/pricing
 * 
 * Returns current API pricing and payment configuration
 * FREE endpoint - no payment required
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    pricing: {
      free: {
        health: X402_PRICING.HEALTH_CHECK,
        pricing: X402_PRICING.PRICING_INFO,
        description: "No payment required",
      },
      basic: {
        identityRetrieve: X402_PRICING.IDENTITY_RETRIEVE,
        historyRetrieve: X402_PRICING.HISTORY_RETRIEVE,
        proofRetrieve: X402_PRICING.PROOF_RETRIEVE,
        description: "Lightweight queries",
        dailyLimit: 100,
      },
      premium: {
        reputationQuery: X402_PRICING.REPUTATION_QUERY,
        identityCreate: X402_PRICING.IDENTITY_CREATE,
        description: "Full reputation analysis",
        dailyLimit: 1000,
      },
      enterprise: {
        reputationCalculate: X402_PRICING.REPUTATION_CALCULATE,
        agentRegister: X402_PRICING.AGENT_REGISTER,
        description: "High-volume operations",
        dailyLimit: null,
      },
    },
    payment: {
      token: PAYMENT_CONFIG.token,
      tokenSymbol: "USDC",
      chain: PAYMENT_CONFIG.chain,
      chainId: PAYMENT_CONFIG.chainId,
      recipient: PAYMENT_CONFIG.recipient,
    },
    documentation: "https://github.com/GeObts/filecoin-agent-reputation/blob/master/docs/X402_INTEGRATION.md",
    currency: "USDC",
    network: "Base",
  });
}

import { NextRequest, NextResponse } from "next/server";

/**
 * x402 Payment Configuration for FARS API
 * Next.js serverless functions compatible
 */

export const X402_PRICING = {
  // Free tier
  HEALTH_CHECK: "0.00",
  PRICING_INFO: "0.00",
  
  // Basic tier ($0.01 - $0.03)
  IDENTITY_RETRIEVE: "0.01",
  HISTORY_RETRIEVE: "0.03",
  PROOF_RETRIEVE: "0.03",
  
  // Premium tier ($0.05 - $0.10)
  REPUTATION_QUERY: "0.05",
  IDENTITY_CREATE: "0.10",
  
  // Enterprise tier ($0.25 - $0.50)
  REPUTATION_CALCULATE: "0.25",
  AGENT_REGISTER: "0.50",
} as const;

export const PAYMENT_CONFIG = {
  token: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
  chain: "base",
  chainId: 8453,
  recipient: process.env.PAYMENT_RECIPIENT_ADDRESS || "0x0eD39Ba9Ab663A20D65cc6e3927dDe40e37309d4",
};

/**
 * Verify x402 payment for Next.js API route
 */
export async function verifyPayment(
  req: NextRequest,
  priceUSDC: string
): Promise<{ valid: boolean; error?: string }> {
  const price = parseFloat(priceUSDC);
  
  // Free tier - no payment required
  if (price === 0) {
    return { valid: true };
  }

  // Check if payment verification is disabled (dev mode)
  if (!process.env.PAYMENT_RECIPIENT_ADDRESS) {
    console.warn("[x402] Payment verification disabled - dev mode");
    return { valid: true };
  }

  // Extract x402 payment headers
  const paymentProof = req.headers.get("x-payment-proof");
  const paymentAmount = req.headers.get("x-payment-amount");
  const paymentToken = req.headers.get("x-payment-token");
  const paymentChain = req.headers.get("x-payment-chain");

  if (!paymentProof || !paymentAmount || !paymentToken || !paymentChain) {
    return {
      valid: false,
      error: `Payment required: ${priceUSDC} USDC. Include x402 payment headers.`,
    };
  }

  // Verify payment matches requirements
  const paidAmount = parseFloat(paymentAmount);
  if (paidAmount < price) {
    return {
      valid: false,
      error: `Insufficient payment. Required: ${priceUSDC} USDC, Received: ${paymentAmount} USDC`,
    };
  }

  if (paymentToken.toLowerCase() !== PAYMENT_CONFIG.token.toLowerCase()) {
    return {
      valid: false,
      error: `Invalid payment token. Expected USDC (${PAYMENT_CONFIG.token})`,
    };
  }

  if (paymentChain.toLowerCase() !== PAYMENT_CONFIG.chain.toLowerCase()) {
    return {
      valid: false,
      error: `Invalid chain. Expected Base (${PAYMENT_CONFIG.chain})`,
    };
  }

  // TODO: Verify cryptographic signature in production
  // For now, basic header validation is sufficient for hackathon demo

  return { valid: true };
}

/**
 * Add pricing headers to response
 */
export function addPricingHeaders(response: NextResponse, priceUSDC: string): NextResponse {
  response.headers.set("X-API-Price", priceUSDC);
  response.headers.set("X-Payment-Token", "USDC");
  response.headers.set("X-Payment-Chain", "Base");
  response.headers.set("X-Payment-Recipient", PAYMENT_CONFIG.recipient);
  return response;
}

/**
 * Create payment-required response
 */
export function paymentRequired(priceUSDC: string, error?: string): NextResponse {
  return NextResponse.json(
    {
      error: error || `Payment required: ${priceUSDC} USDC`,
      payment: {
        amount: priceUSDC,
        token: PAYMENT_CONFIG.token,
        chain: PAYMENT_CONFIG.chain,
        chainId: PAYMENT_CONFIG.chainId,
        recipient: PAYMENT_CONFIG.recipient,
      },
      docs: "https://github.com/GeObts/filecoin-agent-reputation/blob/master/docs/X402_INTEGRATION.md",
    },
    { status: 402 }
  );
}

/**
 * Wrapper for x402-protected API routes
 */
export function withPayment(
  priceUSDC: string,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Verify payment
    const paymentResult = await verifyPayment(req, priceUSDC);
    
    if (!paymentResult.valid) {
      return paymentRequired(priceUSDC, paymentResult.error);
    }

    // Execute handler
    const response = await handler(req);
    
    // Add pricing headers
    return addPricingHeaders(response, priceUSDC);
  };
}

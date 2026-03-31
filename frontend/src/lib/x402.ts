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
  recipient: process.env.PAYMENT_RECIPIENT_ADDRESS ?? "",
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

  // Basic format check — must be a valid hex transaction hash
  if (!/^0x[0-9a-fA-F]+$/.test(paymentProof)) {
    return {
      valid: false,
      error: "Invalid payment proof format. Expected hex-encoded transaction hash.",
    };
  }

  // Verify transaction on-chain (production mode)
  if (process.env.VERIFY_ONCHAIN_PAYMENTS === "true") {
    try {
      const isValid = await verifyPaymentOnChain(paymentProof, {
        amount: paidAmount.toString(),
        token: paymentToken,
        recipient: PAYMENT_CONFIG.recipient,
      });

      if (!isValid) {
        return {
          valid: false,
          error: "Payment transaction not found or invalid on-chain",
        };
      }
    } catch (error) {
      console.error("[x402] On-chain verification failed:", error);
      return {
        valid: false,
        error: "On-chain payment verification failed",
      };
    }
  }

  return { valid: true };
}

/**
 * Verify payment transaction on Base blockchain
 * Checks that the tx exists, matches the amount, token, and recipient
 */
async function verifyPaymentOnChain(
  txHash: string,
  expected: { amount: string; token: string; recipient: string }
): Promise<boolean> {
  try {
    // Query Base Sepolia block explorer API
    const response = await fetch(
      `https://api-sepolia.basescan.org/api?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}&apikey=YourApiKeyToken`
    );

    const data = await response.json();

    if (!data.result || data.result.status !== "0x1") {
      // Transaction doesn't exist or failed
      return false;
    }

    const receipt = data.result;

    // Verify recipient (to address)
    if (receipt.to?.toLowerCase() !== expected.token.toLowerCase()) {
      // Transaction wasn't to the USDC contract
      return false;
    }

    // Parse USDC Transfer event logs
    // Transfer event signature: 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
    const transferEvents = receipt.logs.filter(
      (log: any) =>
        log.topics[0] ===
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
    );

    if (transferEvents.length === 0) {
      return false;
    }

    // Decode transfer event (topics[1] = from, topics[2] = to, data = amount)
    const transferEvent = transferEvents[0];
    const toAddress = "0x" + transferEvent.topics[2].slice(26); // Remove padding
    const amountHex = transferEvent.data;
    const amountWei = BigInt(amountHex);

    // USDC has 6 decimals
    const amountUSDC = Number(amountWei) / 1e6;

    // Verify recipient matches
    if (toAddress.toLowerCase() !== expected.recipient.toLowerCase()) {
      return false;
    }

    // Verify amount is sufficient
    if (amountUSDC < parseFloat(expected.amount)) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("[x402] On-chain verification error:", error);
    return false;
  }
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

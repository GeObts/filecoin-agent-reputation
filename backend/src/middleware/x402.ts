import { Request, Response, NextFunction } from 'express';
import { createX402Middleware, X402Config } from '@x402/core';
import { parseUnits } from 'viem';

/**
 * x402 Payment Middleware for FARS API
 * 
 * Enables micropayments for API endpoints to:
 * - Prevent spam/abuse
 * - Create sustainable revenue model
 * - Add economic sybil resistance
 */

// Pricing configuration (in USDC)
export const X402_PRICING = {
  // Identity operations
  IDENTITY_CREATE: '0.10',      // Creating agent identity
  IDENTITY_RETRIEVE: '0.01',    // Querying identity by CID
  
  // Reputation operations
  REPUTATION_CALCULATE: '0.25', // Full reputation calculation
  REPUTATION_QUERY: '0.05',     // Simple reputation lookup
  
  // History/proof operations
  HISTORY_RETRIEVE: '0.03',     // Retrieving action history
  PROOF_RETRIEVE: '0.03',       // Retrieving proof-of-history
  
  // Full agent registration
  AGENT_REGISTER: '0.50',       // Complete registration flow
  
  // Free tier (no payment required)
  HEALTH_CHECK: '0.00',         // Health endpoint
  PUBLIC_INFO: '0.00'           // Public metadata endpoints
};

// Payment token configuration (USDC on Base)
const PAYMENT_CONFIG = {
  token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
  chain: 'base',
  recipient: process.env.PAYMENT_RECIPIENT_ADDRESS || process.env.WALLET_ADDRESS
};

/**
 * Create x402 middleware for a specific price point
 */
export function requirePayment(priceUSDC: string) {
  if (!PAYMENT_CONFIG.recipient) {
    console.warn('[x402] No payment recipient configured - payments disabled');
    // Return passthrough middleware if not configured
    return (req: Request, res: Response, next: NextFunction) => next();
  }

  const price = parseFloat(priceUSDC);
  
  // Free tier - no payment required
  if (price === 0) {
    return (req: Request, res: Response, next: NextFunction) => next();
  }

  const config: X402Config = {
    price: priceUSDC,
    token: PAYMENT_CONFIG.token,
    recipient: PAYMENT_CONFIG.recipient!,
    chainId: 8453, // Base mainnet
    description: `FARS API access - $${priceUSDC} USDC`
  };

  try {
    return createX402Middleware(config);
  } catch (error) {
    console.error('[x402] Failed to create payment middleware:', error);
    // Fallback to passthrough on error
    return (req: Request, res: Response, next: NextFunction) => next();
  }
}

/**
 * Pricing tier middleware - adds pricing info to response headers
 */
export function addPricingHeaders(priceUSDC: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-API-Price', priceUSDC);
    res.setHeader('X-Payment-Token', 'USDC');
    res.setHeader('X-Payment-Chain', 'Base');
    res.setHeader('X-Payment-Recipient', PAYMENT_CONFIG.recipient || 'not-configured');
    next();
  };
}

/**
 * Enhanced x402 middleware with custom pricing
 * Combines payment requirement + pricing headers
 */
export function x402Payment(priceUSDC: string) {
  return [
    addPricingHeaders(priceUSDC),
    requirePayment(priceUSDC)
  ];
}

/**
 * Pricing tier type definitions
 */
export enum PricingTier {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE'
}

/**
 * Tier-based pricing configuration
 */
export const PRICING_TIERS = {
  [PricingTier.FREE]: {
    dailyLimit: 10,
    endpoints: ['health', 'public-info']
  },
  [PricingTier.BASIC]: {
    pricePerRequest: '0.01',
    dailyLimit: 100,
    endpoints: ['identity-retrieve', 'history-retrieve', 'proof-retrieve']
  },
  [PricingTier.PREMIUM]: {
    pricePerRequest: '0.05',
    dailyLimit: 1000,
    endpoints: ['reputation-query', 'reputation-calculate']
  },
  [PricingTier.ENTERPRISE]: {
    pricePerRequest: '0.25',
    dailyLimit: null, // unlimited
    endpoints: ['agent-register', 'identity-create']
  }
};

/**
 * Usage tracking (simple in-memory for demo - use Redis in production)
 */
const usageTracker = new Map<string, { count: number; resetAt: number }>();

export function trackUsage(address: string, tier: PricingTier): boolean {
  const tierConfig = PRICING_TIERS[tier];
  if (!tierConfig.dailyLimit) return true; // unlimited

  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;
  
  let usage = usageTracker.get(address);
  
  // Reset if past 24h
  if (!usage || now > usage.resetAt) {
    usage = { count: 0, resetAt: now + dayInMs };
    usageTracker.set(address, usage);
  }

  // Check limit
  if (usage.count >= tierConfig.dailyLimit) {
    return false; // limit exceeded
  }

  usage.count++;
  return true;
}

/**
 * Rate limiting middleware based on payment/tier
 */
export function rateLimitByTier(tier: PricingTier) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Extract address from x402 payment proof or API key
    const address = req.headers['x-payment-address'] as string || 
                   req.headers['x-api-key'] as string ||
                   'anonymous';

    if (!trackUsage(address, tier)) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        tier,
        limit: PRICING_TIERS[tier].dailyLimit,
        resetIn: '24 hours',
        upgrade: 'Use x402 payment or upgrade tier for higher limits'
      });
    }

    next();
  };
}

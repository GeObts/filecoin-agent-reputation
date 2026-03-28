/**
 * Example: Using FARS API with x402 Payments
 * 
 * This example shows how to interact with FARS paid endpoints
 * using the x402 payment protocol.
 */

import { X402Client } from '@x402/core';
import { parseUnits } from 'viem';

// Configuration
const FARS_API_URL = process.env.FARS_API_URL || 'https://your-fars-api.vercel.app';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // USDC on Base

if (!PRIVATE_KEY) {
  throw new Error('PRIVATE_KEY environment variable required');
}

// Initialize x402 client
const client = new X402Client({
  privateKey: PRIVATE_KEY,
  chainId: 8453 // Base mainnet
});

/**
 * Example 1: Register an Agent
 * Cost: $0.50 USDC
 */
async function registerAgent() {
  console.log('[Example 1] Registering agent with full flow...');
  
  const response = await client.post(`${FARS_API_URL}/api/agent/register`, {
    agentId: '0xYourAgentAddress',
    name: 'My AI Agent',
    type: 'autonomous_agent',
    capabilities: ['code_review', 'data_analysis'],
    metadata: {
      version: '1.0.0',
      framework: 'langchain'
    },
    githubUsername: 'myagent'
  }, {
    payment: {
      token: USDC_ADDRESS,
      amount: '0.50', // $0.50 USDC
      recipient: process.env.FARS_RECIPIENT_ADDRESS
    }
  });

  console.log('Registration successful:', response.data);
  console.log('Filecoin CIDs:', response.data.filecoin);
}

/**
 * Example 2: Calculate Reputation
 * Cost: $0.25 USDC
 */
async function calculateReputation(agentAddress: string) {
  console.log('[Example 2] Calculating reputation...');
  
  const response = await client.post(`${FARS_API_URL}/api/reputation/calculate`, {
    agentAddress,
    githubUsername: 'myagent'
  }, {
    payment: {
      token: USDC_ADDRESS,
      amount: '0.25'
    }
  });

  console.log('Reputation Score:', response.data.reputation);
  console.log('Action Count:', response.data.actionCount);
  console.log('History CID:', response.data.filecoin.historyCID);
}

/**
 * Example 3: Query Reputation (Lightweight)
 * Cost: $0.05 USDC
 */
async function queryReputation(agentAddress: string) {
  console.log('[Example 3] Querying reputation...');
  
  const response = await client.get(`${FARS_API_URL}/api/reputation/${agentAddress}`, {
    payment: {
      token: USDC_ADDRESS,
      amount: '0.05'
    }
  });

  console.log('Quick Reputation Check:', response.data);
}

/**
 * Example 4: Retrieve Identity from Filecoin
 * Cost: $0.01 USDC
 */
async function getIdentity(cid: string) {
  console.log('[Example 4] Retrieving identity from Filecoin...');
  
  const response = await client.get(`${FARS_API_URL}/api/identity/${cid}`, {
    payment: {
      token: USDC_ADDRESS,
      amount: '0.01'
    }
  });

  console.log('Identity Data:', response.data.identity);
}

/**
 * Example 5: Check Pricing (Free)
 */
async function checkPricing() {
  console.log('[Example 5] Checking API pricing...');
  
  // No payment required for pricing endpoint
  const response = await fetch(`${FARS_API_URL}/api/pricing`);
  const data = await response.json();
  
  console.log('FARS Pricing:');
  console.log(JSON.stringify(data, null, 2));
}

/**
 * Example 6: Batch Operations with x402
 */
async function batchOperations(agentAddresses: string[]) {
  console.log('[Example 6] Running batch reputation queries...');
  
  const results = [];
  
  for (const address of agentAddresses) {
    try {
      const response = await client.get(`${FARS_API_URL}/api/reputation/${address}`, {
        payment: {
          token: USDC_ADDRESS,
          amount: '0.05'
        }
      });
      
      results.push({
        address,
        reputation: response.data.reputation,
        paid: '$0.05'
      });
      
      // Rate limiting: wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error: any) {
      console.error(`Failed for ${address}:`, error.message);
    }
  }
  
  console.log('Batch Results:', results);
  console.log(`Total Spent: $${(results.length * 0.05).toFixed(2)} USDC`);
}

/**
 * Example 7: Error Handling
 */
async function handleErrors() {
  console.log('[Example 7] Demonstrating error handling...');
  
  try {
    // This will fail - insufficient payment
    await client.post(`${FARS_API_URL}/api/agent/register`, {
      agentId: '0xTest',
      name: 'Test Agent'
    }, {
      payment: {
        token: USDC_ADDRESS,
        amount: '0.10' // Should be $0.50!
      }
    });
  } catch (error: any) {
    console.log('Expected error:', error.response?.data || error.message);
  }
  
  try {
    // This will fail - rate limit exceeded (if running multiple times)
    for (let i = 0; i < 15; i++) {
      await client.get(`${FARS_API_URL}/api/identity/test`, {
        payment: {
          token: USDC_ADDRESS,
          amount: '0.01'
        }
      });
    }
  } catch (error: any) {
    if (error.response?.status === 429) {
      console.log('Rate limit hit:', error.response.data);
    }
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('=== FARS x402 Client Examples ===\n');
  
  try {
    // Run examples
    await checkPricing();
    console.log('\n---\n');
    
    // Uncomment to test paid endpoints (requires USDC balance)
    // await registerAgent();
    // await calculateReputation('0xYourAgentAddress');
    // await queryReputation('0xYourAgentAddress');
    // await getIdentity('bafybeib...');
    // await batchOperations(['0xAgent1', '0xAgent2', '0xAgent3']);
    // await handleErrors();
    
    console.log('\n✅ Examples completed!');
    console.log('\nTips:');
    console.log('- Make sure you have USDC on Base for paid endpoints');
    console.log('- Check your balance: https://basescan.org/token/' + USDC_ADDRESS);
    console.log('- Rate limits: Free=10/day, Basic=100/day, Premium=1000/day');
    console.log('- See X402_INTEGRATION.md for full documentation');
    
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  registerAgent,
  calculateReputation,
  queryReputation,
  getIdentity,
  checkPricing,
  batchOperations,
  handleErrors
};

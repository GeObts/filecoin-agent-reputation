# Development Scripts

Utility scripts used during development and testing. Not required for production deployment.

## Files

- `check-balance.js` - Check wallet balances on Base Sepolia
- `derive-key.js` - Derive Ethereum address from private key
- `estimate-gas.js` - Estimate gas costs for transactions
- `register-agent.js` - Manual agent registration script
- `register-with-cdp.js` - Register using CDP AgentKit wallet
- `test-filecoin-simple.js` - Test Filecoin storage integration
- `verify-onchain.js` - Verify agent registration on-chain

## Usage

These scripts were used for initial setup and testing. The production application uses:
- Frontend: Next.js with serverless API routes
- Smart contracts: Deployed on Base Sepolia
- Storage: Filecoin via Synapse SDK

For production usage, see the main README.md in the root directory.

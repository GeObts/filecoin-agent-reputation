const { ethers } = require('ethers');
const deployed = require('./deployed-contracts.json');
const demo = require('./beansai-demo-output.json');

async function main() {
  // Setup wallet and provider
  const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
  
  // Need private key from env
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('Error: PRIVATE_KEY not set in environment');
    process.exit(1);
  }
  
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log('Using wallet:', wallet.address);
  
  // Connect to contracts
  const registry = new ethers.Contract(
    deployed.contracts.AgentRegistry.address,
    deployed.contracts.AgentRegistry.abi,
    wallet
  );
  
  const reputationOracle = new ethers.Contract(
    deployed.contracts.ReputationOracle.address,
    deployed.contracts.ReputationOracle.abi,
    wallet
  );
  
  console.log('\n1. Registering agent identity...');
  const registerTx = await registry.registerAgent(
    demo.address,
    demo.cids.identity
  );
  console.log('TX:', registerTx.hash);
  await registerTx.wait();
  console.log('✅ Agent registered!');
  
  console.log('\n2. Updating agent state...');
  const updateStateTx = await registry.updateAgentState(
    demo.address,
    demo.cids.history
  );
  console.log('TX:', updateStateTx.hash);
  await updateStateTx.wait();
  console.log('✅ State updated!');
  
  console.log('\n3. Updating reputation...');
  const updateRepTx = await reputationOracle.updateReputation(
    demo.address,
    demo.reputationScore,
    demo.cids.history,
    demo.cids.identity, // Using identity as proof CID for now
    1 // action count
  );
  console.log('TX:', updateRepTx.hash);
  await updateRepTx.wait();
  console.log('✅ Reputation updated!');
  
  console.log('\n✨ beansai.eth is now fully registered on-chain!');
  console.log('View on explorer:', `https://sepolia.basescan.org/address/${demo.address}`);
}

main().catch(console.error);

const { ethers } = require('ethers');
const deployed = require('./deployed-contracts.json');

async function main() {
  const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
  const registry = new ethers.Contract(
    deployed.contracts.AgentRegistry.address,
    deployed.contracts.AgentRegistry.abi,
    provider
  );
  
  const agentAddress = '0x0eD39Ba9Ab663A20D65cc6e3927dDe40e37309d4';
  
  console.log('Checking agent registration on-chain...');
  const agent = await registry.getAgent(agentAddress);
  
  console.log('\nAgent Data:');
  console.log('  Owner:', agent.owner);
  console.log('  Identity CID:', agent.identityCID);
  console.log('  State CID:', agent.currentStateCID);
  console.log('  Registered:', new Date(Number(agent.registeredAt) * 1000).toISOString());
  console.log('  Active:', agent.isActive);
  
  const reputationOracle = new ethers.Contract(
    deployed.contracts.ReputationOracle.address,
    deployed.contracts.ReputationOracle.abi,
    provider
  );
  
  console.log('\nChecking reputation...');
  const rep = await reputationOracle.getReputation(agentAddress);
  console.log('  Score:', rep.totalScore.toString());
  console.log('  History CID:', rep.historyCID);
  console.log('  Proof CID:', rep.proofOfHistoryCID);
  console.log('  Action Count:', rep.actionCount.toString());
}

main().catch(console.error);

const { createWalletClient, createPublicClient, http, parseEther } = require('viem');
const { baseSepolia } = require('viem/chains');
const { privateKeyToAccount } = require('viem/accounts');
const fs = require('fs');
const path = require('path');

// Read private key from CDP wallet
const cdpWallet = JSON.parse(fs.readFileSync('/home/ubuntu/.cdp/wallet.json', 'utf8'));
const privateKey = `0x${cdpWallet.seed}`;

const account = privateKeyToAccount(privateKey);

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http()
});

const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http()
});

// Contract bytecode and ABIs
const AgentRegistryBytecode = fs.readFileSync(
  path.join(__dirname, 'contracts/bytecode/AgentRegistry.bin'),
  'utf8'
).trim();

const ReputationOracleBytecode = fs.readFileSync(
  path.join(__dirname, 'contracts/bytecode/ReputationOracle.bin'),
  'utf8'
).trim();

async function deployContract(name, bytecode) {
  console.log(`\n🚀 Deploying ${name}...`);
  
  const hash = await walletClient.deployContract({
    abi: [],
    bytecode: `0x${bytecode}`,
    args: []
  });
  
  console.log(`📤 TX: ${hash}`);
  
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  
  console.log(`✅ ${name} deployed at: ${receipt.contractAddress}`);
  console.log(`   Gas used: ${receipt.gasUsed}`);
  
  return receipt.contractAddress;
}

async function main() {
  console.log('🏗️  Deploying Filecoin Agent Reputation System contracts');
  console.log(`📍 Network: Base Sepolia`);
  console.log(`👛 Deployer: ${account.address}`);
  
  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`💰 Balance: ${Number(balance) / 1e18} ETH\n`);
  
  // Deploy AgentRegistry
  const agentRegistryAddress = await deployContract('AgentRegistry', AgentRegistryBytecode);
  
  // Deploy ReputationOracle
  const reputationOracleAddress = await deployContract('ReputationOracle', ReputationOracleBytecode);
  
  // Save addresses
  const deploymentInfo = {
    network: 'base-sepolia',
    chainId: 84532,
    deployedAt: new Date().toISOString(),
    deployer: account.address,
    contracts: {
      AgentRegistry: agentRegistryAddress,
      ReputationOracle: reputationOracleAddress
    }
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'deployed-contracts.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log('\n✅ Deployment complete!');
  console.log('📄 Addresses saved to deployed-contracts.json');
  console.log('\n📋 Summary:');
  console.log(`   AgentRegistry: ${agentRegistryAddress}`);
  console.log(`   ReputationOracle: ${reputationOracleAddress}`);
}

main().catch(console.error);

const solc = require('solc');
const fs = require('fs');
const path = require('path');
const { createWalletClient, createPublicClient, http } = require('viem');
const { baseSepolia } = require('viem/chains');
const { privateKeyToAccount } = require('viem/accounts');

// Read contracts
const agentRegistrySource = fs.readFileSync(
  path.join(__dirname, 'contracts/src/AgentRegistry.sol'),
  'utf8'
);

const reputationOracleSource = fs.readFileSync(
  path.join(__dirname, 'contracts/src/ReputationOracle.sol'),
  'utf8'
);

// Compile
console.log('🔨 Compiling contracts...\n');

const input = {
  language: 'Solidity',
  sources: {
    'AgentRegistry.sol': { content: agentRegistrySource },
    'ReputationOracle.sol': { content: reputationOracleSource }
  },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode']
      }
    }
  }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  const errors = output.errors.filter(e => e.severity === 'error');
  if (errors.length > 0) {
    console.error('❌ Compilation errors:');
    errors.forEach(err => console.error(err.formattedMessage));
    process.exit(1);
  }
}

const agentRegistryContract = output.contracts['AgentRegistry.sol']['AgentRegistry'];
const reputationOracleContract = output.contracts['ReputationOracle.sol']['ReputationOracle'];

console.log('✅ Contracts compiled successfully\n');

// Deploy
async function deploy() {
  // Setup wallet
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

  console.log('🏗️  Deploying to Base Sepolia');
  console.log(`👛 Deployer: ${account.address}`);
  
  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`💰 Balance: ${Number(balance) / 1e18} ETH\n`);

  // Deploy AgentRegistry
  console.log('📤 Deploying AgentRegistry...');
  const agentRegistryHash = await walletClient.deployContract({
    abi: agentRegistryContract.abi,
    bytecode: `0x${agentRegistryContract.evm.bytecode.object}`,
    args: []
  });

  console.log(`   TX: ${agentRegistryHash}`);
  const agentRegistryReceipt = await publicClient.waitForTransactionReceipt({ hash: agentRegistryHash });
  console.log(`✅ AgentRegistry: ${agentRegistryReceipt.contractAddress}`);
  console.log(`   Gas used: ${agentRegistryReceipt.gasUsed}\n`);

  // Deploy ReputationOracle
  console.log('📤 Deploying ReputationOracle...');
  const reputationOracleHash = await walletClient.deployContract({
    abi: reputationOracleContract.abi,
    bytecode: `0x${reputationOracleContract.evm.bytecode.object}`,
    args: []
  });

  console.log(`   TX: ${reputationOracleHash}`);
  const reputationOracleReceipt = await publicClient.waitForTransactionReceipt({ hash: reputationOracleHash });
  console.log(`✅ ReputationOracle: ${reputationOracleReceipt.contractAddress}`);
  console.log(`   Gas used: ${reputationOracleReceipt.gasUsed}\n`);

  // Save deployment info
  const deploymentInfo = {
    network: 'base-sepolia',
    chainId: 84532,
    deployedAt: new Date().toISOString(),
    deployer: account.address,
    contracts: {
      AgentRegistry: {
        address: agentRegistryReceipt.contractAddress,
        tx: agentRegistryHash,
        abi: agentRegistryContract.abi
      },
      ReputationOracle: {
        address: reputationOracleReceipt.contractAddress,
        tx: reputationOracleHash,
        abi: reputationOracleContract.abi
      }
    }
  };

  fs.writeFileSync(
    path.join(__dirname, 'deployed-contracts.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log('✅ Deployment complete!');
  console.log('📄 Saved to deployed-contracts.json\n');
  console.log('📋 Contract Addresses:');
  console.log(`   AgentRegistry: ${agentRegistryReceipt.contractAddress}`);
  console.log(`   ReputationOracle: ${reputationOracleReceipt.contractAddress}`);
  console.log(`\n🔗 Base Sepolia Explorer:`);
  console.log(`   https://sepolia.basescan.org/address/${agentRegistryReceipt.contractAddress}`);
  console.log(`   https://sepolia.basescan.org/address/${reputationOracleReceipt.contractAddress}`);
}

deploy().catch(console.error);

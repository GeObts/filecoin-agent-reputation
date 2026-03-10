const solc = require('solc');
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

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
  // Setup wallet - use correct derivation path for beansai.eth
  const walletData = JSON.parse(fs.readFileSync('/home/ubuntu/.cdp/wallet.json', 'utf8'));
  const seed = '0x' + walletData.seed;
  
  const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
  const hdNode = ethers.HDNodeWallet.fromSeed(seed);
  const wallet = hdNode.derivePath("m/44'/60'/0'/0/0").connect(provider);

  console.log('🏗️  Deploying to Base Sepolia');
  console.log(`👛 Deployer: ${wallet.address} (beansai.eth)`);
  
  const balance = await provider.getBalance(wallet.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);

  if (balance === 0n) {
    console.error('❌ No balance! Send testnet ETH to:', wallet.address);
    process.exit(1);
  }

  // Deploy AgentRegistry
  console.log('📤 Deploying AgentRegistry...');
  const AgentRegistryFactory = new ethers.ContractFactory(
    agentRegistryContract.abi,
    '0x' + agentRegistryContract.evm.bytecode.object,
    wallet
  );
  
  const agentRegistry = await AgentRegistryFactory.deploy();
  await agentRegistry.waitForDeployment();
  const agentRegistryAddress = await agentRegistry.getAddress();
  
  console.log(`✅ AgentRegistry: ${agentRegistryAddress}`);
  console.log(`   TX: ${agentRegistry.deploymentTransaction().hash}\n`);

  // Deploy ReputationOracle
  console.log('📤 Deploying ReputationOracle...');
  const ReputationOracleFactory = new ethers.ContractFactory(
    reputationOracleContract.abi,
    '0x' + reputationOracleContract.evm.bytecode.object,
    wallet
  );
  
  const reputationOracle = await ReputationOracleFactory.deploy();
  await reputationOracle.waitForDeployment();
  const reputationOracleAddress = await reputationOracle.getAddress();
  
  console.log(`✅ ReputationOracle: ${reputationOracleAddress}`);
  console.log(`   TX: ${reputationOracle.deploymentTransaction().hash}\n`);

  // Save deployment info
  const deploymentInfo = {
    network: 'base-sepolia',
    chainId: 84532,
    deployedAt: new Date().toISOString(),
    deployer: wallet.address,
    contracts: {
      AgentRegistry: {
        address: agentRegistryAddress,
        tx: agentRegistry.deploymentTransaction().hash,
        abi: agentRegistryContract.abi
      },
      ReputationOracle: {
        address: reputationOracleAddress,
        tx: reputationOracle.deploymentTransaction().hash,
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
  console.log(`   AgentRegistry: ${agentRegistryAddress}`);
  console.log(`   ReputationOracle: ${reputationOracleAddress}`);
  console.log(`\n🔗 Base Sepolia Explorer:`);
  console.log(`   https://sepolia.basescan.org/address/${agentRegistryAddress}`);
  console.log(`   https://sepolia.basescan.org/address/${reputationOracleAddress}`);
}

deploy().catch(console.error);

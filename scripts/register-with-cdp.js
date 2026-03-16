const { Coinbase, Wallet } = require('@coinbase/coinbase-sdk');
const fs = require('fs');
const deployed = require('./deployed-contracts.json');
const demo = require('./beansai-demo-output.json');

async function main() {
  // Initialize CDP SDK
  Coinbase.configure({
    apiKeyName: process.env.CDP_API_KEY_NAME || fs.readFileSync(process.env.HOME + '/.cdp/credentials.json', 'utf8').split('"')[3],
    privateKey: process.env.CDP_API_KEY_PRIVATE || fs.readFileSync(process.env.HOME + '/.cdp/credentials.json', 'utf8').split('"')[7].replace(/\\n/g, '\n')
  });
  
  // Load existing wallet
  const walletData = fs.readFileSync(process.env.HOME + '/.cdp/wallet.json', 'utf8');
  const wallet = await Wallet.import(JSON.parse(walletData));
  
  console.log('Wallet address:', await wallet.getDefaultAddress());
  
  // Invoke contract
  const invocation = await wallet.invokeContract({
    contractAddress: deployed.contracts.AgentRegistry.address,
    method: 'registerAgent',
    args: {
      agentAddress: demo.address,
      identityCID: demo.cids.identity
    },
    abi: deployed.contracts.AgentRegistry.abi
  });
  
  await invocation.wait();
  console.log('✅ Agent registered!');
  console.log('TX:', invocation.getTransactionHash());
}

main().catch(console.error);

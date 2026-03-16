const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');

async function main() {
  const addresses = [
    {name: 'beansai.eth', addr: '0x0eD39Ba9Ab663A20D65cc6e3927dDe40e37309d4'},
    {name: 'deployer', addr: '0xCcd69502B2EdEfD280C54c195DcC3583192E3507'}
  ];
  
  for (const {name, addr} of addresses) {
    const balance = await provider.getBalance(addr);
    console.log(`${name}: ${ethers.formatEther(balance)} ETH`);
  }
}

main().catch(console.error);

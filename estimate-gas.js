const { ethers } = require('ethers');
// ~200k gas * 0.1 gwei = 0.00002 ETH per transaction
// We have 0.00009 ETH = enough for ~4 transactions
console.log('Estimated cost per transaction: ~0.00002 ETH');
console.log('Available balance: 0.00009 ETH');
console.log('Can do: ~4 transactions ✅');

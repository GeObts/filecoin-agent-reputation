const { ethers } = require('ethers');
const fs = require('fs');

// Read CDP wallet
const cdpWallet = JSON.parse(fs.readFileSync(process.env.HOME + '/.cdp/wallet.json'));
const seedHex = cdpWallet.seed;

// Create HD Node from seed
const hdNode = ethers.HDNodeWallet.fromSeed(seedHex);
const derived = hdNode.derivePath("m/44'/60'/0'/0/0");

console.log('Address:', derived.address);
console.log('Private Key:', derived.privateKey);

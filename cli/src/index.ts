#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';

const API_BASE_URL = process.env.FARS_API_URL || 'https://filecoin-agent-reputation.vercel.app/api';

const program = new Command();

program
  .name('fars-cli')
  .description('Filecoin Agent Reputation System CLI')
  .version('1.0.0');

program
  .command('verify')
  .description('Verify an agent identity from Filecoin')
  .argument('<address>', 'Agent Ethereum address')
  .action(async (address) => {
    console.log(chalk.blue('\n🔍 Verifying agent identity...\n'));
    console.log(chalk.gray(`Address: ${address}`));
    console.log(chalk.gray('Network: Base Sepolia'));
    console.log(chalk.gray('Filecoin: Calibration Testnet\n'));
    
    try {
      // Actually fetch from API (requires x402 payment in production)
      const response = await fetch(`${API_BASE_URL}/reputation/${address}`, {
        headers: {
          'Content-Type': 'application/json',
          // In production, add x402 payment headers here
        }
      });

      if (response.status === 402) {
        console.log(chalk.yellow('⚠️  Payment required (x402 micropayment)'));
        const paymentInfo = await response.json();
        console.log(chalk.gray(`Price: ${paymentInfo.payment.amount} USDC`));
        console.log(chalk.gray(`Docs: ${paymentInfo.docs}\n`));
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      console.log(chalk.green('✅ Identity verified on Filecoin'));
      console.log(chalk.white(`CID: ${data.identityCID || 'Not found'}`));
      console.log(chalk.white(`Reputation Score: ${data.reputation?.totalScore || 0}`));
      console.log(chalk.white(`Action Count: ${data.reputation?.actionCount || 0}`));
      console.log(chalk.white(`Registered: ${data.registeredAt || 'Unknown'}\n`));
    } catch (error) {
      console.log(chalk.red(`\n❌ Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`));
      console.log(chalk.gray('Note: Ensure agent is registered and API is accessible'));
    }
  });

program
  .command('score')
  .description('Calculate reputation score for an agent')
  .argument('<address>', 'Agent Ethereum address')
  .option('-g, --github <username>', 'GitHub username for code contribution tracking')
  .action(async (address, options) => {
    console.log(chalk.blue(`\n📊 Calculating reputation for ${address}...\n`));
    
    console.log(chalk.gray('Fetching blockchain activity...'));
    console.log(chalk.gray('Analyzing contributions...'));
    console.log(chalk.gray('Generating proof-of-history...\n'));
    
    try {
      const response = await fetch(`${API_BASE_URL}/reputation/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // In production, add x402 payment headers ($0.25 USDC)
        },
        body: JSON.stringify({
          agentAddress: address,
          githubUsername: options.github || undefined
        })
      });

      if (response.status === 402) {
        console.log(chalk.yellow('⚠️  Payment required: $0.25 USDC'));
        const paymentInfo = await response.json();
        console.log(chalk.gray(`Docs: ${paymentInfo.docs}\n`));
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const rep = data.reputation;
      
      console.log(chalk.green('✅ Score calculated'));
      console.log(chalk.white(`Total Score: ${rep.totalScore}`));
      console.log(chalk.white(`Agent Tasks: ${rep.breakdown.agentTasks}`));
      console.log(chalk.white(`Blockchain Activity: ${rep.breakdown.blockchainActivity}`));
      console.log(chalk.white(`Agent Interactions: ${rep.breakdown.agentInteractions}`));
      console.log(chalk.white(`API Calls: ${rep.breakdown.apiCalls}`));
      console.log(chalk.white(`Code Contributions: ${rep.breakdown.codeContributions}`));
      console.log(chalk.white(`Uptime: ${rep.breakdown.uptime}`));
      console.log(chalk.gray(`\nActions analyzed: ${data.actions.length}\n`));
    } catch (error) {
      console.log(chalk.red(`\n❌ Calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`));
    }
  });

program
  .command('register')
  .description('Register a new agent identity')
  .argument('<address>', 'Agent Ethereum address')
  .requiredOption('-n, --name <name>', 'Agent name')
  .option('-g, --github <username>', 'GitHub username')
  .option('-c, --capabilities <list>', 'Comma-separated capabilities', (val) => val.split(','))
  .action(async (address, options) => {
    console.log(chalk.blue('\n🚀 Registering new agent...\n'));
    console.log(chalk.gray(`Address: ${address}`));
    console.log(chalk.gray(`Name: ${options.name}`));
    if (options.github) console.log(chalk.gray(`GitHub: @${options.github}`));
    console.log();
    
    console.log(chalk.yellow('⏳ Creating identity document...'));
    console.log(chalk.yellow('⏳ Uploading to Filecoin...'));
    console.log(chalk.yellow('⏳ Calculating reputation...'));
    
    try {
      const response = await fetch(`${API_BASE_URL}/agent/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // In production, add x402 payment headers ($0.50 USDC)
        },
        body: JSON.stringify({
          agentId: address,
          name: options.name,
          type: 'autonomous_agent',
          capabilities: options.capabilities || ['task_automation'],
          metadata: {
            registeredVia: 'fars-cli',
            version: '1.0.0'
          },
          githubUsername: options.github || undefined
        })
      });

      if (response.status === 402) {
        console.log(chalk.yellow('\n⚠️  Payment required: $0.50 USDC'));
        const paymentInfo = await response.json();
        console.log(chalk.gray(`Token: USDC on Base`));
        console.log(chalk.gray(`Docs: ${paymentInfo.docs}\n`));
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      console.log(chalk.green('\n✅ Agent registered successfully!'));
      console.log(chalk.white(`Identity CID: ${data.filecoin.identityCID}`));
      console.log(chalk.white(`History CID: ${data.filecoin.historyCID}`));
      console.log(chalk.white(`Proof CID: ${data.filecoin.proofCID}`));
      console.log(chalk.white(`Reputation Score: ${data.reputation.totalScore}`));
      console.log(chalk.white(`\nView on BaseScan: https://sepolia.basescan.org/address/${address}\n`));
    } catch (error) {
      console.log(chalk.red(`\n❌ Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`));
    }
  });

program.parse();

import { Octokit } from 'octokit';
import { createHash } from 'crypto';

export interface Action {
  timestamp: string;
  type: 'agent_task' | 'blockchain_transaction' | 'agent_interaction' | 'uptime' | 'api_call' | 'code_contribution';
  platform?: string;
  details: any;
  score: number;
}

export interface ReputationScore {
  totalScore: number;
  breakdown: {
    agentTasks: number;
    blockchainActivity: number;
    agentInteractions: number;
    uptime: number;
    apiCalls: number;
    codeContributions: number;
  };
  actionCount: number;
}

/**
 * Reputation calculation service
 */
export class ReputationService {
  private octokit: Octokit;

  constructor(githubToken?: string) {
    this.octokit = new Octokit({
      auth: githubToken
    });
  }

  /**
   * Fetch blockchain transactions from Base Sepolia
   */
  async fetchBlockchainActivity(agentAddress: string): Promise<Action[]> {
    try {
      const response = await fetch(
        `https://api-sepolia.basescan.org/api?module=account&action=txlist&address=${agentAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${process.env.BASESCAN_API_KEY ?? ''}`
      );
      
      const data = await response.json();
      
      if (data.status !== '1' || !data.result) {
        return [];
      }

      // Convert transactions to actions
      return data.result.slice(0, 50).map((tx: any) => ({
        timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
        type: 'blockchain_transaction' as const,
        platform: 'base_sepolia',
        details: {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          gasUsed: tx.gasUsed,
          isError: tx.isError === '0' ? false : true
        },
        score: tx.isError === '0' ? 10 : 2 // Higher score for successful txs
      }));
    } catch (error) {
      console.error('[Reputation] Blockchain activity fetch failed:', error);
      return [];
    }
  }

  /**
   * Fetch agent-to-agent interactions from FARS registry
   */
  async fetchAgentInteractions(agentAddress: string): Promise<Action[]> {
    // TODO: Implement once FARS registry stores interaction data
    // For now, return baseline interaction score
    return [
      {
        timestamp: new Date().toISOString(),
        type: 'agent_interaction' as const,
        platform: 'FARS',
        details: {
          type: 'baseline',
          description: 'Agent registered on network'
        },
        score: 25
      }
    ];
  }

  /**
   * Fetch API call history (if tracking enabled)
   */
  async fetchAPICallHistory(agentAddress: string): Promise<Action[]> {
    // TODO: Implement API call tracking via middleware logs
    // For now, return empty - will be populated when API tracking is enabled
    return [];
  }

  /**
   * Fetch task completion metrics
   */
  async fetchTaskMetrics(agentAddress: string): Promise<Action[]> {
    // TODO: Implement task completion tracking
    // Could integrate with:
    // - GitHub Issues closed
    // - Bounties completed
    // - Services provided
    return [];
  }

  /**
   * Fetch GitHub activity for a user (optional - for verification only)
   */
  async fetchGitHubActivity(username: string): Promise<Action[]> {
    try {
      const { data: events } = await this.octokit.rest.activity.listPublicEventsForUser({
        username,
        per_page: 100
      });

      return events
        .filter(e => e.type && ['PushEvent', 'PullRequestEvent', 'IssuesEvent'].includes(e.type))
        .map(event => ({
          timestamp: event.created_at || new Date().toISOString(),
          type: 'code_contribution' as const,
          platform: 'github',
          details: {
            type: event.type || 'unknown',
            repo: event.repo?.name || 'unknown',
            public: event.public
          },
          score: 5 // Lower score - just for verification
        }));
    } catch (error) {
      console.error('[Reputation] GitHub activity fetch failed:', error);
      return [];
    }
  }

  /**
   * Generate mock agent activity (placeholder until real tracking implemented)
   */
  generateBaselineActivity(agentAddress: string): Action[] {
    const now = new Date();
    const actions: Action[] = [];

    // Agent registration counts as initial activity
    actions.push({
      timestamp: now.toISOString(),
      type: 'agent_task',
      platform: 'FARS',
      details: {
        task: 'agent_registration',
        status: 'completed'
      },
      score: 100 // Base score for registration
    });

    // Baseline uptime (presence on network)
    actions.push({
      timestamp: now.toISOString(),
      type: 'uptime',
      platform: 'FARS',
      details: {
        status: 'active',
        duration: '1h'
      },
      score: 50
    });

    return actions;
  }

  /**
   * Calculate reputation score from actions
   * Focus: Agent activity > blockchain > interactions > code contributions
   */
  calculateReputation(actions: Action[]): ReputationScore {
    const breakdown = {
      agentTasks: 0,
      blockchainActivity: 0,
      agentInteractions: 0,
      uptime: 0,
      apiCalls: 0,
      codeContributions: 0
    };

    actions.forEach(action => {
      switch (action.type) {
        case 'agent_task':
          breakdown.agentTasks += action.score;
          break;
        case 'blockchain_transaction':
          breakdown.blockchainActivity += action.score;
          break;
        case 'agent_interaction':
          breakdown.agentInteractions += action.score;
          break;
        case 'uptime':
          breakdown.uptime += action.score;
          break;
        case 'api_call':
          breakdown.apiCalls += action.score;
          break;
        case 'code_contribution':
          breakdown.codeContributions += action.score;
          break;
      }
    });

    // Weighted scoring: Tasks (2x) > Blockchain (1.5x) > Interactions (1x) > Uptime (0.5x) > Code (0.3x)
    const totalScore = 
      (breakdown.agentTasks * 2) +
      (breakdown.blockchainActivity * 1.5) +
      breakdown.agentInteractions +
      (breakdown.uptime * 0.5) +
      (breakdown.apiCalls * 1.2) +
      (breakdown.codeContributions * 0.3);

    return {
      totalScore: Math.round(totalScore),
      breakdown,
      actionCount: actions.length
    };
  }

  /**
   * Generate proof-of-history data (simplified Merkle tree)
   */
  generateProof(actions: Action[]): any {
    // Simplified proof - in production would use proper Merkle tree
    const actionHashes = actions.map(action => 
      this.hashAction(action)
    );

    return {
      root: this.calculateMerkleRoot(actionHashes),
      leaves: actionHashes,
      timestamp: new Date().toISOString(),
      actionCount: actions.length
    };
  }

  private hashAction(action: Action): string {
    const data = JSON.stringify({
      timestamp: action.timestamp,
      type: action.type,
      score: action.score
    });
    return createHash('sha256').update(data).digest('hex');
  }

  private calculateMerkleRoot(hashes: string[]): string {
    if (hashes.length === 0) return '';
    if (hashes.length === 1) return hashes[0];

    let level = [...hashes];
    while (level.length > 1) {
      const next: string[] = [];
      for (let i = 0; i < level.length; i += 2) {
        const left = level[i];
        const right = level[i + 1] ?? left;
        next.push(createHash('sha256').update(left + right).digest('hex'));
      }
      level = next;
    }
    return level[0];
  }

  /**
   * Aggregate actions from multiple sources for an agent
   */
  async aggregateActions(agentAddress: string, githubUsername?: string): Promise<Action[]> {
    const actions: Action[] = [];

    // 1. Generate baseline agent activity (registration + uptime)
    const baselineActions = this.generateBaselineActivity(agentAddress);
    actions.push(...baselineActions);

    // 2. Optionally fetch GitHub activity for verification (minimal weight)
    if (githubUsername) {
      try {
        const githubActions = await this.fetchGitHubActivity(githubUsername);
        actions.push(...githubActions.slice(0, 10)); // Limit to recent 10
      } catch (error) {
        console.warn('[Reputation] GitHub fetch skipped:', error);
      }
    }

    // 3. Fetch blockchain transactions (Base Sepolia)
    try {
      const blockchainActions = await this.fetchBlockchainActivity(agentAddress);
      actions.push(...blockchainActions);
    } catch (error) {
      console.warn('[Reputation] Blockchain fetch skipped:', error);
    }

    // 4. Add agent-to-agent interaction history (from FARS registry)
    try {
      const interactionActions = await this.fetchAgentInteractions(agentAddress);
      actions.push(...interactionActions);
    } catch (error) {
      console.warn('[Reputation] Interaction fetch skipped:', error);
    }

    // 5. Add API call tracking (if available)
    try {
      const apiActions = await this.fetchAPICallHistory(agentAddress);
      actions.push(...apiActions);
    } catch (error) {
      console.warn('[Reputation] API call tracking skipped:', error);
    }

    // 6. Add task completion metrics (if available)
    try {
      const taskActions = await this.fetchTaskMetrics(agentAddress);
      actions.push(...taskActions);
    } catch (error) {
      console.warn('[Reputation] Task metrics skipped:', error);
    }

    // Sort by timestamp
    actions.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return actions;
  }
}

// Singleton instance
let reputationInstance: ReputationService | null = null;

export function initReputation(githubToken?: string): ReputationService {
  if (!reputationInstance) {
    reputationInstance = new ReputationService(githubToken);
  }
  return reputationInstance;
}

export function getReputation(): ReputationService {
  if (!reputationInstance) {
    throw new Error('Reputation service not initialized');
  }
  return reputationInstance;
}

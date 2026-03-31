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
   * Fetch GitHub activity for a user (optional - for verification only)
   */
  async fetchGitHubActivity(username: string): Promise<Action[]> {
    try {
      const { data: events } = await this.octokit.rest.activity.listPublicEventsForUser({
        username,
        per_page: 100
      });

      return events
        .filter(e => ['PushEvent', 'PullRequestEvent', 'IssuesEvent'].includes(e.type))
        .map(event => ({
          timestamp: event.created_at,
          type: 'code_contribution',
          platform: 'github',
          details: {
            type: event.type,
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
        const right = level[i + 1] ?? left; // duplicate last if odd
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

    // TODO: Add blockchain transaction fetching (high priority)
    // TODO: Add agent-to-agent interaction history
    // TODO: Add API call tracking
    // TODO: Add task completion metrics

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

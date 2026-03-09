import { Octokit } from 'octokit';

export interface Action {
  timestamp: string;
  type: 'code_contribution' | 'blockchain_transaction' | 'agent_interaction' | 'uptime';
  platform?: string;
  details: any;
  score: number;
}

export interface ReputationScore {
  totalScore: number;
  breakdown: {
    codeContributions: number;
    blockchainActivity: number;
    agentInteractions: number;
    uptime: number;
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
   * Fetch GitHub PRs for a user
   */
  async fetchGitHubPRs(username: string): Promise<Action[]> {
    try {
      const { data: pullRequests } = await this.octokit.rest.search.issuesAndPullRequests({
        q: `author:${username} type:pr is:merged`,
        sort: 'created',
        order: 'desc',
        per_page: 100
      });

      return pullRequests.items.map(pr => ({
        timestamp: pr.closed_at || pr.created_at,
        type: 'code_contribution',
        platform: 'github',
        details: {
          repo: pr.repository_url?.split('/').slice(-2).join('/') || 'unknown',
          pr: pr.number,
          title: pr.title,
          merged: true,
          url: pr.html_url
        },
        score: 10 // Base score for merged PR
      }));
    } catch (error) {
      console.error('[Reputation] GitHub PR fetch failed:', error);
      return [];
    }
  }

  /**
   * Calculate reputation score from actions
   */
  calculateReputation(actions: Action[]): ReputationScore {
    const breakdown = {
      codeContributions: 0,
      blockchainActivity: 0,
      agentInteractions: 0,
      uptime: 0
    };

    actions.forEach(action => {
      switch (action.type) {
        case 'code_contribution':
          breakdown.codeContributions += action.score;
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
      }
    });

    const totalScore = 
      breakdown.codeContributions +
      breakdown.blockchainActivity +
      breakdown.agentInteractions +
      breakdown.uptime;

    return {
      totalScore,
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
    // Simplified hash - in production would use proper cryptographic hash
    const data = JSON.stringify({
      timestamp: action.timestamp,
      type: action.type,
      score: action.score
    });
    
    return Buffer.from(data).toString('base64');
  }

  private calculateMerkleRoot(hashes: string[]): string {
    if (hashes.length === 0) return '';
    if (hashes.length === 1) return hashes[0];
    
    // Simplified - in production would build proper Merkle tree
    return Buffer.from(hashes.join('')).toString('base64');
  }

  /**
   * Aggregate actions from multiple sources for an agent
   */
  async aggregateActions(agentAddress: string, githubUsername?: string): Promise<Action[]> {
    const actions: Action[] = [];

    // Fetch GitHub PRs if username provided
    if (githubUsername) {
      const githubActions = await this.fetchGitHubPRs(githubUsername);
      actions.push(...githubActions);
    }

    // TODO: Add blockchain transaction fetching
    // TODO: Add agent interaction history
    // TODO: Add uptime metrics

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

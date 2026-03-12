"use client";

import { useAgent } from "./useAgentRegistry";
import { useReputation, useScoreBreakdown, useHasProof } from "./useReputationOracle";
import type { AgentProfile } from "@/lib/types";

export function useAgentProfile(address: `0x${string}` | undefined) {
  const agent = useAgent(address);
  const reputation = useReputation(address);
  const breakdown = useScoreBreakdown(address);
  const hasProof = useHasProof(address);

  const isLoading =
    agent.isLoading || reputation.isLoading || breakdown.isLoading || hasProof.isLoading;
  const isError =
    agent.isError || reputation.isError || breakdown.isError || hasProof.isError;

  let profile: AgentProfile | undefined;

  if (address && agent.data && reputation.data && breakdown.data && hasProof.data !== undefined) {
    profile = {
      address,
      identity: {
        owner: agent.data.owner,
        identityCID: agent.data.identityCID,
        currentStateCID: agent.data.currentStateCID,
        registeredAt: agent.data.registeredAt,
        lastUpdated: agent.data.lastUpdated,
        isActive: agent.data.isActive,
      },
      reputation: {
        totalScore: reputation.data.totalScore,
        historyCID: reputation.data.historyCID,
        proofOfHistoryCID: reputation.data.proofOfHistoryCID,
        lastCalculated: reputation.data.lastCalculated,
        actionCount: reputation.data.actionCount,
      },
      breakdown: {
        codeContributions: breakdown.data.codeContributions,
        blockchainActivity: breakdown.data.blockchainActivity,
        agentInteractions: breakdown.data.agentInteractions,
        uptime: breakdown.data.uptime,
      },
      hasProof: hasProof.data,
    };
  }

  return {
    profile,
    isLoading,
    isError,
    refetch: () => {
      agent.refetch();
      reputation.refetch();
      breakdown.refetch();
      hasProof.refetch();
    },
  };
}

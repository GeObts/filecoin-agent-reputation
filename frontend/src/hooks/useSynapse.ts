"use client";

import { useCallback } from "react";
import { useAccount } from "wagmi";
import {
  uploadIdentity as uploadIdentityFn,
  uploadHistory as uploadHistoryFn,
  uploadProof as uploadProofFn,
} from "@/lib/synapse-client";

export function useSynapse() {
  const { isConnected } = useAccount();

  const uploadIdentity = useCallback(
    async (identityData: {
      agentId: string;
      name: string;
      type: string;
      capabilities: string[];
      metadata: Record<string, unknown>;
    }) => {
      return uploadIdentityFn(identityData);
    },
    []
  );

  const uploadHistory = useCallback(
    async (agentId: string, actions: unknown[]) => {
      return uploadHistoryFn(agentId, actions);
    },
    []
  );

  const uploadProof = useCallback(
    async (agentId: string, proof: unknown) => {
      return uploadProofFn(agentId, proof);
    },
    []
  );

  return {
    uploadIdentity,
    uploadHistory,
    uploadProof,
    isReady: isConnected,
  };
}

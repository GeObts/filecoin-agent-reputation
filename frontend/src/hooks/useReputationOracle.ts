"use client";

import { useReadContract, useReadContracts } from "wagmi";
import {
  reputationOracleAbi,
  REPUTATION_ORACLE_ADDRESS,
} from "@/lib/contracts";

export function useReputation(address: `0x${string}` | undefined) {
  return useReadContract({
    address: REPUTATION_ORACLE_ADDRESS,
    abi: reputationOracleAbi,
    functionName: "getReputation",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useScoreBreakdown(address: `0x${string}` | undefined) {
  return useReadContract({
    address: REPUTATION_ORACLE_ADDRESS,
    abi: reputationOracleAbi,
    functionName: "getScoreBreakdown",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useScore(address: `0x${string}` | undefined) {
  return useReadContract({
    address: REPUTATION_ORACLE_ADDRESS,
    abi: reputationOracleAbi,
    functionName: "getScore",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useHasProof(address: `0x${string}` | undefined) {
  return useReadContract({
    address: REPUTATION_ORACLE_ADDRESS,
    abi: reputationOracleAbi,
    functionName: "hasProof",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useProofHash(address: `0x${string}` | undefined) {
  return useReadContract({
    address: REPUTATION_ORACLE_ADDRESS,
    abi: reputationOracleAbi,
    functionName: "getProofHash",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useVerifyProofHash(
  address: `0x${string}` | undefined,
  proofHash: `0x${string}` | undefined
) {
  return useReadContract({
    address: REPUTATION_ORACLE_ADDRESS,
    abi: reputationOracleAbi,
    functionName: "verifyProofHash",
    args: address && proofHash ? [address, proofHash] : undefined,
    query: { enabled: !!address && !!proofHash },
  });
}

export function useScoresBatch(addresses: `0x${string}`[]) {
  const contracts = addresses.map((addr) => ({
    address: REPUTATION_ORACLE_ADDRESS,
    abi: reputationOracleAbi,
    functionName: "getScore" as const,
    args: [addr] as const,
  }));

  return useReadContracts({
    contracts,
    query: { enabled: addresses.length > 0 },
  });
}

export function useBreakdownsBatch(addresses: `0x${string}`[]) {
  const contracts = addresses.map((addr) => ({
    address: REPUTATION_ORACLE_ADDRESS,
    abi: reputationOracleAbi,
    functionName: "getScoreBreakdown" as const,
    args: [addr] as const,
  }));

  return useReadContracts({
    contracts,
    query: { enabled: addresses.length > 0 },
  });
}

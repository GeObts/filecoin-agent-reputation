"use client";

import { useReadContract, useReadContracts } from "wagmi";
import {
  agentRegistryAbi,
  AGENT_REGISTRY_ADDRESS,
} from "@/lib/contracts";

export function useAgent(address: `0x${string}` | undefined) {
  return useReadContract({
    address: AGENT_REGISTRY_ADDRESS,
    abi: agentRegistryAbi,
    functionName: "getAgent",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useAgentCount() {
  return useReadContract({
    address: AGENT_REGISTRY_ADDRESS,
    abi: agentRegistryAbi,
    functionName: "getAgentCount",
  });
}

export function useIsAgentActive(address: `0x${string}` | undefined) {
  return useReadContract({
    address: AGENT_REGISTRY_ADDRESS,
    abi: agentRegistryAbi,
    functionName: "isAgentActive",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function useAgentAtIndex(index: number | undefined) {
  return useReadContract({
    address: AGENT_REGISTRY_ADDRESS,
    abi: agentRegistryAbi,
    functionName: "agentList",
    args: index !== undefined ? [BigInt(index)] : undefined,
    query: { enabled: index !== undefined },
  });
}

export function useAgentAddresses(count: number) {
  const contracts = Array.from({ length: count }, (_, i) => ({
    address: AGENT_REGISTRY_ADDRESS,
    abi: agentRegistryAbi,
    functionName: "agentList" as const,
    args: [BigInt(i)] as const,
  }));

  return useReadContracts({
    contracts,
    query: { enabled: count > 0 },
  });
}

export function useAgentsBatch(addresses: `0x${string}`[]) {
  const contracts = addresses.map((addr) => ({
    address: AGENT_REGISTRY_ADDRESS,
    abi: agentRegistryAbi,
    functionName: "getAgent" as const,
    args: [addr] as const,
  }));

  return useReadContracts({
    contracts,
    query: { enabled: addresses.length > 0 },
  });
}

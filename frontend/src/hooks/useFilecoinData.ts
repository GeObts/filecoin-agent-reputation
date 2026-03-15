"use client";

import { useQuery } from "@tanstack/react-query";
import { getHistory, getIdentity } from "@/lib/api";

export function useFilecoinHistory(cid: string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["filecoin-history", cid],
    queryFn: () => getHistory(cid!),
    enabled: !!cid && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000, // 5 min -- CID data is immutable
  });
}

export function useFilecoinIdentity(cid: string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["filecoin-identity", cid],
    queryFn: () => getIdentity(cid!),
    enabled: !!cid && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000,
  });
}

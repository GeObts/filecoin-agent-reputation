import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ScoreCategory } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatTimestamp(timestamp: bigint | number): string {
  const ms = typeof timestamp === "bigint" ? Number(timestamp) * 1000 : timestamp * 1000;
  if (ms === 0) return "Never";
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatScore(score: bigint | number): string {
  return Number(score).toLocaleString();
}

export function getScoreCategory(score: number): ScoreCategory {
  if (score >= 800) return "Excellent";
  if (score >= 500) return "Good";
  if (score >= 200) return "Fair";
  if (score > 0) return "Poor";
  return "Unknown";
}

export function getScoreColor(score: number): string {
  if (score >= 800) return "text-emerald-600";
  if (score >= 500) return "text-indigo-600";
  if (score >= 200) return "text-amber-600";
  if (score > 0) return "text-red-600";
  return "text-muted-foreground";
}

export function getScoreRingColor(score: number): string {
  if (score >= 800) return "#059669";
  if (score >= 500) return "#4f46e5";
  if (score >= 200) return "#d97706";
  if (score > 0) return "#dc2626";
  return "#71717a";
}

export function cidToGatewayUrl(cid: string): string {
  if (!cid) return "";
  return `https://gateway.lighthouse.storage/ipfs/${cid}`;
}

export function truncateCid(cid: string, chars = 8): string {
  if (!cid || cid.length <= chars * 2) return cid || "";
  return `${cid.slice(0, chars)}...${cid.slice(-chars)}`;
}

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

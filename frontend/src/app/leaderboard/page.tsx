"use client";

import { useRef } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScoreSparkline } from "@/components/reputation/score-sparkline";
import { TableRowSkeleton } from "@/components/ui/loading-skeleton";
import { useAgentCount, useAgentAddresses, useAgentsBatch } from "@/hooks/useAgentRegistry";
import { useScoresBatch, useBreakdownsBatch } from "@/hooks/useReputationOracle";
import { truncateAddress, getScoreColor, formatTimestamp } from "@/lib/utils";
import { useGsapEntrance, useGsapScroll, useGsapStagger } from "@/hooks/useGsap";

function getRankStyle(rank: number): string {
  if (rank === 1) return "text-amber-500 font-bold";
  if (rank === 2) return "text-slate-400 font-bold";
  if (rank === 3) return "text-amber-700 font-bold";
  return "font-medium";
}

export default function LeaderboardPage() {
  const { data: agentCount, isLoading: countLoading } = useAgentCount();
  const count = agentCount ? Number(agentCount) : 0;

  const { data: addressResults } = useAgentAddresses(count);
  const addresses = (addressResults ?? [])
    .map((r) => (r.status === "success" ? (r.result as `0x${string}`) : undefined))
    .filter((a): a is `0x${string}` => !!a);

  const { data: agentResults } = useAgentsBatch(addresses);
  const { data: scoreResults } = useScoresBatch(addresses);
  const { data: breakdownResults } = useBreakdownsBatch(addresses);

  // Build sortable list
  const agents = addresses
    .map((addr, i) => {
      const agent = agentResults?.[i];
      const score = scoreResults?.[i];
      const breakdown = breakdownResults?.[i];

      if (agent?.status !== "success" || score?.status !== "success") return null;

      const agentData = agent.result as {
        registeredAt: bigint;
        isActive: boolean;
      };
      const breakdownData = breakdown?.status === "success"
        ? (breakdown.result as {
            codeContributions: bigint;
            blockchainActivity: bigint;
            agentInteractions: bigint;
            uptime: bigint;
          })
        : null;

      return {
        address: addr,
        score: Number(score.result),
        isActive: agentData.isActive,
        registeredAt: agentData.registeredAt,
        breakdown: breakdownData
          ? {
              code: Number(breakdownData.codeContributions),
              blockchain: Number(breakdownData.blockchainActivity),
              interactions: Number(breakdownData.agentInteractions),
              uptime: Number(breakdownData.uptime),
            }
          : null,
      };
    })
    .filter((a): a is NonNullable<typeof a> => !!a)
    .sort((a, b) => b.score - a.score);

  const isLoading = countLoading || !agentResults || !scoreResults;

  const headerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const tbodyRef = useRef<HTMLTableSectionElement>(null);

  useGsapEntrance(headerRef);
  useGsapScroll(cardRef);
  useGsapStagger(tbodyRef, "> tr");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div ref={headerRef}>
        <h1 className="mb-2 text-2xl font-heading tracking-tight text-foreground sm:text-4xl">Leaderboard</h1>
        <p className="mb-8 text-muted-foreground">
          All registered agents ranked by reputation score
        </p>
      </div>

      <div ref={cardRef}>
        <Card>
          <CardHeader>
            <CardTitle>{count} Registered Agents</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} />
                ))}
              </div>
            ) : agents.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                No agents registered yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Rank</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead className="hidden sm:table-cell">Breakdown</TableHead>
                      <TableHead className="hidden md:table-cell">Registered</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody ref={tbodyRef}>
                    {agents.map((agent, i) => (
                      <TableRow key={agent.address}>
                        <TableCell className={getRankStyle(i + 1)}>#{i + 1}</TableCell>
                        <TableCell>
                          <Link
                            href={`/agent/${agent.address}`}
                            className="font-mono text-sm hover:text-primary transition-colors"
                          >
                            {truncateAddress(agent.address)}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span className={`font-bold ${getScoreColor(agent.score)}`}>
                            {agent.score}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {agent.breakdown ? (
                            <ScoreSparkline
                              codeContributions={agent.breakdown.code}
                              blockchainActivity={agent.breakdown.blockchain}
                              agentInteractions={agent.breakdown.interactions}
                              uptime={agent.breakdown.uptime}
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {formatTimestamp(agent.registeredAt)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={agent.isActive ? "default" : "secondary"}>
                            {agent.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

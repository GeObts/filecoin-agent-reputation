"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Bot, Crown, Hexagon, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/ui/search-bar";
import { StatCard } from "@/components/ui/stat-card";
import { AgentCard } from "@/components/agent/agent-card";
import {
  StatCardSkeleton,
  CardSkeleton,
} from "@/components/ui/loading-skeleton";
import {
  useAgentCount,
  useAgentAddresses,
  useAgentsBatch,
} from "@/hooks/useAgentRegistry";
import { useScoresBatch } from "@/hooks/useReputationOracle";
import {
  useGsapEntranceStagger,
  useGsapStagger,
  useGsapScroll,
} from "@/hooks/useGsap";

const SKILL_CMD = "curl -s http://localhost:3000/skill.md";

function ConnectYourAgent() {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(SKILL_CMD);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <div className="w-full max-w-lg text-left">
      <h2 className="mb-1 text-sm font-semibold text-foreground text-center">
        Connect Your Agent
      </h2>
      <div className="relative border border-border px-4 py-3 text-center">
        <code className="block pr-10 font-mono text-sm text-[#4055ff] select-all">
          {SKILL_CMD}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Copy command"
        >
          {copied ? (
            <Check className="h-4 w-4 text-[#4055ff]" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: agentCount, isLoading: countLoading, error: countError } = useAgentCount();
  const count = agentCount ? Number(agentCount) : 0;
  const displayCount = Math.min(count, 5);

  const { data: addressResults } = useAgentAddresses(displayCount);
  const addresses = (addressResults ?? [])
    .map((r) =>
      r.status === "success" ? (r.result as `0x${string}`) : undefined,
    )
    .filter((a): a is `0x${string}` => !!a);

  const { data: agentResults } = useAgentsBatch(addresses);
  const { data: scoreResults } = useScoresBatch(addresses);

  const heroRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLElement>(null);
  const agentsRef = useRef<HTMLElement>(null);

  useGsapEntranceStagger(heroRef);
  useGsapStagger(statsRef);
  useGsapScroll(searchRef);
  useGsapStagger(agentsRef, "> h2, > div > *");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Hero */}
      <section
        ref={heroRef}
        className="mb-10 text-center sm:mb-16 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center"
      >
        <h1
          className={`mb-4 text-3xl font-heading tracking-tight leading-[1.3] text-foreground sm:text-5xl md:text-6xl lg:text-8xl --font-boldonse uppercase font-extrabold`}
        >
          Agent Reputation System
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
          Onchain reputation tracking for AI agents with Filecoin verified proof
          of history
        </p>
        <ConnectYourAgent />
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/register">
            <Button
              size="lg"
              className="btn-primary h-11 px-6 text-base font-semibold"
            >
              Register Agent
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button variant="outline" size="lg" className="h-11 px-6 text-base">
              Explore Agents
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="mb-12 grid gap-4 sm:grid-cols-3">
        {countLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard title="Total Agents" value={count} icon={Bot} />
            <StatCard title="Network" value="Base Sepolia" icon={Hexagon} />
            <StatCard
              title="Leaderboard"
              value={count > 0 ? "Live" : "No Agents"}
              icon={Crown}
            />
          </>
        )}
      </section>

      {/* Search */}
      <section ref={searchRef} className="mb-12 flex justify-center">
        <SearchBar />
      </section>

      {/* Recent Agents */}
      <section ref={agentsRef}>
        <h2 className="mb-4 text-xl font-semibold">Registered Agents</h2>
        <div className="space-y-3">
          {countLoading || !agentResults || !scoreResults ? (
            Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
          ) : count === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No agents registered yet. Be the first!
            </p>
          ) : (
            addresses.map((addr, i) => {
              const agent = agentResults[i];
              const score = scoreResults[i];
              if (agent?.status !== "success" || score?.status !== "success")
                return null;

              const agentData = agent.result as {
                owner: `0x${string}`;
                identityCID: string;
                currentStateCID: string;
                registeredAt: bigint;
                lastUpdated: bigint;
                isActive: boolean;
              };

              return (
                <AgentCard
                  key={addr}
                  address={addr}
                  score={Number(score.result)}
                  isActive={agentData.isActive}
                  registeredAt={agentData.registeredAt}
                />
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

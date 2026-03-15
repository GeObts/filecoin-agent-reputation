"use client";

import { use, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AddressDisplay } from "@/components/agent/address-display";
import { CidDisplay } from "@/components/agent/cid-display";
import { VerificationBadge } from "@/components/agent/verification-badge";
import { ActionTimeline } from "@/components/agent/action-timeline";
import { ScoreRing } from "@/components/reputation/score-ring";
import { ScoreBreakdownChart } from "@/components/reputation/score-breakdown-chart";
import { ProfileSkeleton } from "@/components/ui/loading-skeleton";
import { useAgentProfile } from "@/hooks/useAgentProfile";
import { useFilecoinHistory } from "@/hooks/useFilecoinData";
import { formatTimestamp, getScoreColor } from "@/lib/utils";
import type { Action } from "@/lib/types";
import { useGsapEntranceStagger, useGsapStagger, useGsapScroll } from "@/hooks/useGsap";

export default function AgentProfilePage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = use(params);
  const agentAddress = address as `0x${string}`;
  const { profile, isLoading, isError } = useAgentProfile(agentAddress);

  const historyCID = profile?.reputation.historyCID;
  const historyQuery = useFilecoinHistory(historyCID);
  const historyData = historyQuery.data?.history as { actions?: Action[] } | undefined;
  const actions = historyData?.actions ?? [];
  const actionsLoading = historyQuery.isLoading && !!historyCID;

  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  useGsapEntranceStagger(headerRef);
  useGsapStagger(cardsRef);
  useGsapScroll(historyRef);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <ProfileSkeleton />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <h2 className="text-xl font-semibold mb-2">Agent Not Found</h2>
        <p className="text-muted-foreground">
          No data found for address {address}
        </p>
      </div>
    );
  }

  const { identity, reputation, breakdown } = profile;
  const score = Number(reputation.totalScore);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <div ref={headerRef} className="mb-8 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <ScoreRing score={score} />
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-heading tracking-tight text-foreground sm:text-3xl">Agent Profile</h1>
            <VerificationBadge isActive={identity.isActive} hasProof={profile.hasProof} />
          </div>
          <AddressDisplay address={agentAddress} truncate={false} />
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>Owner: {identity.owner.slice(0, 10)}...</span>
            <span>Registered: {formatTimestamp(identity.registeredAt)}</span>
            <span>Updated: {formatTimestamp(identity.lastUpdated)}</span>
          </div>
          <Badge variant={identity.isActive ? "default" : "secondary"} className="mt-2">
            {identity.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      <div ref={cardsRef} className="grid gap-4 md:gap-6 md:grid-cols-2">
        {/* Score Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreBreakdownChart
              codeContributions={Number(breakdown.codeContributions)}
              blockchainActivity={Number(breakdown.blockchainActivity)}
              agentInteractions={Number(breakdown.agentInteractions)}
              uptime={Number(breakdown.uptime)}
            />
            <Separator className="my-4" />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Code</span>
                <span className={getScoreColor(Number(breakdown.codeContributions))}>
                  {Number(breakdown.codeContributions)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Blockchain</span>
                <span className={getScoreColor(Number(breakdown.blockchainActivity))}>
                  {Number(breakdown.blockchainActivity)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interactions</span>
                <span className={getScoreColor(Number(breakdown.agentInteractions))}>
                  {Number(breakdown.agentInteractions)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Uptime</span>
                <span className={getScoreColor(Number(breakdown.uptime))}>
                  {Number(breakdown.uptime)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filecoin CIDs */}
        <Card>
          <CardHeader>
            <CardTitle>Filecoin Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Identity CID</p>
              <CidDisplay cid={identity.identityCID} />
            </div>
            <div>
              <p className="text-sm font-medium mb-1">State CID</p>
              <CidDisplay cid={identity.currentStateCID} />
            </div>
            <div>
              <p className="text-sm font-medium mb-1">History CID</p>
              <CidDisplay cid={reputation.historyCID} />
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Proof CID</p>
              <CidDisplay cid={reputation.proofOfHistoryCID} />
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Actions</span>
              <span className="font-medium">{Number(reputation.actionCount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last Calculated</span>
              <span className="font-medium">{formatTimestamp(reputation.lastCalculated)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action History */}
      <div ref={historyRef}>
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Action History</CardTitle>
            {historyQuery.isError && reputation.historyCID && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => historyQuery.refetch()}
                disabled={actionsLoading}
              >
                Retry
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {actionsLoading ? (
              <p className="text-sm text-muted-foreground">Loading action history from Filecoin...</p>
            ) : (
              <ActionTimeline actions={actions} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Search, ShieldCheck, ShieldX, Activity } from "lucide-react";
import { useAgentProfile } from "@/hooks/useAgentProfile";
import { useProofHash, useVerifyProofHash } from "@/hooks/useReputationOracle";
import { useFilecoinIdentity, useFilecoinHistory } from "@/hooks/useFilecoinData";
import { isValidAddress, truncateCid } from "@/lib/utils";
import { toast } from "sonner";
import { useGsapEntrance, useGsapStagger } from "@/hooks/useGsap";

interface ApiReputation {
  success: boolean;
  agentAddress: string;
  actions: { timestamp: string; type: string; score: number; platform?: string }[];
  reputation: {
    totalScore: number;
    breakdown: Record<string, number>;
    actionCount: number;
  };
  proof: {
    root: string;
    leaves: string[];
    actionCount: number;
  };
}

export default function VerifyPage() {
  const [address, setAddress] = useState("");
  const [searchAddress, setSearchAddress] = useState<`0x${string}` | undefined>();
  const { profile, isLoading } = useAgentProfile(searchAddress);

  const [loadFilecoin, setLoadFilecoin] = useState(false);

  // API-based reputation lookup (fallback when not on-chain)
  const [apiData, setApiData] = useState<ApiReputation | null>(null);
  const [apiLoading, setApiLoading] = useState(false);

  const identityQuery = useFilecoinIdentity(profile?.identity.identityCID, { enabled: loadFilecoin });
  const historyQuery = useFilecoinHistory(profile?.reputation.historyCID, { enabled: loadFilecoin });

  // On-chain proof hash verification
  const { data: storedProofHash } = useProofHash(searchAddress);
  const hasStoredProof = storedProofHash && storedProofHash !== "0x0000000000000000000000000000000000000000000000000000000000000000";

  // Verify the proof hash matches (when user provides one)
  const [claimedHash, setClaimedHash] = useState("");
  const claimedBytes32 = claimedHash.startsWith("0x") && claimedHash.length === 66
    ? (claimedHash as `0x${string}`)
    : undefined;
  const { data: proofValid, isLoading: verifyLoading } = useVerifyProofHash(
    searchAddress,
    claimedBytes32
  );

  const filecoinLoading = identityQuery.isLoading || historyQuery.isLoading;
  const filecoinIdentity = identityQuery.data
    ? (identityQuery.data as { identity: Record<string, unknown> }).identity
    : null;
  const filecoinHistory = historyQuery.data
    ? (historyQuery.data as { history: Record<string, unknown> }).history
    : null;

  const headerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useGsapEntrance(headerRef);
  useGsapEntrance(searchRef);
  useGsapStagger(resultsRef);

  const handleSearch = async () => {
    const trimmed = address.trim();
    if (!isValidAddress(trimmed)) {
      toast.error("Please enter a valid Ethereum address");
      return;
    }
    setSearchAddress(trimmed as `0x${string}`);
    setLoadFilecoin(false);
    setApiData(null);

    // Also fetch API-based reputation
    setApiLoading(true);
    try {
      const res = await fetch("/api/reputation/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentAddress: trimmed }),
      });
      if (res.ok) {
        const data = await res.json();
        setApiData(data);
      }
    } catch {
      // Silently fail — on-chain data is primary
    } finally {
      setApiLoading(false);
    }
  };

  const handleLoadFilecoinData = () => {
    setLoadFilecoin(true);
  };

  const hasOnChainData = profile && Number(profile.reputation.totalScore) > 0;
  const hasFilecoinData = filecoinIdentity || filecoinHistory;
  const showResults = profile || apiData;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div ref={headerRef}>
        <h1 className="mb-2 text-2xl font-heading tracking-tight text-foreground sm:text-4xl">Verify Agent</h1>
        <p className="mb-8 text-muted-foreground">
          Compare on-chain reputation data with Filecoin-stored proof of history
        </p>
      </div>

      {/* Search */}
      <div ref={searchRef} className="mb-8 flex gap-2">
        <div className="flex-1">
          <Label htmlFor="verify-address" className="sr-only">Agent Address</Label>
          <Input
            id="verify-address"
            placeholder="Enter agent address (0x...)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="font-mono"
          />
        </div>
        <Button onClick={handleSearch} disabled={isLoading || apiLoading}>
          <Search className="mr-2 h-4 w-4" />
          Verify
        </Button>
      </div>

      {(isLoading || apiLoading) && (
        <p className="text-center text-muted-foreground py-8">Loading agent data...</p>
      )}

      {showResults && (
        <div ref={resultsRef} className="space-y-6">
          {/* On-chain Data */}
          {profile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  On-Chain Data
                  {hasOnChainData ? (
                    <Badge className="bg-emerald-100 text-emerald-700">Found</Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-700">Not Registered</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasOnChainData ? (
                  <div className="space-y-2 text-sm">
                    <Row label="Score" value={Number(profile.reputation.totalScore).toString()} />
                    <Row label="Actions" value={Number(profile.reputation.actionCount).toString()} />
                    <Row label="Active" value={profile.identity.isActive ? "Yes" : "No"} />
                    <Row label="Has Proof" value={profile.hasProof ? "Yes" : "No"} />
                    <Row label="Identity CID" value={truncateCid(profile.identity.identityCID)} />
                    <Row label="History CID" value={truncateCid(profile.reputation.historyCID)} />
                    <Row label="Proof CID" value={truncateCid(profile.reputation.proofOfHistoryCID)} />
                    <Row label="Proof Hash" value={hasStoredProof ? `${storedProofHash.slice(0, 10)}...${storedProofHash.slice(-8)}` : "None"} />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    This agent is not registered on-chain yet. Use the Register page to submit an on-chain registration, or see the API reputation below.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* API-Computed Reputation (always shown as fallback) */}
          {apiData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Computed Reputation
                  <Badge className="bg-blue-100 text-blue-700">API</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <Row label="Total Score" value={apiData.reputation.totalScore.toString()} />
                  <Row label="Actions Tracked" value={apiData.reputation.actionCount.toString()} />
                  <Row label="Merkle Root" value={`${apiData.proof.root.slice(0, 12)}...${apiData.proof.root.slice(-8)}`} />
                  {Object.entries(apiData.reputation.breakdown).map(([key, val]) =>
                    val > 0 ? (
                      <Row key={key} label={key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())} value={val.toString()} />
                    ) : null
                  )}
                </div>
                {!hasOnChainData && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    This reputation was computed from blockchain activity. Register the agent on-chain to anchor it permanently.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Merkle Root Verification */}
          {hasStoredProof && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  Verify Merkle Root
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  This agent has an on-chain proof hash. Enter a Merkle root to verify it matches.
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter proof hash (0x...)"
                    value={claimedHash}
                    onChange={(e) => setClaimedHash(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
                {claimedBytes32 && (
                  <div className="mt-3 flex items-center gap-2">
                    {verifyLoading ? (
                      <span className="text-sm text-muted-foreground">Verifying on-chain...</span>
                    ) : proofValid ? (
                      <div className="flex items-center gap-2 text-emerald-600">
                        <ShieldCheck className="h-5 w-5" />
                        <span className="text-sm font-semibold">Merkle root verified on-chain</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600">
                        <ShieldX className="h-5 w-5" />
                        <span className="text-sm font-semibold">Proof hash does not match</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Load Filecoin Button */}
          {profile && !hasFilecoinData && hasOnChainData && (
            <div className="text-center">
              <Button onClick={handleLoadFilecoinData} disabled={filecoinLoading || loadFilecoin} variant="outline">
                {filecoinLoading ? "Loading Filecoin data..." : "Load Filecoin Data for Comparison"}
              </Button>
            </div>
          )}

          {/* Filecoin Data */}
          {hasFilecoinData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Filecoin Data
                  <Badge className="bg-indigo-100 text-indigo-700">Loaded</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filecoinIdentity && (
                  <div className="space-y-2 text-sm">
                    <p className="font-medium mb-2">Identity</p>
                    <pre className="overflow-x-auto rounded-none bg-muted p-3 text-xs">
                      {JSON.stringify(filecoinIdentity, null, 2)}
                    </pre>
                  </div>
                )}
                {filecoinHistory && (
                  <div className="mt-4 space-y-2 text-sm">
                    <p className="font-medium mb-2">History</p>
                    <pre className="overflow-x-auto rounded-none bg-muted p-3 text-xs max-h-64">
                      {JSON.stringify(filecoinHistory, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Verification Status */}
          {hasFilecoinData && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  {profile?.hasProof ? (
                    <>
                      <CheckCircle className="h-8 w-8 text-emerald-600" />
                      <div>
                        <p className="font-semibold text-emerald-600">Verification Passed</p>
                        <p className="text-sm text-muted-foreground">
                          On-chain data has corresponding Filecoin proof of history.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-8 w-8 text-amber-600" />
                      <div>
                        <p className="font-semibold text-amber-600">No Proof Available</p>
                        <p className="text-sm text-muted-foreground">
                          On-chain data exists but no proof of history CID is set.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {searchAddress && !isLoading && !apiLoading && !showResults && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No agent found at this address.</p>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{value || "-"}</span>
    </div>
  );
}

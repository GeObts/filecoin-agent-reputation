"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Search } from "lucide-react";
import { useAgentProfile } from "@/hooks/useAgentProfile";
import { getIdentity, getHistory } from "@/lib/api";
import { isValidAddress, truncateCid } from "@/lib/utils";
import { toast } from "sonner";
import { useGsapEntrance, useGsapStagger } from "@/hooks/useGsap";

interface FilecoinData {
  identity: Record<string, unknown> | null;
  history: Record<string, unknown> | null;
}

export default function VerifyPage() {
  const [address, setAddress] = useState("");
  const [searchAddress, setSearchAddress] = useState<`0x${string}` | undefined>();
  const { profile, isLoading } = useAgentProfile(searchAddress);

  const [filecoinData, setFilecoinData] = useState<FilecoinData>({ identity: null, history: null });
  const [filecoinLoading, setFilecoinLoading] = useState(false);

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
    setFilecoinData({ identity: null, history: null });
  };

  const loadFilecoinData = async () => {
    if (!profile) return;
    setFilecoinLoading(true);
    try {
      const [identityResult, historyResult] = await Promise.allSettled([
        profile.identity.identityCID
          ? getIdentity(profile.identity.identityCID)
          : Promise.resolve(null),
        profile.reputation.historyCID
          ? getHistory(profile.reputation.historyCID)
          : Promise.resolve(null),
      ]);

      setFilecoinData({
        identity: identityResult.status === "fulfilled" && identityResult.value
          ? (identityResult.value as { identity: Record<string, unknown> }).identity
          : null,
        history: historyResult.status === "fulfilled" && historyResult.value
          ? (historyResult.value as { history: Record<string, unknown> }).history
          : null,
      });
    } catch {
      toast.error("Failed to load Filecoin data");
    } finally {
      setFilecoinLoading(false);
    }
  };

  const hasOnChainData = profile && Number(profile.reputation.totalScore) > 0;
  const hasFilecoinData = filecoinData.identity || filecoinData.history;

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
        <Button onClick={handleSearch} disabled={isLoading}>
          <Search className="mr-2 h-4 w-4" />
          Verify
        </Button>
      </div>

      {isLoading && (
        <p className="text-center text-muted-foreground py-8">Loading on-chain data...</p>
      )}

      {profile && (
        <div ref={resultsRef} className="space-y-6">
          {/* On-chain Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                On-Chain Data
                {hasOnChainData ? (
                  <Badge className="bg-emerald-100 text-emerald-700">Found</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-700">Empty</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <Row label="Score" value={Number(profile.reputation.totalScore).toString()} />
                <Row label="Actions" value={Number(profile.reputation.actionCount).toString()} />
                <Row label="Active" value={profile.identity.isActive ? "Yes" : "No"} />
                <Row label="Has Proof" value={profile.hasProof ? "Yes" : "No"} />
                <Row label="Identity CID" value={truncateCid(profile.identity.identityCID)} />
                <Row label="History CID" value={truncateCid(profile.reputation.historyCID)} />
                <Row label="Proof CID" value={truncateCid(profile.reputation.proofOfHistoryCID)} />
              </div>
            </CardContent>
          </Card>

          {/* Load Filecoin Button */}
          {!hasFilecoinData && (
            <div className="text-center">
              <Button onClick={loadFilecoinData} disabled={filecoinLoading} variant="outline">
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
                {filecoinData.identity && (
                  <div className="space-y-2 text-sm">
                    <p className="font-medium mb-2">Identity</p>
                    <pre className="overflow-x-auto rounded-none bg-muted p-3 text-xs">
                      {JSON.stringify(filecoinData.identity, null, 2)}
                    </pre>
                  </div>
                )}
                {filecoinData.history && (
                  <div className="mt-4 space-y-2 text-sm">
                    <p className="font-medium mb-2">History</p>
                    <pre className="overflow-x-auto rounded-none bg-muted p-3 text-xs max-h-64">
                      {JSON.stringify(filecoinData.history, null, 2)}
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
                  {profile.hasProof ? (
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

      {searchAddress && !isLoading && !profile && (
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

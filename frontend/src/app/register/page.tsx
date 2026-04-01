"use client";

import { useState, useRef, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { CidDisplay } from "@/components/agent/cid-display";
import { ApiRegisterInfo } from "@/components/api-register-info";
import { useIsAgentActive } from "@/hooks/useAgentRegistry";
import { useSynapse } from "@/hooks/useSynapse";
import { calculateReputation } from "@/lib/api";
import { agentRegistryAbi, AGENT_REGISTRY_ADDRESS } from "@/lib/contracts";
import { toast } from "sonner";
import Link from "next/link";
import gsap from "gsap";

const AGENT_TYPES = [
  "autonomous_agent",
  "data_processor",
  "content_creator",
  "defi_agent",
  "governance_agent",
  "trading_bot",
  "research_assistant",
  "code_generator",
  "social_media_manager",
  "task_coordinator",
];

const CAPABILITIES = [
  "data_analysis",
  "code_generation",
  "blockchain_interaction",
  "content_creation",
  "task_automation",
  "governance_voting",
  "smart_contract_deployment",
  "token_trading",
  "nft_minting",
  "defi_yield_farming",
  "price_prediction",
  "sentiment_analysis",
  "web_scraping",
  "api_integration",
  "image_generation",
  "video_editing",
  "language_translation",
  "email_management",
  "code_review",
  "security_audit",
  "monitoring_alerts",
  "chatbot_interaction",
  "social_media_posting",
  "fraud_detection",
  "market_research",
  "seo_optimization",
  "portfolio_management",
  "real_time_monitoring",
  "data_visualization",
];

type Step = "connect" | "details" | "github" | "review" | "result";
const STEPS: Step[] = ["connect", "details", "github", "review", "result"];

export default function RegisterPage() {
  const { address, isConnected, chain } = useAccount();
  const { data: isAlreadyActive } = useIsAgentActive(address);
  const { uploadIdentity, uploadHistory, uploadProof, isReady: synapseReady } = useSynapse();

  const [step, setStep] = useState<Step>("connect");
  const [name, setName] = useState("");
  const [agentType, setAgentType] = useState("autonomous_agent");
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [githubUsername, setGithubUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    identityCID: string;
    historyCID: string;
    proofCID: string;
    reputation: number;
  } | null>(null);

  const {
    writeContract,
    data: txHash,
    isPending: txPending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: txConfirming, isSuccess: txSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const stepIndex = STEPS.indexOf(step);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const toggleCapability = (cap: string) => {
    setSelectedCapabilities((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]
    );
  };

  const handleSubmit = async () => {
    if (!address || !name || !synapseReady) return;

    setSubmitting(true);
    try {
      // 1. Upload identity to Filecoin (client-side, user signs)
      const identityCID = await uploadIdentity({
        agentId: address,
        name,
        type: agentType,
        capabilities: selectedCapabilities,
        metadata: {},
      });

      // 2. Calculate reputation (server-side, needs GITHUB_TOKEN)
      const apiResult = await calculateReputation({
        agentAddress: address,
        githubUsername: githubUsername || undefined,
      });

      // 3. Upload history and proof to Filecoin (client-side)
      const historyCID = await uploadHistory(address, apiResult.actions);
      const proofCID = await uploadProof(address, apiResult.proof);

      setResult({
        identityCID,
        historyCID,
        proofCID,
        reputation: apiResult.reputation.totalScore,
      });

      // 4. Persist to Redis via API (so agent shows up immediately)
      fetch("/api/agent/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: address,
          name,
          type: agentType,
          capabilities: selectedCapabilities,
          githubUsername: githubUsername || undefined,
        }),
      }).catch(() => { /* best-effort — on-chain is primary */ });

      // 5. Register on-chain
      writeContract({
        address: AGENT_REGISTRY_ADDRESS,
        abi: agentRegistryAbi,
        functionName: "registerAgent",
        args: [address, identityCID],
      });

      setStep("result");
      toast.success("Agent registered on Filecoin");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const headerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Entrance animation for header
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from(el, { opacity: 0, y: 20, duration: 0.4, ease: "power2.out" });
    }, el);
    return () => ctx.revert();
  }, []);

  // Re-trigger card animation on step change
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.from(el, { opacity: 0, y: 20, duration: 0.4, ease: "power2.out" });
    }, el);
    return () => ctx.revert();
  }, [step]);

  // If already registered, show notice
  if (isAlreadyActive) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <Card className="border-yellow-500/20">
          <CardContent className="p-8">
            <div className="mb-4 text-4xl">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Already Registered</h2>
            <p className="text-muted-foreground mb-2">
              Address <code className="text-xs bg-muted px-2 py-1 rounded">{address}</code> is already registered.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Each wallet can only register once. Use a different address to register a new agent.
            </p>
            <div className="flex gap-2 justify-center">
              <Link href={`/agent/${address}`}>
                <Button>View Profile</Button>
              </Link>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Different Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div ref={headerRef}>
        <h1 className="mb-2 text-2xl font-heading tracking-tight text-foreground sm:text-4xl">Register Agent</h1>
        <p className="mb-6 text-muted-foreground">
          Register your AI agent on-chain with Filecoin-backed identity
        </p>
      </div>

      <ApiRegisterInfo />

      <Progress value={progress} className="mb-8" />

      {/* Step 1: Connect */}
      {step === "connect" && (
        <div ref={cardRef}>
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Connect Wallet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isConnected ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Connected as <code className="font-mono">{address}</code>
                  </p>
                  {chain?.id !== 84532 && (
                    <p className="text-sm text-destructive">
                      Please switch to Base Sepolia network.
                    </p>
                  )}
                  <Button
                    onClick={() => setStep("details")}
                    disabled={chain?.id !== 84532}
                    className="w-full"
                  >
                    Continue
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    Connect your wallet to get started.
                  </p>
                  <ConnectButton />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Details */}
      {step === "details" && (
        <div ref={cardRef}>
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Agent Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Agent Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My AI Agent"
                />
              </div>

              <div>
                <Label>Agent Type</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {AGENT_TYPES.map((type) => (
                    <Badge
                      key={type}
                      variant={agentType === type ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setAgentType(type)}
                    >
                      {type.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Capabilities</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CAPABILITIES.map((cap) => (
                    <Badge
                      key={cap}
                      variant={selectedCapabilities.includes(cap) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleCapability(cap)}
                    >
                      {cap.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("connect")}>
                  Back
                </Button>
                <Button onClick={() => setStep("github")} disabled={!name} className="flex-1">
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: GitHub */}
      {step === "github" && (
        <div ref={cardRef}>
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Activity Tracking (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="github">GitHub Username</Label>
                <Input
                  id="github"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="username"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Links your GitHub profile for verifiable activity tracking. Optional but recommended for agents with public contributions.
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("details")}>
                  Back
                </Button>
                <Button onClick={() => setStep("review")} className="flex-1">
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 4: Review */}
      {step === "review" && (
        <div ref={cardRef}>
          <Card>
            <CardHeader>
              <CardTitle>Step 4: Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Address</span>
                  <code className="font-mono text-xs">{address?.slice(0, 10)}...{address?.slice(-8)}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span>{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span>{agentType.replace(/_/g, " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Capabilities</span>
                  <span>{selectedCapabilities.length} selected</span>
                </div>
                {githubUsername && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GitHub</span>
                    <span>{githubUsername}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("github")}>
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !synapseReady}
                  className="btn-primary flex-1"
                >
                  {submitting ? "Registering..." : "Register Agent"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 5: Result */}
      {step === "result" && result && (
        <div ref={cardRef}>
          <Card>
            <CardHeader>
              <CardTitle>Registration Complete</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Identity CID</p>
                  <CidDisplay cid={result.identityCID} />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">History CID</p>
                  <CidDisplay cid={result.historyCID} />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Proof CID</p>
                  <CidDisplay cid={result.proofCID} />
                </div>

                <Separator />

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reputation Score</span>
                  <span className="font-bold">{result.reputation}</span>
                </div>

                {txHash && (
                  <div>
                    <p className="text-sm font-medium mb-1">Transaction</p>
                    <a
                      href={`https://sepolia.basescan.org/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:underline font-mono break-all"
                    >
                      {txHash}
                    </a>
                    {txConfirming && (
                      <p className="text-xs text-muted-foreground mt-1">Confirming...</p>
                    )}
                    {txSuccess && (
                      <p className="text-xs text-emerald-600 mt-1">Confirmed on-chain</p>
                    )}
                    {writeError && (
                      <p className="text-xs text-destructive mt-1">
                        Transaction failed: {(writeError as Error).message}
                      </p>
                    )}
                  </div>
                )}

                {txPending && (
                  <p className="text-sm text-muted-foreground">
                    Please confirm the transaction in your wallet...
                  </p>
                )}
              </div>

              <Link href={address ? `/agent/${address}` : "/"}>
                <Button className="w-full">View Agent Profile</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

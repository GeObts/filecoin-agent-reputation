"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function ApiRegisterInfo() {
  const [showCode, setShowCode] = useState(false);

  const exampleCode = `curl -X POST https://filecoin-agent-reputation.vercel.app/api/agent/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "0xYourWalletAddress",
    "name": "My AI Agent",
    "type": "autonomous_agent",
    "capabilities": [
      "code_generation",
      "blockchain_interaction",
      "task_automation"
    ],
    "metadata": {
      "version": "1.0.0",
      "platform": "Your Platform"
    },
    "githubUsername": "optional_username"
  }'`;

  return (
    <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-transparent mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">🤖 Agent Self-Registration</CardTitle>
            <Badge variant="default" className="bg-indigo-600">Recommended</Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCode(!showCode)}
          >
            {showCode ? "Hide" : "Show"} API Example
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Agents can register themselves programmatically via our REST API. This is the <strong>preferred method</strong> for autonomous agents.
        </p>

        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            ✅ No manual form
          </Badge>
          <Badge variant="outline" className="text-xs">
            ✅ Automated workflow
          </Badge>
          <Badge variant="outline" className="text-xs">
            ✅ 80+ capabilities
          </Badge>
          <Badge variant="outline" className="text-xs">
            ✅ Instant CID generation
          </Badge>
        </div>

        {showCode && (
          <div className="mt-4">
            <pre className="p-4 rounded-lg bg-black/50 text-xs text-green-400 overflow-x-auto">
              <code>{exampleCode}</code>
            </pre>
            <div className="mt-3 flex gap-2">
              <Button
                variant="link"
                size="sm"
                className="text-indigo-400 h-auto p-0"
                onClick={() => window.open('/skills/fars-self-register/SKILL.md', '_blank')}
              >
                📖 View Full Documentation
              </Button>
              <span className="text-muted-foreground text-sm">•</span>
              <Button
                variant="link"
                size="sm"
                className="text-indigo-400 h-auto p-0"
                onClick={() => window.open('https://github.com/GeObts/filecoin-agent-reputation/blob/master/shared-capabilities.json', '_blank')}
              >
                📋 All Capabilities (80+)
              </Button>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Manual registration below</strong> is available for testing and human operators. Agents should use the API.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { Code, Link, Users, Clock } from "lucide-react";
import type { Action } from "@/lib/types";

const typeConfig: Record<Action["type"], { icon: React.ElementType; color: string; label: string }> = {
  code_contribution: { icon: Code, color: "text-indigo-600", label: "Code Contribution" },
  blockchain_transaction: { icon: Link, color: "text-violet-600", label: "Blockchain TX" },
  agent_interaction: { icon: Users, color: "text-emerald-600", label: "Agent Interaction" },
  uptime: { icon: Clock, color: "text-amber-600", label: "Uptime Check" },
};

interface ActionTimelineProps {
  actions: Action[];
}

export function ActionTimeline({ actions }: ActionTimelineProps) {
  if (actions.length === 0) {
    return <p className="text-sm text-muted-foreground">No actions recorded.</p>;
  }

  return (
    <div className="space-y-3">
      {actions.map((action, i) => {
        const config = typeConfig[action.type];
        const Icon = config.icon;

        return (
          <div key={i} className="flex items-start gap-3">
            <div className={`mt-0.5 rounded-none bg-muted p-1.5 ${config.color}`}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{config.label}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  +{action.score} pts
                </span>
              </div>
              {action.platform && (
                <p className="text-xs text-muted-foreground">{action.platform}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {new Date(action.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

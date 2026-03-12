import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddressDisplay } from "./address-display";
import { getScoreColor, getScoreCategory, formatTimestamp } from "@/lib/utils";

interface AgentCardProps {
  address: `0x${string}`;
  score: number;
  isActive: boolean;
  registeredAt: bigint;
}

export function AgentCard({ address, score, isActive, registeredAt }: AgentCardProps) {
  const scoreColor = getScoreColor(score);
  const category = getScoreCategory(score);

  return (
    <Link href={`/agent/${address}`}>
      <Card className="card-hover cursor-pointer">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <AddressDisplay address={address} />
            <span className="text-xs text-muted-foreground">
              Registered {formatTimestamp(registeredAt)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
            <div className="text-right">
              <span className={`text-lg font-bold ${scoreColor}`}>{score}</span>
              <p className="text-xs text-muted-foreground">{category}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

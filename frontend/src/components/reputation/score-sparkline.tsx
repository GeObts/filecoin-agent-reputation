interface ScoreSparklineProps {
  codeContributions: number;
  blockchainActivity: number;
  agentInteractions: number;
  uptime: number;
}

const colors = [
  "bg-indigo-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
];

export function ScoreSparkline({
  codeContributions,
  blockchainActivity,
  agentInteractions,
  uptime,
}: ScoreSparklineProps) {
  const segments = [codeContributions, blockchainActivity, agentInteractions, uptime];
  const total = segments.reduce((a, b) => a + b, 0);

  if (total === 0) {
    return <div className="h-2 w-24 rounded-sm bg-muted" />;
  }

  return (
    <div className="flex h-2 w-24 overflow-hidden rounded-sm bg-muted">
      {segments.map((val, i) => {
        const pct = (val / total) * 100;
        if (pct === 0) return null;
        return (
          <div
            key={i}
            className={colors[i]}
            style={{ width: `${pct}%` }}
          />
        );
      })}
    </div>
  );
}

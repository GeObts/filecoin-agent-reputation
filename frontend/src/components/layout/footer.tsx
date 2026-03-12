const BASESCAN_URL = "https://sepolia.basescan.org/address";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">FARS</span>{" "}
            &mdash; Filecoin Agent Reputation System
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <a
              href={`${BASESCAN_URL}/${process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Registry
            </a>
            <a
              href={`${BASESCAN_URL}/${process.env.NEXT_PUBLIC_REPUTATION_ORACLE_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Oracle
            </a>
            <span>Base Sepolia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

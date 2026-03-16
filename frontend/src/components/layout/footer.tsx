const REGISTRY_ADDRESS = "0x644337Ca322C90098b5F3657Bde2b661e28d9e0E";
const ORACLE_ADDRESS = "0xb7FaEDd691a1d9e02A348a09456F6D3E39355FF1";
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
              href={`${BASESCAN_URL}/${REGISTRY_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Registry
            </a>
            <a
              href={`${BASESCAN_URL}/${ORACLE_ADDRESS}`}
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

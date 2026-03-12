"use client";

import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { truncateAddress } from "@/lib/utils";
import { toast } from "sonner";

interface AddressDisplayProps {
  address: string;
  truncate?: boolean;
}

export function AddressDisplay({ address, truncate = true }: AddressDisplayProps) {
  if (!address) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied to clipboard");
  };

  const baseScanUrl = `https://sepolia.basescan.org/address/${address}`;

  return (
    <div className="flex items-center gap-1.5">
      <code className="text-sm font-mono">
        {truncate ? truncateAddress(address) : address}
      </code>
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
        <Copy className="h-3 w-3" />
        <span className="sr-only">Copy address</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => window.open(baseScanUrl, "_blank", "noopener,noreferrer")}
      >
        <ExternalLink className="h-3 w-3" />
        <span className="sr-only">View on BaseScan</span>
      </Button>
    </div>
  );
}

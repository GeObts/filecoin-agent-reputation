"use client";

import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { truncateCid, cidToGatewayUrl } from "@/lib/utils";
import { toast } from "sonner";

interface CidDisplayProps {
  cid: string;
  label?: string;
}

export function CidDisplay({ cid, label }: CidDisplayProps) {
  if (!cid) {
    return (
      <span className="text-sm text-muted-foreground">No CID</span>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(cid);
    toast.success("CID copied to clipboard");
  };

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-muted-foreground">{label}:</span>}
      <code className="rounded-none bg-muted px-2 py-0.5 text-xs font-mono">
        {truncateCid(cid)}
      </code>
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
        <Copy className="h-3 w-3" />
        <span className="sr-only">Copy CID</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => window.open(cidToGatewayUrl(cid), "_blank", "noopener,noreferrer")}
      >
        <ExternalLink className="h-3 w-3" />
        <span className="sr-only">View on IPFS</span>
      </Button>
    </div>
  );
}

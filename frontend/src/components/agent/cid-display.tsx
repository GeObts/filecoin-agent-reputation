"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { truncateCid } from "@/lib/utils";
import { toast } from "sonner";

interface CidDisplayProps {
  cid: string;
  label?: string;
}

export function CidDisplay({ cid, label }: CidDisplayProps) {
  const [copied, setCopied] = useState(false);

  if (!cid) {
    return (
      <span className="text-sm text-muted-foreground">No CID</span>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(cid);
    setCopied(true);
    toast.success("CID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-muted-foreground">{label}:</span>}
      <code className="rounded-none bg-muted px-2 py-0.5 text-xs font-mono" title={cid}>
        {truncateCid(cid)}
      </code>
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
        {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
        <span className="sr-only">Copy CID</span>
      </Button>
    </div>
  );
}

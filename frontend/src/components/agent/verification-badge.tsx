import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

interface VerificationBadgeProps {
  isActive: boolean;
  hasProof: boolean;
}

export function VerificationBadge({ isActive, hasProof }: VerificationBadgeProps) {
  if (isActive && hasProof) {
    return (
      <Badge className="gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
        <ShieldCheck className="h-3 w-3" />
        Verified
      </Badge>
    );
  }

  if (isActive && !hasProof) {
    return (
      <Badge className="gap-1 bg-amber-100 text-amber-700 hover:bg-amber-200">
        <ShieldAlert className="h-3 w-3" />
        Active (Unverified)
      </Badge>
    );
  }

  return (
    <Badge className="gap-1 bg-red-100 text-red-700 hover:bg-red-200">
      <ShieldX className="h-3 w-3" />
      Inactive
    </Badge>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { isValidAddress } from "@/lib/utils";
import { toast } from "sonner";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    if (!isValidAddress(trimmed)) {
      toast.error("Please enter a valid Ethereum address (0x...)");
      return;
    }

    router.push(`/agent/${trimmed}`);
  };

  return (
    <div className="flex w-full max-w-lg gap-2">
      <Input
        placeholder="Search by agent address (0x...)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        className="font-mono text-sm"
      />
      <Button onClick={handleSearch} size="icon" variant="secondary">
        <Search className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
    </div>
  );
}

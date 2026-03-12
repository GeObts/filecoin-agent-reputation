"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
      <h2 className="text-3xl font-heading tracking-tight">Something went wrong</h2>
      <p className="text-muted-foreground text-center max-w-md">
        {error.message || "An unexpected error occurred."}
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}

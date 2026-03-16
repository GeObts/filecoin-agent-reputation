export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center">
        <h1 className="mb-4 text-3xl font-heading tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-8xl uppercase font-extrabold">
          Agent Reputation System
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
          Onchain reputation tracking for AI agents with Filecoin verified proof of history
        </p>
        <div className="mt-8 flex gap-4">
          <div className="h-11 w-40 bg-muted animate-pulse rounded"></div>
          <div className="h-11 w-40 bg-muted animate-pulse rounded"></div>
        </div>
      </div>
    </div>
  );
}

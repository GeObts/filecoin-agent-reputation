import { ProfileSkeleton } from "@/components/ui/loading-skeleton";

export default function AgentProfileLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <ProfileSkeleton />
    </div>
  );
}

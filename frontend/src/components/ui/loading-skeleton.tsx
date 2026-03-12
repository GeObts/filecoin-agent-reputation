import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function CardSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-16 rounded-none" />
          <Skeleton className="h-8 w-12" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <Skeleton className="h-40 w-40 rounded-none" />
        <div className="space-y-3 flex-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton className="h-4 w-8" />
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-2 w-24" />
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <Skeleton className="h-11 w-11 rounded-none" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-12" />
        </div>
      </CardContent>
    </Card>
  );
}

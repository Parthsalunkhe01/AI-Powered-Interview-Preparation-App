import { Skeleton } from "../../components/ui/skeleton";

const SkeletonCard = () => {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {/* Card skeleton */}
      <div className="rounded-2xl border bg-card p-8 shadow-sm space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-14 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-14 w-full" />
        </div>
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-11 w-36" />
          <Skeleton className="h-11 w-28" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;

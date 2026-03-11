import { Skeleton } from "@/components/ui/skeleton";

export default function RPATracesLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="RPA Traces werden geladen">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

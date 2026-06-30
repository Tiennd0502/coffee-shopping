import { Skeleton } from '@/components/ui/skeleton';

export function ProfileCardSkeleton() {
  return (
    <section className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Left: profile info */}
      <div className="flex flex-col items-center gap-12 rounded-xl bg-surface-container-low p-8 md:flex-row md:items-start md:p-12 lg:col-span-8">
        <div className="relative shrink-0">
          <Skeleton className="size-24 rounded-full md:size-32" />
          <Skeleton className="absolute -bottom-4 -right-4 size-12 rounded-full" />
        </div>
        <div className="min-w-0 flex-1 space-y-4 text-center md:text-left">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <Skeleton className="h-10 w-48 md:w-64" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="mx-auto h-5 w-40 md:mx-0" />
          <div className="mt-8 flex gap-3">
            <Skeleton className="h-9 w-28 rounded-full" />
            <Skeleton className="h-9 w-28 rounded-full" />
          </div>
        </div>
      </div>

      {/* Right: membership card */}
      <div className="flex flex-col justify-between overflow-hidden rounded-xl bg-surface-container-low p-10 lg:col-span-4">
        <div className="space-y-3">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="mt-8 space-y-2">
          <div className="flex items-end justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-16" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      </div>
    </section>
  );
}

export function OrderTableSkeleton() {
  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      <div className="overflow-hidden rounded-xl bg-surface-container-lowest">
        <div className="border-b border-outline-variant px-8 py-4">
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-b border-outline-variant px-8 py-5 last:border-0">
            <div className="grid grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

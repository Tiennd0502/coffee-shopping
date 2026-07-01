import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const SkeletonPage = () => {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center">
        <Skeleton className="mx-auto size-18 rounded-full" />
        <Skeleton className="mx-auto mt-6 h-14 w-72 rounded-xl" />
        <Skeleton className="mx-auto mt-4 h-5 w-80 rounded-md" />
        <Skeleton className="mx-auto mt-3 h-6 w-40 rounded-full" />
      </div>

      {/* Body */}
      <div className="mt-10 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        {/* Left: order items + price summary */}
        <div className="rounded-2xl bg-surface-container-low p-7">
          <Skeleton className="h-3 w-24 rounded-sm" />
          <Skeleton className="mt-2 h-9 w-40 rounded-lg" />
          <div className="mt-7 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-16 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 rounded-md" />
                  <Skeleton className="h-3 w-20 rounded-md" />
                </div>
              </div>
              <div className="space-y-1 text-right">
                <Skeleton className="ml-auto h-5 w-16 rounded-md" />
                <Skeleton className="ml-auto h-3 w-10 rounded-md" />
              </div>
            </div>
          </div>
          <div className="mt-8 space-y-3 border-t border-outline-variant/70 pt-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: address + delivery + button */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-surface-container-low p-6">
            <Skeleton className="h-3 w-28 rounded-sm" />
            <div className="mt-3 flex gap-2">
              <Skeleton className="mt-1 size-4 shrink-0 rounded-sm" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-3 w-48 rounded-md" />
                <Skeleton className="h-3 w-36 rounded-md" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-surface-container-low p-6">
            <Skeleton className="h-3 w-24 rounded-sm" />
            <div className="mt-2 flex items-start gap-4 ml-4">
              <div className="space-y-2">
                <Skeleton className="h-10 w-16 rounded-md" />
                <Skeleton className="h-10 w-16 rounded-md" />
                <Skeleton className="h-3 w-16 rounded-sm" />
              </div>
              <Skeleton className="ml-6 h-24 flex-1 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-11 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonPage;

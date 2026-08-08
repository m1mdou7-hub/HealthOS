import React from 'react';
import { Skeleton, Card } from '@/components/ui/design-system';

export default function PatientWorkspaceSkeleton() {
  return (
    <div className="space-y-6 min-h-screen pb-16 text-start">
      {/* 1. Header Skeleton */}
      <div className="sticky top-0 z-40 glass rounded-none border-0 border-b px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3" style={{ borderBottom: '1px solid var(--velvet-border)' }}>
        <div className="flex items-center gap-3 shrink-0">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <div className="flex flex-col gap-1.5 text-start">
            <div className="flex items-center gap-2">
              <Skeleton className="w-24 h-4 rounded" />
              <Skeleton className="w-12 h-3.5 rounded" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="w-10 h-3 rounded" />
              <Skeleton className="w-8 h-3 rounded" />
              <Skeleton className="w-8 h-3 rounded" />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="w-24 h-6 rounded-full" />
          <Skeleton className="w-20 h-6 rounded-full" />
        </div>
        <div className="flex items-center gap-4 font-mono shrink-0 ms-auto sm:ms-0">
          <Skeleton className="w-28 h-8 rounded" />
          <Skeleton className="w-28 h-8 rounded" />
        </div>
      </div>

      {/* 2. Navigation Tabs Row Skeleton */}
      <Card variant="elevated" hover={false} className="p-2 rounded-2xl">
        <div className="flex gap-1.5 overflow-x-auto">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="w-24 h-8 rounded-lg shrink-0" />
          ))}
        </div>
      </Card>

      {/* 3. Main Dashboard Grid Skeletons (8 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <Card key={idx} variant="gradient" hover={false} className="p-5 rounded-3xl h-36 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <Skeleton className="w-24 h-3 rounded" />
              <Skeleton className="w-8 h-8 rounded-xl" />
            </div>
            <div className="space-y-2 mt-2">
              <Skeleton className="w-32 h-5 rounded" />
              <Skeleton className="w-20 h-3.5 rounded" />
            </div>
          </Card>
        ))}
      </div>

      {/* 4. Timeline Segment Skeleton */}
      <Card variant="elevated" hover={false} className="p-6 rounded-3xl space-y-4">
        <div className="flex justify-between items-center border-b pb-3" style={{ borderColor: 'var(--velvet-border)' }}>
          <Skeleton className="w-48 h-5 rounded" />
          <Skeleton className="w-24 h-4 rounded" />
        </div>
        <div className="relative ps-8 space-y-6 before:absolute before:start-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--velvet-border-strong)]">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="relative space-y-2">
              <span className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full border-2" style={{ background: 'var(--velvet-surface-2)', borderColor: 'var(--velvet-border)' }} />
              <div className="flex gap-2">
                <Skeleton className="w-16 h-3 rounded" />
                <Skeleton className="w-20 h-3 rounded" />
              </div>
              <Card variant="elevated" hover={false} className="p-4 rounded-xl w-full space-y-2">
                <Skeleton className="w-3/4 h-3.5 rounded" />
                <Skeleton className="w-1/2 h-3 rounded" />
              </Card>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

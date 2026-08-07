import React from 'react';

export default function PatientWorkspaceSkeleton() {
  return (
    <div className="space-y-6 min-h-screen pb-16 text-start animate-pulse">
      {/* 1. Header Skeleton */}
      <div className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 shadow-soft shadow-black/25">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800" />
          <div className="flex flex-col gap-1.5 text-start">
            <div className="flex items-center gap-2">
              <div className="w-24 h-4 bg-zinc-800 rounded" />
              <div className="w-12 h-3.5 bg-zinc-900 border border-zinc-850 rounded" />
            </div>
            <div className="flex gap-2">
              <div className="w-10 h-3 bg-zinc-900 rounded" />
              <div className="w-8 h-3 bg-zinc-900 rounded" />
              <div className="w-8 h-3 bg-zinc-900 rounded" />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-24 h-6 bg-zinc-900/50 rounded border border-zinc-900" />
          <div className="w-20 h-6 bg-zinc-900/50 rounded border border-zinc-900" />
        </div>
        <div className="flex items-center gap-4 text-xs font-mono shrink-0 ms-auto sm:ms-0">
          <div className="w-28 h-8 bg-zinc-900 rounded border-s border-zinc-900 ps-4" />
          <div className="w-28 h-8 bg-zinc-900 rounded border-s border-zinc-900 ps-4" />
        </div>
      </div>

      {/* 2. Navigation Tabs Row Skeleton */}
      <div className="flex border-b border-zinc-900 bg-zinc-950/20 p-2 rounded-xl border border-zinc-900/60 gap-1.5 overflow-x-auto">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="w-24 h-8 bg-zinc-900 rounded-lg shrink-0" />
        ))}
      </div>

      {/* 3. Main Dashboard Grid Skeletons (8 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="p-5 rounded-3xl border border-zinc-900 bg-zinc-900/5 h-36 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div className="w-24 h-3 bg-zinc-900 rounded" />
              <div className="w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-xl" />
            </div>
            <div className="space-y-2 mt-2">
              <div className="w-32 h-5 bg-zinc-800 rounded" />
              <div className="w-20 h-3.5 bg-zinc-900 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* 4. Timeline Segment Skeleton */}
      <div className="p-6 rounded-3xl border border-zinc-900 bg-zinc-900/5 space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
          <div className="w-48 h-5 bg-zinc-800 rounded" />
          <div className="w-24 h-4 bg-zinc-900 rounded" />
        </div>
        <div className="relative ps-8 space-y-6 before:absolute before:start-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-900">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="relative space-y-2">
              <span className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-zinc-900 border-2 border-zinc-950" />
              <div className="flex gap-2">
                <div className="w-16 h-3 bg-zinc-900 rounded" />
                <div className="w-20 h-3 bg-zinc-900 rounded" />
              </div>
              <div className="p-4 rounded-xl border border-zinc-900/50 bg-zinc-950/40 w-full space-y-2">
                <div className="w-3/4 h-3.5 bg-zinc-900 rounded" />
                <div className="w-1/2 h-3 bg-zinc-900/50 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

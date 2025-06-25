
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const TableSkeleton = () => (
  <div className="space-y-3">
    <div className="flex gap-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-28" />
    </div>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex gap-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-28" />
      </div>
    ))}
  </div>
);

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
    <div className="space-y-3">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-32" />
    </div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
    <Skeleton className="h-4 w-32 mb-4" />
    <Skeleton className="h-64 w-full" />
  </div>
);

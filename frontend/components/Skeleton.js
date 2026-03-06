'use client';

export default function Skeleton({ className }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-video w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function NewsDetailSkeleton() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 pt-6 space-y-6">
      <Skeleton className="h-8 w-1/3 mb-4" />
      <Skeleton className="h-10 w-full" />
      <div className="flex gap-4">
         <Skeleton className="h-6 w-24" />
         <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="aspect-video w-full rounded-xl" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

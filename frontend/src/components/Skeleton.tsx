import React from 'react';

const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div className={`animate-pulse bg-white/5 rounded-2xl ${className}`} />
  );
};

export const CardSkeleton = () => (
  <div className="glass-card p-8 rounded-[32px] space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <Skeleton className="w-32 h-6" />
    </div>
    <Skeleton className="w-full h-40" />
    <div className="space-y-2">
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-3/4 h-4" />
    </div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="glass-card p-8 rounded-[32px] space-y-6">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <Skeleton className="w-48 h-8" />
        <Skeleton className="w-32 h-4" />
      </div>
      <Skeleton className="w-64 h-12 rounded-2xl" />
    </div>
    <Skeleton className="w-full h-[350px] rounded-[24px]" />
  </div>
);

export default Skeleton;

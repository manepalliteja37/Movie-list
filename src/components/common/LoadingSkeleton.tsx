import React from 'react';

interface LoadingSkeletonProps {
  count?: number;
}

export const MovieGridSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 10 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 animate-pulse">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-[#14141C] border border-[#242436] overflow-hidden flex flex-col shadow-lg"
        >
          {/* Poster placeholder aspect 2/3 */}
          <div className="aspect-[2/3] w-full bg-[#1C1C2A] relative flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#262638]/60" />
            <div className="absolute top-2 left-2 w-12 h-4 rounded bg-[#262638]" />
            <div className="absolute bottom-2 right-2 w-10 h-4 rounded bg-[#262638]" />
          </div>

          {/* Details placeholder */}
          <div className="p-3.5 space-y-2">
            <div className="h-5 bg-[#262638] rounded-md w-3/4" />
            <div className="h-3.5 bg-[#1F1F30] rounded-md w-1/2" />
            <div className="flex items-center justify-between pt-1">
              <div className="h-3 bg-[#1F1F30] rounded w-1/3" />
              <div className="h-3 bg-[#1F1F30] rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

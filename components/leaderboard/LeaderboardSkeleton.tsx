"use client";

export function LeaderboardSkeleton() {
  return (
    <div>
      <div className="px-4 py-3 bg-[#0d1117] border-b border-[#30363d] flex justify-between items-center">
        <div className="h-6 w-32 bg-[#21262d] rounded animate-pulse"></div>
        <div className="h-4 w-48 bg-[#21262d] rounded animate-pulse"></div>
      </div>

      <div className="divide-y divide-[#21262d]">
        <div className="grid grid-cols-12 px-4 py-3 text-[#8b949e] font-medium">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-3">User</div>
          <div className="col-span-8 text-right pr-4">Percentile</div>
        </div>

        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="grid grid-cols-12 px-4 py-3 items-center">
            <div className="col-span-1 flex justify-center">
              <div className="h-5 w-5 bg-[#21262d] rounded animate-pulse"></div>
            </div>
            <div className="col-span-3 flex items-center gap-2">
              <div className="h-8 w-8 bg-[#21262d] rounded-full animate-pulse"></div>
              <div className="flex flex-col gap-1">
                <div className="h-4 w-20 bg-[#21262d] rounded animate-pulse"></div>
                <div className="h-3 w-16 bg-[#21262d] rounded animate-pulse"></div>
              </div>
            </div>
            <div className="col-span-8 flex justify-end pr-4">
              <div className="h-5 w-16 bg-[#21262d] rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

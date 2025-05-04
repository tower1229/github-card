import { Suspense } from "react";
import { Navbar } from "@/components/auth/navbar";
import { LeaderboardList } from "@/components/leaderboard/LeaderboardList";
import { LeaderboardSkeleton } from "@/components/leaderboard/LeaderboardSkeleton";
import { RefreshButton } from "@/components/leaderboard/RefreshButton";

export const metadata = {
  title: "GitHub 贡献排行榜 | GitHub Card",
  description: "查看GitHub用户贡献排行榜，展示最活跃的开发者",
};

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">GitHub 贡献排行榜</h1>
              <RefreshButton />
            </div>
            <div className="bg-[#161b22] rounded-lg border border-[#30363d] shadow-lg overflow-hidden">
              <Suspense fallback={<LeaderboardSkeleton />}>
                <LeaderboardList />
              </Suspense>
            </div>
            <p className="text-[#8b949e] text-sm mt-4 text-center">
              排行榜数据每小时更新一次，展示贡献最多的前 20 名用户
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

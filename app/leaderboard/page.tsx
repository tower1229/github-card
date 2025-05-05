import { Suspense } from "react";
import { Navbar } from "@/components/auth/navbar";
import { LeaderboardList } from "@/components/leaderboard/LeaderboardList";
import { LeaderboardSkeleton } from "@/components/leaderboard/LeaderboardSkeleton";

export const metadata = {
  title: "Leaderboard | GitHub Card",
  description:
    "View the GitHub user contribution leaderboard, showcasing the most active developers",
};

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <Navbar showLinks={true} />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Contribution Leaderboard</h1>
            </div>
            <div className="bg-[#161b22] rounded-lg border border-[#30363d] shadow-lg overflow-hidden">
              <Suspense fallback={<LeaderboardSkeleton />}>
                <LeaderboardList />
              </Suspense>
            </div>
            <p className="text-[#8b949e] text-sm mt-4 text-center">
              The data is updated every hour, showing the top 20 users with the
              highest contribute scores
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

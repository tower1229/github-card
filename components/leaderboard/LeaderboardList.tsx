import { getFullLeaderboard } from "@/lib/leaderboard";
import { getServerSession } from "next-auth";
import { LeaderboardItem } from "./LeaderboardItem";
import { CurrentUserRank } from "./CurrentUserRank";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function LeaderboardList() {
  // 获取当前用户
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  // 获取排行榜数据
  const { leaderboard, currentUser, totalUsers, lastUpdated } =
    await getFullLeaderboard(20, currentUserId);

  // 格式化最后更新时间
  const formattedLastUpdated = new Date(lastUpdated).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div>
      <div className="px-4 py-3 bg-[#0d1117] border-b border-[#30363d] flex justify-between items-center">
        <div className="text-lg font-semibold">总参与人数: {totalUsers}</div>
        <div className="text-sm text-[#8b949e]">
          更新时间: {formattedLastUpdated}
        </div>
      </div>

      <div className="divide-y divide-[#21262d]">
        <div className="grid grid-cols-12 px-4 py-3 text-[#8b949e] font-medium">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-3">用户</div>
          <div className="col-span-8 text-right pr-4">贡献总数</div>
        </div>

        {leaderboard.length > 0 ? (
          <>
            {leaderboard.map((item) => (
              <LeaderboardItem
                key={item.userId}
                item={item}
                isCurrentUser={item.userId === currentUserId}
              />
            ))}

            {currentUser &&
              !leaderboard.some((item) => item.userId === currentUserId) && (
                <>
                  <div className="py-2 px-4 text-center text-[#8b949e] italic">
                    ・・・
                  </div>
                  <CurrentUserRank currentUser={currentUser} />
                </>
              )}
          </>
        ) : (
          <div className="py-10 text-center text-[#8b949e]">暂无排行榜数据</div>
        )}
      </div>
    </div>
  );
}

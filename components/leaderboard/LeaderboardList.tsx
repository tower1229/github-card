import { getFullLeaderboard } from "@/lib/leaderboard";
import { getServerSession } from "next-auth";
import { LeaderboardItem } from "./LeaderboardItem";
import { CurrentUserRank } from "./CurrentUserRank";
import { authOptions } from "@/lib/auth-options";

export async function LeaderboardList() {
  // 获取当前用户
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  // 获取排行榜数据
  const { leaderboard, currentUser, totalUsers, lastUpdated } =
    await getFullLeaderboard(20, 1, currentUserId);

  // 格式化最后更新时间
  const formattedLastUpdated = new Date(lastUpdated).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  // 处理可能为空的排名、displayName和contributionScore
  const sanitizedLeaderboard = leaderboard.map((item) => ({
    ...item,
    rank: item.rank ?? 0,
    displayName: item.displayName || undefined,
    contributionScore:
      typeof item.contributionScore === "number" ? item.contributionScore : 0,
    contributionGrade: item.contributionGrade || "-",
  }));

  // 处理当前用户的排名、displayName和contributionScore
  const sanitizedCurrentUser = currentUser
    ? {
        ...currentUser,
        rank: currentUser.rank ?? 0,
        displayName: currentUser.displayName || undefined,
        contributionScore:
          typeof currentUser.contributionScore === "number"
            ? currentUser.contributionScore
            : 0,
        contributionGrade: currentUser.contributionGrade || "-",
      }
    : null;

  return (
    <div>
      <div className="px-4 py-3 bg-[#0d1117] border-b border-[#30363d] flex justify-between items-center">
        <div className="text-lg font-semibold">
          Total participants: {totalUsers}
        </div>
        <div className="text-sm text-[#8b949e]">
          Updated at: {formattedLastUpdated}
        </div>
      </div>

      <div className="divide-y divide-[#21262d]">
        <div className="grid grid-cols-12 px-4 py-3 text-[#8b949e] font-medium">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5">User</div>
          <div className="col-span-3 text-right pr-4">Percentile</div>
          <div className="col-span-3 text-right pr-4">Grade</div>
        </div>

        {sanitizedLeaderboard.length > 0 ? (
          <>
            {sanitizedLeaderboard.map((item) => (
              <LeaderboardItem
                key={item.userId}
                item={item}
                isCurrentUser={item.userId === currentUserId}
              />
            ))}

            {sanitizedCurrentUser &&
              !sanitizedLeaderboard.some(
                (item) => item.userId === currentUserId
              ) && (
                <>
                  <div className="py-2 px-4 text-center text-[#8b949e] italic">
                    ・・・
                  </div>
                  <CurrentUserRank currentUser={sanitizedCurrentUser} />
                </>
              )}
          </>
        ) : (
          <div className="py-10 text-center text-[#8b949e]">No data yet</div>
        )}
      </div>
    </div>
  );
}

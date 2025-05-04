"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

type LeaderboardItemProps = {
  item: {
    rank: number;
    userId: string;
    username: string;
    displayName?: string;
    avatarUrl: string;
    contributionScore: number;
  };
  isCurrentUser: boolean;
};

export function LeaderboardItem({ item, isCurrentUser }: LeaderboardItemProps) {
  const [prevRank, setPrevRank] = useState(item.rank);
  const [rankChange, setRankChange] = useState(0);

  // Ensure contributionScore is always treated as a number
  const score =
    typeof item.contributionScore === "number" ? item.contributionScore : 0;

  useEffect(() => {
    if (prevRank !== item.rank) {
      setRankChange(prevRank - item.rank);
      setPrevRank(item.rank);
    }
  }, [item.rank, prevRank]);

  // 判断排名变化
  const getRankChangeIcon = () => {
    if (rankChange > 0) {
      return <span className="text-green-500 text-xs">↑{rankChange}</span>;
    } else if (rankChange < 0) {
      return (
        <span className="text-red-500 text-xs">↓{Math.abs(rankChange)}</span>
      );
    }
    return null;
  };

  // 排名颜色
  const getRankStyle = (rank: number) => {
    if (rank === 1) return "text-yellow-400 font-bold";
    if (rank === 2) return "text-slate-300 font-bold";
    if (rank === 3) return "text-amber-600 font-bold";
    return "text-[#8b949e]";
  };

  return (
    <motion.div
      key={item.userId}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`grid grid-cols-12 px-4 py-3 items-center ${
        isCurrentUser ? "bg-[#1d2431]" : ""
      } hover:bg-[#1d2431] transition-colors`}
    >
      <div className="col-span-1 text-center flex flex-col items-center">
        <span className={getRankStyle(item.rank)}>{item.rank}</span>
        {rankChange !== 0 && getRankChangeIcon()}
      </div>

      <div className="col-span-3 flex items-center gap-2">
        <div className="relative w-8 h-8 rounded-full overflow-hidden">
          <Image
            src={item.avatarUrl}
            alt={item.username}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-medium truncate">{item.username}</span>
          {item.displayName && (
            <span className="text-xs text-[#8b949e] truncate">
              {item.displayName}
            </span>
          )}
        </div>
      </div>

      <div className="col-span-8 text-right pr-4 font-mono font-medium">
        {score.toLocaleString()}
      </div>
    </motion.div>
  );
}

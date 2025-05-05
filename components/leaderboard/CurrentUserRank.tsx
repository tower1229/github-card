"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type CurrentUserRankProps = {
  currentUser: {
    rank: number;
    userId: string;
    username: string;
    displayName?: string;
    avatarUrl: string;
    contributionScore: number;
  };
};

export function CurrentUserRank({ currentUser }: CurrentUserRankProps) {
  // Ensure contributionScore is always treated as a number
  const score =
    typeof currentUser.contributionScore === "number"
      ? currentUser.contributionScore
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      className="grid grid-cols-12 px-4 py-3 items-center bg-[#1d2431] border-t-4 border-blue-500"
    >
      <div className="col-span-1 text-center">
        <span className="text-blue-400 font-bold">{currentUser.rank}</span>
      </div>

      <div className="col-span-3 flex items-center gap-2">
        <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-blue-500">
          <Image
            src={currentUser.avatarUrl}
            alt={currentUser.username}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-medium truncate">{currentUser.username}</span>
          {currentUser.displayName && (
            <span className="text-xs text-[#8b949e] truncate">
              {currentUser.displayName}
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

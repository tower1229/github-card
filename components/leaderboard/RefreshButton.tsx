"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";

export function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      const response = await fetch("/api/leaderboard/refresh", {
        method: "GET",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "刷新失败");
      }

      const result = await response.json();
      if (result.success) {
        toast.success("排行榜数据已更新");
        // 刷新页面以获取最新数据
        window.location.reload();
      } else {
        throw new Error(result.error || "刷新失败");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "刷新失败");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      aria-label="刷新排行榜"
    >
      <RefreshCw
        size={16}
        className={`${isRefreshing ? "animate-spin" : ""}`}
      />
      <span>{isRefreshing ? "刷新中..." : "刷新排行榜"}</span>
    </button>
  );
}

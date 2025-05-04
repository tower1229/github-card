"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";
import { authFetch } from "@/lib/auth";

export function RefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      const response = await authFetch("/api/leaderboard/refresh", {
        method: "GET",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Refresh failed");
      }

      const result = await response.json();
      if (result.success) {
        toast.success("The leaderboard data has been updated");
        // 刷新页面以获取最新数据
        window.location.reload();
      } else {
        throw new Error(result.error || "Refresh failed");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Refresh failed");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      aria-label="Refresh the leaderboard"
    >
      <RefreshCw
        size={16}
        className={`${isRefreshing ? "animate-spin" : ""}`}
      />
      <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
    </button>
  );
}

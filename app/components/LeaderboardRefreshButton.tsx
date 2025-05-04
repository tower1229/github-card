"use client";

import { useState } from "react";
import { FiRefreshCw } from "react-icons/fi";

export function LeaderboardRefreshButton() {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/leaderboard/refresh");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to refresh leaderboard");
      }

      // Refresh page data
      window.location.reload();
    } catch (error) {
      console.error("Error refreshing leaderboard:", error);
      alert("Failed to refresh leaderboard. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={loading}
      className="flex items-center p-2 text-sm text-gray-600 hover:text-blue-600 disabled:opacity-50"
    >
      <FiRefreshCw className={`mr-1 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Refreshing..." : "Refresh"}
    </button>
  );
}

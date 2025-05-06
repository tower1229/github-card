"use client";

import React, { lazy, Suspense, useState, useEffect } from "react";
import { BlurFade } from "./blur-fade";

// Dynamically import the calendar component only on the client side
const GitHubCalendar = lazy(() => import("react-github-calendar"));

interface GitHubCalendarProps {
  username: string;
  year?: string;
}

export function GitHubCalendarWrapper({ username, year }: GitHubCalendarProps) {
  // Track if we're on the client side to avoid hydration issues
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <BlurFade delay={1100}>
      <div className="max-w-2xl mx-auto mt-8 bg-white/10 rounded-lg p-4">
        {!isMounted ? (
          // Show placeholder when server-side rendering or not yet mounted
          <div className="h-[128px] animate-pulse bg-gray-800/50 rounded-lg" />
        ) : (
          <Suspense
            fallback={
              <div className="h-[128px] animate-pulse bg-gray-800/50 rounded-lg" />
            }
          >
            <GitHubCalendar
              username={username}
              colorScheme="dark"
              fontSize={12}
              blockSize={8}
              blockMargin={3}
              year={year ? parseInt(year) : undefined}
            />
          </Suspense>
        )}
      </div>
    </BlurFade>
  );
}

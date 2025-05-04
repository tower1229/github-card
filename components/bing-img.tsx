/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect } from "react";
import { authFetch } from "@/lib/auth";

export function BingImg({ className = "" }: { className?: string }) {
  const [bgUrl, setBgUrl] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchBgUrl = async () => {
      try {
        const response = await authFetch("/api/background", {
          signal: controller.signal,
        });
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setBgUrl(url);
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Error fetching background URL:", error);
      }
    };

    fetchBgUrl();

    return () => {
      controller.abort();
    };
  }, []);

  return bgUrl ? (
    <img src={bgUrl} className={className} alt="Bing daily background" />
  ) : null;
}

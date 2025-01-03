"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

export function BingImg({ className = "" }: { className?: string }) {
  const [bgUrl, setBgUrl] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchBgUrl = async () => {
      try {
        const response = await fetch("/api/background", {
          signal: controller.signal,
        });
        const data = await response.json();
        if (data.success) {
          setBgUrl(data.url);
        }
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
    <Image
      src={
        bgUrl ||
        `https://www.bing.com/th?id=OHR.Rivendell_ZH-CN6669549862_1920x1080.jpg`
      }
      alt="Background"
      fill
      className={className}
    />
  ) : null;
}

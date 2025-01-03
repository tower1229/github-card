/* eslint-disable @next/next/no-img-element */
"use client";
import { loadImageWithCORS } from "@/lib/utils";
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

  const [img, setImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!bgUrl) return;
    const loadImage = async () => {
      const img = await loadImageWithCORS(bgUrl);
      setImg(img);
    };
    loadImage();
  }, [bgUrl]);

  return img ? (
    <img
      src={img.src}
      className={className}
      alt="Bing daily background"
    />
  ) : null;
}

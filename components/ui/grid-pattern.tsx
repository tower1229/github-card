"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface GridPatternProps {
  className?: string;
  yLines?: number;
  xLines?: number;
  lineColor?: string;
  glowColor?: string;
  animate?: boolean;
}

export const GridPattern = ({
  className,
  yLines = 15,
  xLines = 15,
  lineColor = "#30363d",
  glowColor = "#fa7b1940",
  animate = true,
}: GridPatternProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center overflow-hidden z-0",
        className
      )}
    >
      <div
        className={cn(
          "absolute inset-0 z-[-1]",
          animate && "grid-pattern-animation"
        )}
        style={{
          background: mounted
            ? `
              linear-gradient(to right, ${lineColor} 1px, transparent 1px),
              linear-gradient(to bottom, ${lineColor} 1px, transparent 1px)
            `
            : "",
          backgroundSize: mounted ? `${100 / xLines}% ${100 / yLines}%` : "",
          mask: mounted
            ? `radial-gradient(circle at center, black 40%, transparent 80%)`
            : "",
        }}
      />

      {/* Glow effect at intersections */}
      <div
        className={cn(
          "absolute inset-0 z-[-1] opacity-20",
          animate && "grid-glow-animation"
        )}
        style={{
          boxShadow: mounted ? `inset 0 0 100px 20px ${glowColor}` : "",
        }}
      />

      {/* Circles at intersections */}
      {mounted && (
        <>
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className={cn(
                "absolute size-3 rounded-full",
                animate && "random-blink"
              )}
              style={{
                backgroundColor: "#fa7b19",
                top: `${10 + Math.random() * 80}%`,
                left: `${10 + Math.random() * 80}%`,
                boxShadow: "0 0 20px 2px #fa7b1980",
                opacity: 0.8,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 7}s`,
              }}
            />
          ))}
        </>
      )}

      {/* Tech data points */}
      {mounted && (
        <>
          {[...Array(12)].map((_, index) => {
            const size = 30 + Math.random() * 100;
            return (
              <div
                key={`tech-${index}`}
                className="absolute rounded-lg opacity-10 tech-pulse"
                style={{
                  width: size,
                  height: size,
                  border: "1px solid #fa7b19",
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${10 + Math.random() * 20}s`,
                }}
              />
            );
          })}
        </>
      )}
    </div>
  );
};

export default GridPattern;

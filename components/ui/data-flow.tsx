"use client";

import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface DataPoint {
  id: number;
  top: number;
  left: number;
  startLeft: number;
  direction: "right" | "left";
  speed: number;
  size: number;
  delay: number;
  color: string;
}

interface DataFlowProps {
  className?: string;
  particleCount?: number;
  particleColors?: string[];
}

export const DataFlow = ({
  className,
  particleCount = 15,
  particleColors = ["#fa7b19", "#f0883e", "#e76b0a"],
}: DataFlowProps) => {
  const [particles, setParticles] = useState<DataPoint[]>([]);
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize particles only once when component mounts
  useEffect(() => {
    setMounted(true);

    const initialParticles: DataPoint[] = [];
    for (let i = 0; i < particleCount; i++) {
      const direction = Math.random() > 0.5 ? "right" : "left";
      const startLeft = direction === "right" ? -5 : 105;

      initialParticles.push({
        id: i,
        top: Math.random() * 100,
        left: startLeft,
        startLeft,
        direction,
        speed: 0.5 + Math.random() * 1.5,
        size: 3 + Math.random() * 5,
        delay: Math.random() * 10,
        color:
          particleColors[Math.floor(Math.random() * particleColors.length)],
      });
    }

    setParticles(initialParticles);

    // Cleanup function to clear interval when component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // Only run once on mount, not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Separate useEffect for animation to prevent recursive state updates
  useEffect(() => {
    if (!mounted) return;

    intervalRef.current = setInterval(() => {
      setParticles((prev) =>
        prev.map((particle) => {
          // If still in delay, don't move yet
          if (particle.delay > 0) {
            return { ...particle, delay: particle.delay - 0.1 };
          }

          let newLeft = particle.left;
          if (particle.direction === "right") {
            newLeft = particle.left + particle.speed;
            if (newLeft > 105) newLeft = particle.startLeft;
          } else {
            newLeft = particle.left - particle.speed;
            if (newLeft < -5) newLeft = particle.startLeft;
          }

          return { ...particle, left: newLeft };
        })
      );
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className={cn("absolute inset-0 overflow-hidden z-0", className)}>
      {particles.map((particle) => (
        <React.Fragment key={particle.id}>
          {/* Data particle */}
          <div
            className="absolute z-10 rounded-full transform -translate-x-1/2 -translate-y-1/2"
            style={{
              top: `${particle.top}%`,
              left: `${particle.left}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
              opacity: particle.delay > 0 ? 0 : 0.8,
            }}
          />

          {/* Trail effect */}
          <div
            className="absolute rounded-full transform -translate-y-1/2"
            style={{
              top: `${particle.top}%`,
              left:
                particle.direction === "right"
                  ? `${particle.left - 15}%`
                  : `${particle.left}%`,
              width: "15%",
              height: "1px",
              background:
                particle.direction === "right"
                  ? `linear-gradient(to right, transparent, ${particle.color})`
                  : `linear-gradient(to left, transparent, ${particle.color})`,
              opacity: particle.delay > 0 ? 0 : 0.3,
            }}
          />
        </React.Fragment>
      ))}
    </div>
  );
};

export default DataFlow;

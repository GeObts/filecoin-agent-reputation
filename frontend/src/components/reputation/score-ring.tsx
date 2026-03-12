"use client";

import { useRef, useEffect } from "react";
import { getScoreRingColor, getScoreCategory } from "@/lib/utils";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScoreRingProps {
  score: number;
  maxScore?: number;
  size?: number;
}

export function ScoreRing({ score, maxScore = 1000, size = 160 }: ScoreRingProps) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(score / maxScore, 1);
  const offset = circumference * (1 - progress);
  const color = getScoreRingColor(score);
  const category = getScoreCategory(score);

  const circleRef = useRef<SVGCircleElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const circle = circleRef.current;
    const container = containerRef.current;
    if (!circle || !container) return;

    gsap.set(circle, { strokeDashoffset: circumference });

    const ctx = gsap.context(() => {
      gsap.to(circle, {
        strokeDashoffset: offset,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: container,
          start: "top 90%",
          once: true,
        },
      });
    });

    return () => ctx.revert();
  }, [circumference, offset]);

  return (
    <div ref={containerRef} className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="butt"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold" style={{ color }}>
          {score}
        </span>
        <span className="text-xs text-muted-foreground">{category}</span>
      </div>
    </div>
  );
}

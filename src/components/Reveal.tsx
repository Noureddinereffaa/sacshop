"use client";

import { ReactNode } from "react";
import { useReveal } from "@/lib/useReveal";

export default function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const { ref, inView } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`${inView ? "reveal-in" : "reveal"} ${className}`}
      style={inView && delay > 0 ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}

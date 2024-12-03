"use client";

import { useMotionValue, motion, useMotionTemplate } from "framer-motion";
import React, { MouseEvent as ReactMouseEvent, useState } from "react";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";
import { cn } from "@/lib/utils";

export const CardSpotlight = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
    setMousePosition({ x: clientX - left, y: clientY - top });
  }

  return (
    <div
      className={cn(
        "relative w-full rounded-xl border border-neutral-200 dark:border-white/[0.1] bg-neutral-50 dark:bg-black p-8 group",
        className
      )}
      onMouseMove={onMouseMove}
    >
      <div className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100">
        <CanvasRevealEffect mousePosition={mousePosition} />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

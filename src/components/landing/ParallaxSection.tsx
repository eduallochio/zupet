"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  speed?: number; // 0.1 = lento, 0.3 = médio, 0.5 = rápido
  style?: React.CSSProperties;
}

export function ParallaxSection({ children, className, speed = 0.2, style }: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 100}px`, `-${speed * 100}px`]);

  return (
    <div ref={ref} className={className} style={{ overflow: "hidden", ...style }}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}

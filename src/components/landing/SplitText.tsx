"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  wordClassName?: string;
}

export function SplitText({ text, className, delay = 0, wordClassName }: SplitTextProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const words = text.split(" ");

  return (
    <span ref={ref} className={className} style={{ display: "flex", flexWrap: "wrap", gap: "0.25em" }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className={wordClassName}
          style={{ display: "inline-block", overflow: "hidden" }}
          initial={{ opacity: 0, y: 36 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.6,
            delay: delay + i * 0.07,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

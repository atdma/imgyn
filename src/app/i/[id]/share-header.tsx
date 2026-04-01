"use client";

import { useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import BrandLogo from "@/components/brand-logo";

export default function ShareHeader({
  mimeLabel,
  sizeLabel,
  dimensionsLabel,
}: {
  mimeLabel: string;
  sizeLabel: string;
  dimensionsLabel?: string;
}) {
  const { scrollY, scrollYProgress } = useScroll();
  const [hidden, setHidden] = useState(false);
  const progressScaleX = useSpring(scrollYProgress, { stiffness: 170, damping: 24 });

  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (current < 16) {
      setHidden(false);
      return;
    }
    setHidden(current > previous);
  });

  return (
    <motion.header
      animate={{ y: hidden ? -92 : 0, opacity: hidden ? 0.92 : 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      className="sticky top-0 z-30 w-full border-b border-zinc-800/80 bg-zinc-950/85 px-6 py-4 backdrop-blur"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <BrandLogo href="/" />
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <span>{mimeLabel}</span>
          <span className="text-zinc-700">·</span>
          <span>{sizeLabel}</span>
          {dimensionsLabel ? (
            <>
              <span className="text-zinc-700">·</span>
              <span>{dimensionsLabel}</span>
            </>
          ) : null}
        </div>
      </div>
      <motion.span
        aria-hidden
        style={{ scaleX: progressScaleX, transformOrigin: "0% 50%" }}
        className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400"
      />
    </motion.header>
  );
}

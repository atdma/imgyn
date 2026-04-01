"use client";

import { AnimatePresence, motion } from "motion/react";

export default function ImagePreview({ src, alt }: { src: string; alt: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.img
        key={src}
        src={src}
        alt={alt}
        initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.99, filter: "blur(8px)" }}
        transition={{ duration: 0.38, ease: "easeOut" }}
        className="max-h-[70vh] max-w-full rounded-lg object-contain"
      />
    </AnimatePresence>
  );
}

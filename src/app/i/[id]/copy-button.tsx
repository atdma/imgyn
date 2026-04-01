"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export default function CopyButton({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      const fullUrl = `${window.location.origin}${value}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <motion.button
      onClick={handleCopy}
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -1 }}
      className="relative flex h-10 items-center justify-center overflow-hidden rounded-lg bg-indigo-600 px-5 text-sm font-medium text-white transition hover:bg-indigo-500"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={copied ? "copied" : "label"}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
          className="relative z-10"
        >
          {copied ? "Copied!" : label}
        </motion.span>
      </AnimatePresence>

      <AnimatePresence>
        {copied && (
          <>
            <motion.span
              initial={{ scale: 0.2, opacity: 0.35 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="pointer-events-none absolute inset-0 m-auto h-8 w-8 rounded-full bg-white/25"
            />
            <motion.span
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{ x: -16, y: -14, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.42, ease: "easeOut" }}
              className="pointer-events-none absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-white"
            />
            <motion.span
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{ x: 15, y: -12, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.42, ease: "easeOut" }}
              className="pointer-events-none absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-white"
            />
            <motion.span
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{ x: 0, y: -18, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.42, ease: "easeOut" }}
              className="pointer-events-none absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-white"
            />
          </>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

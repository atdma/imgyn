"use client";

import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import ToastStack, { type ToastItem } from "@/components/toast-stack";

function ActionButton({
  label,
  copied,
  onClick,
}: {
  label: string;
  copied: boolean;
  onClick: () => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.5 });
  const glow = useTransform(springY, [-9, 0, 9], [0.8, 1, 0.85]);

  function handleMove(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    x.set(offsetX * 0.18);
    y.set(offsetY * 0.2);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.button
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: springX, y: springY, opacity: glow }}
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
        >
          {copied ? "Copied!" : label}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

export default function ShareActionBar({
  pagePath,
  rawPath,
}: {
  pagePath: string;
  rawPath: string;
}) {
  const [copiedState, setCopiedState] = useState<"page" | "raw" | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }

  function queueToast(message: string, tone: ToastItem["tone"] = "success") {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 2200);
  }

  async function handleCopy(path: string, mode: "page" | "raw") {
    try {
      const fullUrl = `${window.location.origin}${path}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopiedState(mode);
      window.setTimeout(() => setCopiedState(null), 1600);
      queueToast(mode === "page" ? "Share page link copied" : "Direct image link copied");
    } catch {
      queueToast("Clipboard denied - copy manually", "error");
    }
  }

  return (
    <>
      <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <ActionButton
          label="Copy Link"
          copied={copiedState === "page"}
          onClick={() => void handleCopy(pagePath, "page")}
        />
        <ActionButton
          label="Copy Direct Link"
          copied={copiedState === "raw"}
          onClick={() => void handleCopy(rawPath, "raw")}
        />
        <motion.a
          href={rawPath}
          download
          whileHover={{ y: -1, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => queueToast("Download started", "info")}
          className="flex h-10 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 px-5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700"
        >
          Download
        </motion.a>
      </div>
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

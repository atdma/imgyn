"use client";

import { AnimatePresence, motion } from "motion/react";

export interface ToastItem {
  id: string;
  message: string;
  tone?: "success" | "error" | "info";
}

export default function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-72 flex-col gap-2 sm:right-6 sm:top-6">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 30, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 25, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className={`pointer-events-auto rounded-lg border px-3 py-2 text-sm shadow-lg backdrop-blur ${
              toast.tone === "error"
                ? "border-red-800/70 bg-red-950/80 text-red-200"
                : toast.tone === "info"
                  ? "border-zinc-700/70 bg-zinc-900/90 text-zinc-200"
                  : "border-emerald-800/70 bg-emerald-950/80 text-emerald-200"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span>{toast.message}</span>
              <button
                onClick={() => onDismiss(toast.id)}
                className="rounded px-1 text-xs text-current/70 transition hover:text-current"
                aria-label="Dismiss notification"
              >
                x
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

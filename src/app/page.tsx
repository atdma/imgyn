"use client";

import { useState, useRef, useCallback } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTime,
  useTransform,
} from "motion/react";
import BrandLogo from "@/components/brand-logo";
import ToastStack, { type ToastItem } from "@/components/toast-stack";

interface UploadResult {
  id: string;
  url: string;
  directUrl: string;
  mime: string;
  size: number;
  width: number;
  height: number;
}

export default function Home() {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { scrollYProgress } = useScroll();
  const orbY = useTransform(scrollYProgress, [0, 0.3], ["0%", "24%"]);
  const heroTitleY = useTransform(scrollYProgress, [0, 0.3], ["0%", "16%"]);
  const heroSubtitleY = useTransform(scrollYProgress, [0, 0.3], ["0%", "10%"]);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, { stiffness: 260, damping: 22 });
  const rotateY = useSpring(tiltY, { stiffness: 260, damping: 22 });

  const upload = useCallback(async (file: File) => {
    setError(null);
    setResult(null);

    if (!file.type.startsWith("image/")) {
      setError("That doesn't look like an image file.");
      return;
    }

    setUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed.");
        return;
      }

      setResult(data);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = "";
  }

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

  async function copyToClipboard(text: string, label: string) {
    try {
      const fullUrl = `${window.location.origin}${text}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
      queueToast(label === "view" ? "Share page link copied" : "Direct image link copied");
    } catch {
      setError("Clipboard permission denied. Copy manually.");
      queueToast("Clipboard denied - copy manually", "error");
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          upload(file);
          return;
        }
      }
    }
  }

  function handleUploadCardMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    tiltY.set((px - 0.5) * 7);
    tiltX.set((0.5 - py) * 7);
  }

  function resetUploadCardTilt() {
    tiltX.set(0);
    tiltY.set(0);
  }

  return (
    <div
      className="relative flex min-h-screen flex-col items-center overflow-x-hidden bg-zinc-950 text-zinc-100"
      onPaste={handlePaste}
    >
      <motion.div
        aria-hidden
        style={{ y: orbY }}
        className="pointer-events-none absolute -left-32 top-16 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"
      />
      <motion.div
        aria-hidden
        style={{ y: orbY }}
        className="pointer-events-none absolute -right-32 top-64 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl"
      />

      <header className="w-full border-b border-zinc-800 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <BrandLogo href="/" />
          <p className="text-sm text-zinc-500">simple image hosting</p>
        </div>
      </header>

      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-8 px-6 py-16">
        <section className="relative w-full text-center">
          <motion.h2
            style={{ y: heroTitleY }}
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl"
          >
            <motion.span
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.08, delayChildren: 0.05 },
                },
              }}
              className="inline-flex flex-wrap items-center justify-center gap-x-3"
            >
              {["Upload.", "Share.", "Done."].map((word) => (
                <motion.span
                  key={word}
                  variants={{
                    hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
                    show: {
                      opacity: 1,
                      y: 0,
                      filter: "blur(0px)",
                      transition: { duration: 0.34, ease: "easeOut" },
                    },
                  }}
                  className="inline-block"
                >
                  <AmbientWord
                    phaseMs={
                      word === "Upload."
                        ? 0
                        : word === "Share."
                          ? 420
                          : 840
                    }
                  >
                    {word}
                  </AmbientWord>
                </motion.span>
              ))}
            </motion.span>
          </motion.h2>
          <motion.p style={{ y: heroSubtitleY }} className="mt-3 text-zinc-400">
            Drop, paste, or click to upload. Get a shareable link instantly.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="mt-5 flex items-center justify-center gap-2 text-xs text-zinc-500"
          >
            <span className="rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-1">
              Drag and drop
            </span>
            <span className="rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-1">
              Paste from clipboard
            </span>
            <span className="rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-1">
              Instant links
            </span>
          </motion.div>
        </section>

        <LayoutGroup>
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="upload"
                layoutId="upload-panel"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: "spring", stiffness: 180, damping: 22 }}
                className="w-full"
              >
                <motion.div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onMouseMove={handleUploadCardMove}
                  onMouseLeave={resetUploadCardTilt}
                  onClick={() => inputRef.current?.click()}
                  style={{ rotateX, rotateY, transformPerspective: 900 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.995 }}
                  animate={{
                    borderColor: dragging
                      ? "rgba(99, 102, 241, 1)"
                      : "rgba(63, 63, 70, 1)",
                    backgroundColor: dragging
                      ? "rgba(99, 102, 241, 0.12)"
                      : "rgba(24, 24, 27, 0.55)",
                    boxShadow: dragging
                      ? "0 0 0 1px rgba(99,102,241,0.3), 0 0 40px rgba(99,102,241,0.25)"
                      : "0 0 0 0 rgba(0,0,0,0)",
                  }}
                  transition={{ type: "spring", stiffness: 230, damping: 24 }}
                  className="flex w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-16"
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <UploadingDots />
                      <span className="text-sm text-zinc-400">Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <motion.svg
                        animate={{ y: dragging ? -5 : 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="h-12 w-12 text-zinc-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                        />
                      </motion.svg>
                      <span className="text-sm text-zinc-300">
                        Drop an image here, paste from clipboard, or click to browse
                      </span>
                      <span className="text-xs text-zinc-500">
                        JPEG, PNG, GIF, WebP, AVIF, SVG - up to 20 MB
                      </span>
                    </>
                  )}
                </motion.div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mt-4 w-full rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-400"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                layoutId="upload-panel"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: "spring", stiffness: 180, damping: 22 }}
                className="w-full"
              >
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: { staggerChildren: 0.08, delayChildren: 0.08 },
                    },
                  }}
                >
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.24 } },
                    }}
                    className="text-center"
                  >
                    <h3 className="text-3xl font-bold tracking-tight text-white">
                      Uploaded!
                    </h3>
                    <p className="mt-2 text-zinc-400">Your image is ready to share.</p>
                  </motion.div>

                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.28 } },
                    }}
                    className="mt-4 w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4"
                  >
                    <div className="flex items-center justify-center rounded-xl bg-zinc-950 p-4">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={result.id}
                          src={result.directUrl}
                          alt="Uploaded"
                          initial={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }}
                          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0, scale: 0.98, filter: "blur(6px)" }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          className="max-h-64 max-w-full rounded-lg object-contain"
                        />
                      </AnimatePresence>
                    </div>
                  </motion.div>

                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.28 } },
                    }}
                    className="mt-4 flex w-full flex-col gap-3"
                  >
                    <LinkRow
                      label="View Page"
                      value={result.url}
                      copied={copied === "view"}
                      onCopy={() => copyToClipboard(result.url, "view")}
                    />
                    <LinkRow
                      label="Direct Link"
                      value={result.directUrl}
                      copied={copied === "direct"}
                      onCopy={() => copyToClipboard(result.directUrl, "direct")}
                    />
                  </motion.div>

                  <motion.button
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.24 } },
                    }}
                    onClick={() => setResult(null)}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-4 flex h-10 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 px-6 text-sm font-medium text-zinc-200 transition hover:bg-zinc-700"
                  >
                    Upload another
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </LayoutGroup>
      </main>

      <footer className="w-full border-t border-zinc-800 px-6 py-4">
        <p className="text-center text-xs text-zinc-600">
          images are stored as-is. no accounts, no tracking.
        </p>
      </footer>
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

function AmbientWord({
  children,
  phaseMs,
}: {
  children: React.ReactNode;
  phaseMs: number;
}) {
  const time = useTime();
  const y = useTransform(time, (t) => Math.sin((t + phaseMs) / 950) * -1.8);
  const opacity = useTransform(time, (t) => {
    const wave = (Math.sin((t + phaseMs) / 1050) + 1) / 2;
    return 0.93 + wave * 0.07;
  });

  return (
    <motion.span style={{ y, opacity }} className="inline-block">
      {children}
    </motion.span>
  );
}

function LinkRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <motion.div
      layout
      className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 p-2"
    >
      <span className="shrink-0 rounded bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-400">
        {label}
      </span>
      <code className="min-w-0 flex-1 truncate text-sm text-zinc-300">
        {typeof window !== "undefined" ? window.location.origin : ""}{value}
      </code>
      <motion.button
        onClick={onCopy}
        whileTap={{ scale: 0.95 }}
        whileHover={{ y: -1 }}
        className="shrink-0 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-500 active:scale-95"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={copied ? "copied" : "copy"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
            className="inline-flex items-center gap-1"
          >
            {copied ? "Copied!" : "Copy"}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}

function UploadingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((dot) => (
        <motion.span
          // delay each dot to create a flowing loader effect
          key={dot}
          animate={{ y: [0, -5, 0], opacity: [0.45, 1, 0.45] }}
          transition={{
            duration: 0.7,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            ease: "easeInOut",
            delay: dot * 0.12,
          }}
          className="h-2.5 w-2.5 rounded-full bg-indigo-400"
        />
      ))}
    </div>
  );
}

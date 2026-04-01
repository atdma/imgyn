"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { AnimatePresence, motion } from "motion/react";

export default function BrandLogo({ href = "/" }: { href?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);

  function handleNavigateHome(e: React.MouseEvent<HTMLAnchorElement>) {
    // Preserve native behavior for modified clicks.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (isTransitioning) {
      e.preventDefault();
      return;
    }

    if (pathname !== href) {
      e.preventDefault();
      setIsTransitioning(true);
      window.setTimeout(() => {
        router.push(href);
      }, 280);
    }
  }

  return (
    <>
      <Link
        href={href}
        onClick={handleNavigateHome}
        className="group inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/80"
        aria-label="Go to homepage"
      >
        <motion.span
          animate={isTransitioning ? { scale: 0.96, opacity: 0.85 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative inline-flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/20 text-indigo-300"
        >
          <SparklesIcon className="h-4 w-4" />
          <motion.span
            animate={{ opacity: [0.2, 0.7, 0.2], scale: [0.9, 1.15, 0.9] }}
            transition={{
              duration: 2.3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute inset-0 rounded-md bg-indigo-400/20 blur-sm"
          />
        </motion.span>
        <motion.span
          whileHover={{ y: -1 }}
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 20,
          }}
          className="text-xl font-bold tracking-tight text-white"
        >
          imgyn
        </motion.span>
      </Link>

      <AnimatePresence>
        {isTransitioning ? (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="pointer-events-none fixed inset-0 z-[70] bg-zinc-950"
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

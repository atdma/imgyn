import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-100">
      <h1 className="text-6xl font-bold text-zinc-600">404</h1>
      <p className="mt-4 text-zinc-400">Image not found.</p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
      >
        Upload one
      </Link>
    </div>
  );
}

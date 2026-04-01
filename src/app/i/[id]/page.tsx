import { notFound } from "next/navigation";
import { getImage } from "@/lib/storage";
import type { Metadata } from "next";
import ImagePreview from "./image-preview";
import ShareActionBar from "./share-action-bar";
import ShareHeader from "./share-header";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await getImage(id);
  if (!result) return {};

  const { meta } = result;
  return {
    title: `${meta.id} — imgyn`,
    openGraph: {
      images: [{ url: `/i/${meta.id}/raw`, width: meta.width, height: meta.height }],
    },
    twitter: {
      card: "summary_large_image",
      images: [`/i/${meta.id}/raw`],
    },
  };
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function ImagePage({ params }: Props) {
  const { id } = await params;
  const result = await getImage(id);

  if (!result) notFound();

  const { meta } = result;
  const rawUrl = `/i/${meta.id}/raw`;

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-950 text-zinc-100">
      <ShareHeader
        mimeLabel={meta.mime.split("/")[1].toUpperCase()}
        sizeLabel={formatBytes(meta.size)}
        dimensionsLabel={meta.width > 0 ? `${meta.width} × ${meta.height}` : undefined}
      />

      <main className="flex w-full max-w-5xl flex-1 flex-col items-center gap-6 px-6 py-8">
        <div className="relative flex w-full flex-1 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <ImagePreview src={rawUrl} alt={`Image ${meta.id}`} />
        </div>

        <ShareActionBar pagePath={`/i/${meta.id}`} rawPath={rawUrl} />
      </main>
    </div>
  );
}

import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import { nanoid } from "nanoid";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "image/svg+xml": ".svg",
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export interface StoredImage {
  id: string;
  filename: string;
  mime: string;
  size: number;
  width: number;
  height: number;
}

async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function saveImage(file: File): Promise<StoredImage> {
  if (!ALLOWED_MIME[file.type]) {
    throw new Error("Unsupported file type. Allowed: JPEG, PNG, GIF, WebP, AVIF, SVG.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File too large. Maximum size is 20 MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let width = 0;
  let height = 0;

  if (file.type === "image/svg+xml") {
    const text = buffer.toString("utf-8");
    if (/<script/i.test(text)) {
      throw new Error("SVG contains disallowed elements.");
    }
    width = 0;
    height = 0;
  } else {
    try {
      const meta = await sharp(buffer).metadata();
      if (!meta.width || !meta.height) {
        throw new Error("Could not read image dimensions.");
      }
      width = meta.width;
      height = meta.height;
    } catch {
      throw new Error("File is not a valid image.");
    }
  }

  await ensureUploadDir();

  const id = nanoid(10);
  const ext = ALLOWED_MIME[file.type];
  const filename = `${id}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  await fs.writeFile(filepath, buffer);

  const metaPath = path.join(UPLOAD_DIR, `${id}.json`);
  const meta: StoredImage = { id, filename, mime: file.type, size: buffer.length, width, height };
  await fs.writeFile(metaPath, JSON.stringify(meta));

  return meta;
}

export async function getImage(id: string): Promise<{ meta: StoredImage; filepath: string } | null> {
  await ensureUploadDir();

  const metaPath = path.join(UPLOAD_DIR, `${id}.json`);

  try {
    const raw = await fs.readFile(metaPath, "utf-8");
    const meta: StoredImage = JSON.parse(raw);
    const filepath = path.join(UPLOAD_DIR, meta.filename);
    await fs.access(filepath);
    return { meta, filepath };
  } catch {
    return null;
  }
}

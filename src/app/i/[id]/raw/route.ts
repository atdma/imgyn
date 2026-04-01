import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { getImage } from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await getImage(id);

  if (!result) {
    return new NextResponse("Not found", { status: 404 });
  }

  const buffer = await fs.readFile(result.filepath);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": result.meta.mime,
      "Content-Length": String(buffer.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

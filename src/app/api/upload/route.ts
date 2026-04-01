import { NextResponse } from "next/server";
import { saveImage } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const image = await saveImage(file);

    return NextResponse.json({
      id: image.id,
      url: `/i/${image.id}`,
      directUrl: `/i/${image.id}/raw`,
      mime: image.mime,
      size: image.size,
      width: image.width,
      height: image.height,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

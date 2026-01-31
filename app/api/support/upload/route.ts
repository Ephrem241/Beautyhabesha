import { NextRequest, NextResponse } from "next/server";
import { getSupportAuth } from "@/lib/support-auth";
import { uploadImage } from "@/lib/cloudinary-utils";

const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const auth = await getSupportAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Must be an image" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  const result = await uploadImage(file, {
    folder: "support-chat",
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 85,
    format: "auto",
  });

  if (!result.success || !result.image) {
    return NextResponse.json(
      { error: result.error ?? "Upload failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: result.image.url });
}

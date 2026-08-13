import { NextResponse } from "next/server";
import { adminDb, handleAuthError } from "@/lib/admin-api";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const db = await adminDb();
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error } = await db.storage
      .from("product-images")
      .upload(path, arrayBuffer, { contentType: file.type || "image/png", upsert: true });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: urlData } = db.storage.from("product-images").getPublicUrl(path);
    return NextResponse.json({ url: urlData.publicUrl + "?t=" + Date.now() });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

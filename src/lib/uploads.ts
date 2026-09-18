import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "miniatures");

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_SIZE = 5 * 1024 * 1024;

export async function saveMiniatureImage(file: File): Promise<string> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    throw new Error("Formato de imagem não suportado. Use PNG, JPG, WEBP ou GIF.");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("Imagem muito grande (máximo 5MB).");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return `/uploads/miniatures/${filename}`;
}

export async function deleteMiniatureImage(imagePath: string | null) {
  if (!imagePath) return;
  const filename = path.basename(imagePath);
  try {
    await unlink(path.join(UPLOAD_DIR, filename));
  } catch {
    // arquivo já pode não existir; não é um erro fatal
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { deleteMiniatureImage, saveMiniatureImage } from "@/lib/uploads";

const miniatureSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  dimensions: z.string().optional(),
  stock: z.coerce.number().int().min(0, "Estoque não pode ser negativo."),
});

export type MiniatureFormState = { error?: string } | undefined;

export async function createMiniature(
  _prevState: MiniatureFormState,
  formData: FormData
): Promise<MiniatureFormState> {
  await requireAdmin();

  const parsed = miniatureSchema.safeParse({
    name: formData.get("name"),
    dimensions: formData.get("dimensions") ?? "",
    stock: formData.get("stock") || "1",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const imageFile = formData.get("image");
  let imagePath: string | null = null;
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      imagePath = await saveMiniatureImage(imageFile);
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Erro ao salvar imagem.",
      };
    }
  }

  db.prepare(
    "INSERT INTO miniatures (name, dimensions, image_path, stock) VALUES (?, ?, ?, ?)"
  ).run(
    parsed.data.name,
    parsed.data.dimensions || null,
    imagePath,
    parsed.data.stock
  );

  revalidatePath("/admin/miniaturas");
  revalidatePath("/admin/atribuicoes");
  return undefined;
}

export async function updateMiniature(
  miniatureId: number,
  _prevState: MiniatureFormState,
  formData: FormData
): Promise<MiniatureFormState> {
  await requireAdmin();

  const parsed = miniatureSchema.safeParse({
    name: formData.get("name"),
    dimensions: formData.get("dimensions") ?? "",
    stock: formData.get("stock") || "0",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const current = db
    .prepare("SELECT image_path FROM miniatures WHERE id = ?")
    .get(miniatureId) as { image_path: string | null } | undefined;
  if (!current) {
    return { error: "Miniatura não encontrada." };
  }

  const imageFile = formData.get("image");
  let imagePath = current.image_path;
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      imagePath = await saveMiniatureImage(imageFile);
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : "Erro ao salvar imagem.",
      };
    }
    await deleteMiniatureImage(current.image_path);
  }

  db.prepare(
    "UPDATE miniatures SET name = ?, dimensions = ?, image_path = ?, stock = ? WHERE id = ?"
  ).run(
    parsed.data.name,
    parsed.data.dimensions || null,
    imagePath,
    parsed.data.stock,
    miniatureId
  );

  revalidatePath("/admin/miniaturas");
  revalidatePath("/admin/atribuicoes");
  revalidatePath("/");
  return undefined;
}

export async function deleteMiniature(miniatureId: number) {
  await requireAdmin();

  const miniature = db
    .prepare("SELECT image_path FROM miniatures WHERE id = ?")
    .get(miniatureId) as { image_path: string | null } | undefined;

  db.prepare("DELETE FROM miniatures WHERE id = ?").run(miniatureId);

  if (miniature) {
    await deleteMiniatureImage(miniature.image_path);
  }

  revalidatePath("/admin/miniaturas");
  revalidatePath("/admin/atribuicoes");
  revalidatePath("/");
}

"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin, requireUser } from "@/lib/session";

function hasStockFor(
  meetingId: number,
  miniatureId: number,
  userId: number
): boolean {
  const miniature = db
    .prepare("SELECT stock FROM miniatures WHERE id = ?")
    .get(miniatureId) as { stock: number } | undefined;
  if (!miniature) return false;

  const usedByOthers = (
    db
      .prepare(
        `SELECT COUNT(*) AS count FROM assignments
         WHERE meeting_id = ? AND miniature_id = ? AND user_id != ?`
      )
      .get(meetingId, miniatureId, userId) as { count: number }
  ).count;

  return usedByOthers < miniature.stock;
}

export async function setAssignment(
  meetingId: number,
  userId: number,
  formData: FormData
) {
  await requireAdmin();
  const miniatureIdRaw = String(formData.get("miniature_id") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!miniatureIdRaw) {
    db.prepare(
      "DELETE FROM assignments WHERE meeting_id = ? AND user_id = ?"
    ).run(meetingId, userId);
  } else {
    const miniatureId = Number(miniatureIdRaw);

    // Sem estoque sobrando para este participante: ignora a atribuição
    // silenciosamente (o dropdown já não deveria oferecer essa opção).
    if (!hasStockFor(meetingId, miniatureId, userId)) return;

    db.prepare(
      `INSERT INTO assignments (meeting_id, user_id, miniature_id, notes)
       VALUES (?, ?, ?, ?)
       ON CONFLICT (meeting_id, user_id)
       DO UPDATE SET miniature_id = excluded.miniature_id,
                     notes = excluded.notes`
    ).run(meetingId, userId, miniatureId, notes || null);
  }

  revalidatePath("/admin/atribuicoes");
  revalidatePath("/");
}

export async function selectMiniature(
  meetingId: number,
  miniatureId: number | null
) {
  const user = await requireUser();
  const userId = Number(user.id);

  if (miniatureId === null) {
    db.prepare(
      "DELETE FROM assignments WHERE meeting_id = ? AND user_id = ?"
    ).run(meetingId, userId);
  } else {
    // Sem estoque sobrando: ignora silenciosamente (a interface já não
    // deveria oferecer essa miniatura como opção clicável).
    if (!hasStockFor(meetingId, miniatureId, userId)) return;

    db.prepare(
      `INSERT INTO assignments (meeting_id, user_id, miniature_id)
       VALUES (?, ?, ?)
       ON CONFLICT (meeting_id, user_id)
       DO UPDATE SET miniature_id = excluded.miniature_id`
    ).run(meetingId, userId, miniatureId);
  }

  revalidatePath("/admin/atribuicoes");
  revalidatePath("/");
}

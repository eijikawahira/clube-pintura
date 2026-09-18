"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

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

    const miniature = db
      .prepare("SELECT stock FROM miniatures WHERE id = ?")
      .get(miniatureId) as { stock: number } | undefined;
    if (!miniature) return;

    const usedByOthers = (
      db
        .prepare(
          `SELECT COUNT(*) AS count FROM assignments
           WHERE meeting_id = ? AND miniature_id = ? AND user_id != ?`
        )
        .get(meetingId, miniatureId, userId) as { count: number }
    ).count;

    // Sem estoque sobrando para este participante: ignora a atribuição
    // silenciosamente (o dropdown já não deveria oferecer essa opção).
    if (usedByOthers >= miniature.stock) return;

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

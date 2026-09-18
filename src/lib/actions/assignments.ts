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
  const miniatureName = String(formData.get("miniature_name") ?? "").trim();
  const miniatureNotes = String(formData.get("miniature_notes") ?? "").trim();

  if (!miniatureName) {
    db.prepare(
      "DELETE FROM assignments WHERE meeting_id = ? AND user_id = ?"
    ).run(meetingId, userId);
  } else {
    db.prepare(
      `INSERT INTO assignments (meeting_id, user_id, miniature_name, miniature_notes)
       VALUES (?, ?, ?, ?)
       ON CONFLICT (meeting_id, user_id)
       DO UPDATE SET miniature_name = excluded.miniature_name,
                     miniature_notes = excluded.miniature_notes`
    ).run(meetingId, userId, miniatureName, miniatureNotes || null);
  }

  revalidatePath("/admin/atribuicoes");
  revalidatePath("/");
}

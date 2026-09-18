"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

export async function togglePreparationCheck(preparationId: number) {
  const user = await requireUser();
  const userId = Number(user.id);

  const existing = db
    .prepare(
      "SELECT 1 FROM preparation_checks WHERE preparation_id = ? AND user_id = ?"
    )
    .get(preparationId, userId);

  if (existing) {
    db.prepare(
      "DELETE FROM preparation_checks WHERE preparation_id = ? AND user_id = ?"
    ).run(preparationId, userId);
  } else {
    db.prepare(
      "INSERT INTO preparation_checks (preparation_id, user_id) VALUES (?, ?)"
    ).run(preparationId, userId);
  }

  revalidatePath("/");
}

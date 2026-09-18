"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

const meetingSchema = z.object({
  date: z.string().min(1, "Data é obrigatória."),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export async function createMeeting(formData: FormData) {
  await requireAdmin();
  const data = meetingSchema.parse({
    date: formData.get("date"),
    location: formData.get("location") ?? "",
    notes: formData.get("notes") ?? "",
  });

  db.prepare(
    "INSERT INTO meetings (date, location, notes) VALUES (?, ?, ?)"
  ).run(data.date, data.location || null, data.notes || null);

  revalidatePath("/admin/encontros");
  revalidatePath("/");
}

export async function updateMeeting(meetingId: number, formData: FormData) {
  await requireAdmin();
  const data = meetingSchema.parse({
    date: formData.get("date"),
    location: formData.get("location") ?? "",
    notes: formData.get("notes") ?? "",
  });

  db.prepare(
    "UPDATE meetings SET date = ?, location = ?, notes = ? WHERE id = ?"
  ).run(data.date, data.location || null, data.notes || null, meetingId);

  revalidatePath("/admin/encontros");
  revalidatePath(`/admin/encontros/${meetingId}`);
  revalidatePath("/");
}

export async function deleteMeeting(meetingId: number) {
  await requireAdmin();
  db.prepare("DELETE FROM meetings WHERE id = ?").run(meetingId);
  revalidatePath("/admin/encontros");
  revalidatePath("/");
  redirect("/admin/encontros");
}

export async function addPreparation(meetingId: number, formData: FormData) {
  await requireAdmin();
  const description = String(formData.get("description") ?? "").trim();
  if (!description) return;

  db.prepare(
    "INSERT INTO preparations (meeting_id, description) VALUES (?, ?)"
  ).run(meetingId, description);

  revalidatePath(`/admin/encontros/${meetingId}`);
  revalidatePath("/");
}

export async function deletePreparation(
  meetingId: number,
  preparationId: number
) {
  await requireAdmin();
  db.prepare("DELETE FROM preparations WHERE id = ?").run(preparationId);
  revalidatePath(`/admin/encontros/${meetingId}`);
  revalidatePath("/");
}

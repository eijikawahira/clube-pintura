"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

const createUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  username: z.string().min(3, "Usuário deve ter ao menos 3 caracteres."),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres."),
  role: z.enum(["admin", "member"]),
});

export async function createUser(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  await requireAdmin();

  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    password: formData.get("password"),
    role: formData.get("role") === "admin" ? "admin" : "member",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { name, username, password, role } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    db.prepare(
      "INSERT INTO users (name, username, password_hash, role) VALUES (?, ?, ?, ?)"
    ).run(name, username, passwordHash, role);
  } catch {
    return { error: "Esse nome de usuário já existe." };
  }

  revalidatePath("/admin/participantes");
  return undefined;
}

export async function resetPassword(userId: number, formData: FormData) {
  await requireAdmin();
  const password = String(formData.get("password") ?? "");
  if (password.length < 6) return;

  const passwordHash = await bcrypt.hash(password, 10);
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(
    passwordHash,
    userId
  );

  revalidatePath("/admin/participantes");
}

export async function deleteUser(userId: number) {
  const admin = await requireAdmin();
  if (String(userId) === admin.id) {
    throw new Error("Você não pode remover a si mesmo.");
  }
  db.prepare("DELETE FROM users WHERE id = ?").run(userId);
  revalidatePath("/admin/participantes");
}

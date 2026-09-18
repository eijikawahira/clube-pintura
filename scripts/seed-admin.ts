import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import bcrypt from "bcryptjs";
import { db, ensureSchema } from "../src/lib/db";

async function main() {
  ensureSchema();

  const rl = readline.createInterface({ input: stdin, output: stdout });

  console.log("Criar usuário administrador do Clube de Pintura\n");
  const name = (await rl.question("Nome completo: ")).trim();
  const username = (await rl.question("Usuário (login): ")).trim();
  const password = (await rl.question("Senha (mínimo 6 caracteres): ")).trim();

  rl.close();

  if (!name || !username || password.length < 6) {
    console.error(
      "\nDados inválidos: nome e usuário são obrigatórios, senha precisa de 6+ caracteres."
    );
    process.exit(1);
  }

  const existing = db
    .prepare("SELECT id FROM users WHERE username = ?")
    .get(username);
  if (existing) {
    console.error(`\nJá existe um usuário com o login "${username}".`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  db.prepare(
    "INSERT INTO users (name, username, password_hash, role) VALUES (?, ?, ?, 'admin')"
  ).run(name, username, passwordHash);

  console.log(`\nAdmin "${username}" criado com sucesso.`);
}

main();

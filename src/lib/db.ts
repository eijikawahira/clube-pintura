import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "clube.db");

declare global {
  var __clubeDb: Database.Database | undefined;
}

export const db = global.__clubeDb ?? new Database(dbPath);
if (process.env.NODE_ENV !== "production") {
  global.__clubeDb = db;
}

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function ensureSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'member')) DEFAULT 'member',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS meetings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      location TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS preparations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meeting_id INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS preparation_checks (
      preparation_id INTEGER NOT NULL REFERENCES preparations(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      checked_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (preparation_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS miniatures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      dimensions TEXT,
      image_path TEXT,
      stock INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Migração leve: assignments passou a referenciar o catálogo de miniaturas
  // em vez de guardar nome/notas livres. Sem dados de produção até aqui,
  // então recriamos a tabela em vez de manter um sistema de migrações completo.
  const assignmentColumns = db.prepare("PRAGMA table_info(assignments)").all() as {
    name: string;
  }[];
  const hasOldAssignmentSchema = assignmentColumns.some(
    (c) => c.name === "miniature_name"
  );

  if (assignmentColumns.length === 0 || hasOldAssignmentSchema) {
    db.exec(`
      DROP TABLE IF EXISTS assignments;
      CREATE TABLE assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        meeting_id INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        miniature_id INTEGER NOT NULL REFERENCES miniatures(id) ON DELETE CASCADE,
        notes TEXT,
        UNIQUE (meeting_id, user_id)
      );
    `);
  }

  // Migração aditiva: bancos criados antes do controle de estoque ganham a
  // coluna com 1 unidade por miniatura já cadastrada (não perde dados).
  const miniatureColumns = db.prepare("PRAGMA table_info(miniatures)").all() as {
    name: string;
  }[];
  const hasStockColumn = miniatureColumns.some((c) => c.name === "stock");
  if (miniatureColumns.length > 0 && !hasStockColumn) {
    db.exec(
      "ALTER TABLE miniatures ADD COLUMN stock INTEGER NOT NULL DEFAULT 1"
    );
  }
}

ensureSchema();

export type UserRow = {
  id: number;
  name: string;
  username: string;
  password_hash: string;
  role: "admin" | "member";
  created_at: string;
};

export type MeetingRow = {
  id: number;
  date: string;
  location: string | null;
  notes: string | null;
  created_at: string;
};

export type PreparationRow = {
  id: number;
  meeting_id: number;
  description: string;
  created_at: string;
};

export type MiniatureRow = {
  id: number;
  name: string;
  dimensions: string | null;
  image_path: string | null;
  stock: number;
  created_at: string;
};

export type AssignmentRow = {
  id: number;
  meeting_id: number;
  user_id: number;
  miniature_id: number;
  notes: string | null;
};

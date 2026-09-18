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

    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meeting_id INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      miniature_name TEXT NOT NULL,
      miniature_notes TEXT,
      UNIQUE (meeting_id, user_id)
    );
  `);
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

export type AssignmentRow = {
  id: number;
  meeting_id: number;
  user_id: number;
  miniature_name: string;
  miniature_notes: string | null;
};

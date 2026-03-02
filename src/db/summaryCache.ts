import Database from "better-sqlite3";
import path from "path";

import { ensureDirectoryExists } from "./ensureDirectoryExists";

const SUMMARY_TTL = 1000 * 60 * 60 * 24 * 180; // ~6 months

const dbPath = path.join(process.cwd(), "data", "ai-summary-cache.db");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    ensureDirectoryExists(dbPath);
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.exec(`
      CREATE TABLE IF NOT EXISTS summaries (
        full_name TEXT PRIMARY KEY,
        summary TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);
  }
  return db;
}

interface SummaryRow {
  full_name: string;
  summary: string;
  created_at: number;
}

export function getCachedSummary(fullName: string): string | null {
  const row = getDb()
    .prepare("SELECT summary, created_at FROM summaries WHERE full_name = ?")
    .get(fullName) as SummaryRow | undefined;

  if (!row) return null;

  if (Date.now() - row.created_at > SUMMARY_TTL) {
    getDb().prepare("DELETE FROM summaries WHERE full_name = ?").run(fullName);
    return null;
  }

  return row.summary;
}

export function setCachedSummary(fullName: string, summary: string): void {
  getDb()
    .prepare(
      "INSERT OR REPLACE INTO summaries (full_name, summary, created_at) VALUES (?, ?, ?)"
    )
    .run(fullName, summary, Date.now());
}

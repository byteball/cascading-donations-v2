import Database from "better-sqlite3";
import path from "path";

import { ensureDirectoryExists } from "./ensureDirectoryExists";

// TTL constants
const THREE_MONTHS = 1000 * 60 * 60 * 24 * 90;
const ONE_MONTH = 1000 * 60 * 60 * 24 * 30;
const ONE_HOUR = 1000 * 60 * 60;

const dbPath = path.join(process.cwd(), "data", "github-cache.db");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    ensureDirectoryExists(dbPath);
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.exec(`
      CREATE TABLE IF NOT EXISTS repo_meta (
        full_name TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS contributors (
        full_name TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS banner_exists (
        full_name TEXT PRIMARY KEY,
        exists_flag INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS dependents (
        full_name TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS npm_deps (
        full_name TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);
  }
  return db;
}

function safeJsonParse<T>(data: string, table: string, fullName: string): T | null {
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error(`githubCache: corrupted data in ${table} for ${fullName}, deleting`, e);
    getDb().prepare(`DELETE FROM ${table} WHERE full_name = ?`).run(fullName);
    return null;
  }
}

// --- Repository Meta ---

export interface RepositoryMeta {
  name: string;
  owner: string;
  last_update: number;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  license: string | null;
  created_at: string;
  pushed_at: string;
}

export function getCachedMeta(fullName: string): RepositoryMeta | null {
  const row = getDb()
    .prepare("SELECT data, created_at FROM repo_meta WHERE full_name = ?")
    .get(fullName) as { data: string; created_at: number } | undefined;

  if (!row) return null;
  if (Date.now() - row.created_at > THREE_MONTHS) {
    getDb().prepare("DELETE FROM repo_meta WHERE full_name = ?").run(fullName);
    return null;
  }

  return safeJsonParse<RepositoryMeta>(row.data, "repo_meta", fullName);
}

export function setCachedMeta(fullName: string, data: RepositoryMeta): void {
  getDb()
    .prepare("INSERT OR REPLACE INTO repo_meta (full_name, data, created_at) VALUES (?, ?, ?)")
    .run(fullName, JSON.stringify(data), Date.now());
}

// --- Contributors ---

export interface Contributor {
  login: string;
  contributions: number;
}

export function getCachedContributors(fullName: string): Contributor[] | null {
  const row = getDb()
    .prepare("SELECT data, created_at FROM contributors WHERE full_name = ?")
    .get(fullName) as { data: string; created_at: number } | undefined;

  if (!row) return null;
  if (Date.now() - row.created_at > THREE_MONTHS) {
    getDb().prepare("DELETE FROM contributors WHERE full_name = ?").run(fullName);
    return null;
  }

  return safeJsonParse<Contributor[]>(row.data, "contributors", fullName);
}

export function setCachedContributors(fullName: string, data: Contributor[]): void {
  getDb()
    .prepare("INSERT OR REPLACE INTO contributors (full_name, data, created_at) VALUES (?, ?, ?)")
    .run(fullName, JSON.stringify(data), Date.now());
}

// --- Banner Exists ---

export function getCachedBannerExists(fullName: string): boolean | null {
  const row = getDb()
    .prepare("SELECT exists_flag, created_at FROM banner_exists WHERE full_name = ?")
    .get(fullName) as { exists_flag: number; created_at: number } | undefined;

  if (!row) return null;

  const ttl = row.exists_flag ? ONE_MONTH : ONE_HOUR;
  if (Date.now() - row.created_at > ttl) {
    getDb().prepare("DELETE FROM banner_exists WHERE full_name = ?").run(fullName);
    return null;
  }

  return row.exists_flag === 1;
}

export function setCachedBannerExists(fullName: string, exists: boolean): void {
  getDb()
    .prepare("INSERT OR REPLACE INTO banner_exists (full_name, exists_flag, created_at) VALUES (?, ?, ?)")
    .run(fullName, exists ? 1 : 0, Date.now());
}

// --- Dependents ---

export function getCachedDependents(fullName: string): { name: string; description: string }[] | null {
  const row = getDb()
    .prepare("SELECT data, created_at FROM dependents WHERE full_name = ?")
    .get(fullName) as { data: string; created_at: number } | undefined;

  if (!row) return null;
  if (Date.now() - row.created_at > THREE_MONTHS) {
    getDb().prepare("DELETE FROM dependents WHERE full_name = ?").run(fullName);
    return null;
  }

  return safeJsonParse<{ name: string; description: string }[]>(row.data, "dependents", fullName);
}

export function setCachedDependents(fullName: string, data: { name: string; description: string }[]): void {
  getDb()
    .prepare("INSERT OR REPLACE INTO dependents (full_name, data, created_at) VALUES (?, ?, ?)")
    .run(fullName, JSON.stringify(data), Date.now());
}

// --- NPM Dependencies ---

interface NpmDep {
  repo?: string;
  description?: string;
}

export function getCachedNpmDeps(fullName: string): NpmDep[] | null {
  const row = getDb()
    .prepare("SELECT data, created_at FROM npm_deps WHERE full_name = ?")
    .get(fullName) as { data: string; created_at: number } | undefined;

  if (!row) return null;
  if (Date.now() - row.created_at > THREE_MONTHS) {
    getDb().prepare("DELETE FROM npm_deps WHERE full_name = ?").run(fullName);
    return null;
  }

  return safeJsonParse<NpmDep[]>(row.data, "npm_deps", fullName);
}

export function setCachedNpmDeps(fullName: string, data: NpmDep[]): void {
  getDb()
    .prepare("INSERT OR REPLACE INTO npm_deps (full_name, data, created_at) VALUES (?, ?, ?)")
    .run(fullName, JSON.stringify(data), Date.now());
}

// --- Test helper ---

export function _getDbForTests(): Database.Database {
  return getDb();
}

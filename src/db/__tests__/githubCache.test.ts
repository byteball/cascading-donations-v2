import { describe, it, expect, beforeEach } from "vitest";
import {
  getCachedMeta, setCachedMeta,
  getCachedContributors, setCachedContributors,
  getCachedBannerExists, setCachedBannerExists,
  getCachedDependents, setCachedDependents,
  getCachedNpmDeps, setCachedNpmDeps,
  _getDbForTests,
  type RepositoryMeta
} from "@/db/githubCache";

beforeEach(() => {
  // clean all tables before each test
  const db = _getDbForTests();
  db.exec("DELETE FROM repo_meta");
  db.exec("DELETE FROM contributors");
  db.exec("DELETE FROM banner_exists");
  db.exec("DELETE FROM dependents");
  db.exec("DELETE FROM npm_deps");
});

const sampleMeta: RepositoryMeta = {
  name: "repo",
  owner: "owner",
  last_update: Date.now(),
  description: "A test repo",
  language: "TypeScript",
  stargazers_count: 100,
  forks_count: 10,
  license: "MIT",
  created_at: "2024-01-01T00:00:00Z",
  pushed_at: "2024-06-01T00:00:00Z",
};

describe("repo_meta", () => {
  it("set + get returns data", () => {
    setCachedMeta("owner/repo", sampleMeta);
    const result = getCachedMeta("owner/repo");
    expect(result).toEqual(sampleMeta);
  });

  it("returns null for missing key", () => {
    expect(getCachedMeta("unknown/repo")).toBeNull();
  });

  it("returns null when TTL expired (>3 months)", () => {
    const db = _getDbForTests();
    const fourMonthsAgo = Date.now() - 1000 * 60 * 60 * 24 * 120;
    db.prepare("INSERT INTO repo_meta (full_name, data, created_at) VALUES (?, ?, ?)")
      .run("old/repo", JSON.stringify(sampleMeta), fourMonthsAgo);

    expect(getCachedMeta("old/repo")).toBeNull();
  });

  it("returns data when TTL fresh (<3 months)", () => {
    setCachedMeta("fresh/repo", sampleMeta);
    expect(getCachedMeta("fresh/repo")).toEqual(sampleMeta);
  });

  it("upsert overwrites existing data", () => {
    setCachedMeta("owner/repo", sampleMeta);
    const updated = { ...sampleMeta, description: "Updated" };
    setCachedMeta("owner/repo", updated);
    expect(getCachedMeta("owner/repo")?.description).toBe("Updated");
  });
});

describe("contributors", () => {
  const data = [{ login: "user1", contributions: 50 }];

  it("set + get returns data", () => {
    setCachedContributors("owner/repo", data);
    expect(getCachedContributors("owner/repo")).toEqual(data);
  });

  it("returns null when TTL expired", () => {
    const db = _getDbForTests();
    const fourMonthsAgo = Date.now() - 1000 * 60 * 60 * 24 * 120;
    db.prepare("INSERT INTO contributors (full_name, data, created_at) VALUES (?, ?, ?)")
      .run("old/repo", JSON.stringify(data), fourMonthsAgo);

    expect(getCachedContributors("old/repo")).toBeNull();
  });
});

describe("banner_exists", () => {
  it("set true + get returns true", () => {
    setCachedBannerExists("owner/repo", true);
    expect(getCachedBannerExists("owner/repo")).toBe(true);
  });

  it("set false + get returns false", () => {
    setCachedBannerExists("owner/repo", false);
    expect(getCachedBannerExists("owner/repo")).toBe(false);
  });

  it("true: returns null after >1 month", () => {
    const db = _getDbForTests();
    const twoMonthsAgo = Date.now() - 1000 * 60 * 60 * 24 * 60;
    db.prepare("INSERT INTO banner_exists (full_name, exists_flag, created_at) VALUES (?, ?, ?)")
      .run("old/repo", 1, twoMonthsAgo);

    expect(getCachedBannerExists("old/repo")).toBeNull();
  });

  it("false: returns null after >1 hour", () => {
    const db = _getDbForTests();
    const twoHoursAgo = Date.now() - 1000 * 60 * 60 * 2;
    db.prepare("INSERT INTO banner_exists (full_name, exists_flag, created_at) VALUES (?, ?, ?)")
      .run("no-banner/repo", 0, twoHoursAgo);

    expect(getCachedBannerExists("no-banner/repo")).toBeNull();
  });
});

describe("dependents", () => {
  const data = [{ name: "dep/repo", description: "" }];

  it("set + get returns data", () => {
    setCachedDependents("owner/repo", data);
    expect(getCachedDependents("owner/repo")).toEqual(data);
  });

  it("returns null when expired", () => {
    const db = _getDbForTests();
    const fourMonthsAgo = Date.now() - 1000 * 60 * 60 * 24 * 120;
    db.prepare("INSERT INTO dependents (full_name, data, created_at) VALUES (?, ?, ?)")
      .run("old/repo", JSON.stringify(data), fourMonthsAgo);

    expect(getCachedDependents("old/repo")).toBeNull();
  });
});

describe("npm_deps", () => {
  const data = [{ repo: "pkg/repo", description: "A package" }];

  it("set + get returns data", () => {
    setCachedNpmDeps("owner/repo", data);
    expect(getCachedNpmDeps("owner/repo")).toEqual(data);
  });

  it("returns null when expired", () => {
    const db = _getDbForTests();
    const fourMonthsAgo = Date.now() - 1000 * 60 * 60 * 24 * 120;
    db.prepare("INSERT INTO npm_deps (full_name, data, created_at) VALUES (?, ?, ?)")
      .run("old/repo", JSON.stringify(data), fourMonthsAgo);

    expect(getCachedNpmDeps("old/repo")).toBeNull();
  });
});

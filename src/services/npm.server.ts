import { getCachedNpmDeps, setCachedNpmDeps } from "@/db/githubCache";

interface IDependency {
  repo?: string;
  description?: string;
}

const fetchJSON = async (url: string) => {
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`fetch ${url} failed with status ${response.status}`);
  }

  return response.json();
};

export const getPackageDependencies = async (fullName: string): Promise<IDependency[]> => {
  if (!fullName) {
    console.error("getPackageDependencies: invalid repo name");
    return [];
  }

  const cached = getCachedNpmDeps(fullName);
  if (cached) {
    console.log(`getPackageDependencies: cache hit for ${fullName}`);
    return cached;
  }

  try {
    const data = await fetchJSON(`https://cdn.jsdelivr.net/gh/${fullName}@latest/package.json`);
    const deps: Record<string, string> = { ...(data.dependencies || {}), ...(data.devDependencies || {}) };
    const entries = Object.entries(deps).slice(0, 50);

    console.error(`getPackageDependencies: found ${entries.length} dependencies for ${fullName}`);

    const results = await Promise.all(
      entries.map(([packageName, version]) => resolvePackage(packageName, version))
    );

    const filtered = results.filter((dep): dep is IDependency => dep !== null);

    console.error(`getPackageDependencies: resolved ${filtered.length}/${entries.length} dependencies for ${fullName}`);

    if (filtered.length > 0) {
      // truncate descriptions to save space in SQLite cache
      const trimmed = filtered.map(dep => ({
        repo: dep.repo,
        description: dep.description?.slice(0, 200) || ""
      }));
      setCachedNpmDeps(fullName, trimmed);
    }

    return filtered;
  } catch (e) {
    console.error("getPackageDependencies: error", e);
    return [];
  }
};

const resolvePackage = async (packageName: string, version: string): Promise<IDependency | null> => {
  try {
    if (packageName.startsWith("packages/") || version?.startsWith("link:")) {
      return null;
    }

    if (version.includes("https://github.com") && version.endsWith(".git")) {
      const repoName = transformUrlToRepoFullName(version);
      return await getDescriptionFromGithubByFullName(repoName);
    } else if (version.includes("github:") || version.includes("github.com:")) {
      return await getDescriptionFromGithubByFullName(version.split(":")[1]);
    } else if (packageName.startsWith("git@github.com:")) {
      return await getDescriptionFromGithubByFullName(version.split(":")[1]);
    } else {
      return await getRepoFullNameByPackageName(packageName);
    }
  } catch (e) {
    console.error(`resolvePackage: error for "${packageName}"`, e);
    return null;
  }
};

const getRepoFullNameByPackageName = async (packageName: string): Promise<IDependency | null> => {
  try {
    const data = await fetchJSON(`https://cdn.jsdelivr.net/npm/${packageName}/package.json`);

    const repoUrl = typeof data.repository === "string"
      ? data.repository
      : data.repository?.url;

    if (!repoUrl || !repoUrl.includes("github") || repoUrl.includes("packages/")) {
      return null;
    }

    const name = transformUrlToRepoFullName(repoUrl);

    if (!name || name.startsWith("packages/")) {
      return null;
    }

    return { repo: name, description: data.description || "" };
  } catch (e) {
    console.error(`getRepoFullNameByPackageName: error for "${packageName}"`, e);
    return null;
  }
};

const transformUrlToRepoFullName = (url: string) => {
  let nameWithoutProtocol = "";

  if (url.includes("ssh://") || (url.startsWith("git@") && !url.startsWith("git@github.com:"))) {
    return "";
  } else if (url.startsWith("git@github.com:")) {
    nameWithoutProtocol = url.replace("git@github.com:", "");
  } else if (url.startsWith("git://github.com/")) {
    nameWithoutProtocol = url.replace("git://github.com/", "");
  } else if (url.startsWith("github:")) {
    nameWithoutProtocol = url.replace("github:", "");
  } else if (url.startsWith("git+git@github.com:")) {
    nameWithoutProtocol = url.replace("git+git@github.com:", "");
  } else {
    const parts = url.split("/");
    nameWithoutProtocol = parts.slice(-2).join("/");
  }

  return nameWithoutProtocol.replace(".git", "");
};

const getDescriptionFromGithubByFullName = async (fullName: string): Promise<IDependency> => {
  if (!fullName) return { repo: fullName, description: "" };

  try {
    const data = await fetchJSON(`https://cdn.jsdelivr.net/gh/${fullName}@latest/package.json`);
    return { repo: fullName, description: data.description };
  } catch {
    return { repo: fullName, description: "" };
  }
};

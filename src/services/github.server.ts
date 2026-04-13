"use server"

import { Octokit } from "@octokit/rest";

import { getCachedMeta, setCachedMeta, RepositoryMeta, getCachedContributors, setCachedContributors, getCachedBannerExists, setCachedBannerExists, getCachedDependents, setCachedDependents } from "@/db/githubCache";
import { generateBannerCode } from "@/utils";
import { getActiveToken } from "@/utils/getActiveToken";
import { getRequestQueue, withRetry } from "@/lib/requestQueue";


export type { RepositoryMeta } from "@/db/githubCache";

export const getMetaInformation = async (fullName: string): Promise<RepositoryMeta | null> => {
  const [owner, repo] = fullName.split("/");

  if (!owner || !repo) {
    return null;
  }

  const cached = getCachedMeta(fullName);
  if (cached) {
    console.log('meta: we use cache');
    return cached;
  }

  const token = await getActiveToken('request');
  if (!token) {
    console.warn(`meta: no token available for ${fullName}, skipping API call`);
    return null;
  }

  const queue = getRequestQueue();

  try {
    const data = await queue.enqueue(withRetry(async () => {
      const githubRestClient = new Octokit({ auth: token });
      return (await githubRestClient.rest.repos.get({ owner, repo })).data;
    }));

    console.log('meta: we use api');

    const newRepoMetaData: RepositoryMeta = {
      name: repo,
      owner,
      last_update: Date.now(),
      description: data.description?.slice(0, 500) || null,
      language: data.language,
      stargazers_count: data.stargazers_count,
      forks_count: data.forks_count,
      license: data.license?.name || null,
      created_at: data.created_at,
      pushed_at: data.updated_at
    }

    setCachedMeta(fullName, newRepoMetaData);

    return newRepoMetaData;
  } catch (error: any) {
    if (error?.status === 404) {
      return null;
    }
    console.error(`github: queue request failed for ${fullName}:`, error?.message || error);
    throw error;
  }
}

export const getContributors = async (fullName: string) => {
  const [owner, repo] = fullName.split("/");

  if (!owner || !repo) {
    throw new Error("Invalid repository name");
  }

  const cached = getCachedContributors(fullName);
  if (cached) {
    console.log('contributors: we use cache');
    return cached;
  }

  const token = await getActiveToken('request');
  if (!token) {
    console.warn(`contributors: no token available for ${fullName}, skipping API call`);
    return [];
  }

  const queue = getRequestQueue();

  try {
    const data = await queue.enqueue(withRetry(async () => {
      const githubRestClient = new Octokit({ auth: token });
      return (await githubRestClient.rest.repos.listContributors({ owner, repo, per_page: 10 })).data;
    }));
    console.log('contributors: we use api');
    const newContributorsData = data.filter(d => d.login).map(({ login, contributions }) => ({ login: login || "Unknown", contributions }));

    setCachedContributors(fullName, newContributorsData);

    return newContributorsData;

  } catch (err: any) {
    console.error(`contributors: request failed for ${fullName}:`, err?.message || err);
    return [];
  }
}

let lastGitHubFetchTs = 0;
const MIN_FETCH_INTERVAL = 1000; // 1 second between requests

export async function getDependentsFromGitHub(fullName: string): Promise<{ name: string; description: string }[]> {
  const cached = getCachedDependents(fullName);
  if (cached) {
    console.log(`dependents: cache hit for ${fullName}`);
    return cached;
  }

  const now = Date.now();
  const timeSinceLastFetch = now - lastGitHubFetchTs;

  if (timeSinceLastFetch < MIN_FETCH_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_FETCH_INTERVAL - timeSinceLastFetch));
  }

  lastGitHubFetchTs = Date.now();

  const res = await fetch(
    `https://github.com/${fullName}/network/dependents`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    console.error(`getDependentsFromGitHub: HTTP ${res.status} for ${fullName}`);
    return [];
  }

  const html = await res.text();

  if (html.includes('captcha') || html.includes('cf-challenge')) {
    console.error(`getDependentsFromGitHub: captcha/challenge detected for ${fullName}`);
    return [];
  }

  if (!html.includes('Box-row')) {
    console.error(`getDependentsFromGitHub: unexpected HTML structure for ${fullName}, no Box-row found`);
    return [];
  }

  const results: { name: string; description: string }[] = [];
  const regex = /class="Box-row[\s\S]*?<a[^>]*href="\/([^"]+)"[^>]*>([^<]+)<\/a>\s*\/\s*\n\s*<a[^>]*class="text-bold"[^>]*href="\/([^"]+)"[^>]*>([^<]+)<\/a>/g;

  let match;
  while ((match = regex.exec(html)) !== null && results.length < 20) {
    const owner = match[1];
    const repo = match[4];
    results.push({ name: `${owner}/${repo}`, description: "" });
  }

  console.log(`getDependentsFromGitHub: found ${results.length} dependents for ${fullName}`);

  if (results.length > 0) {
    setCachedDependents(fullName, results);
  }

  return results;
}

export const getListOfDependentPackages = async (fullName: string) => {
  const dependents = await getDependentsFromGitHub(fullName).catch((err: unknown) => {
    console.error('error fetching dependents: ', err);
    return [];
  });

  return dependents.filter((d) => {
    const parts = d.name.split('/').filter(Boolean);
    return parts.length === 2 && parts[0] !== 'packages';
  });
}

export const checkBannerExists = async (fullNameProp: string): Promise<boolean> => {
  const fullName = fullNameProp.toLowerCase();

  const [owner, repo] = fullName.split("/");

  if (!owner || !repo) return false;

  const cached = getCachedBannerExists(fullName);
  if (cached !== null) {
    console.log('verification: use cache');
    return cached;
  }

  const token = await getActiveToken('request');
  if (!token) {
    console.warn(`verification: no token available for ${fullName}, skipping API call`);
    return false;
  }

  const queue = getRequestQueue();

  try {
    const content = await queue.enqueue(withRetry(async () => {
      const githubRestClient = new Octokit({ auth: token });
      return (await githubRestClient.rest.repos.getReadme({ owner, repo })).data;
    }));

    if (content.content) {
      const bannerCode = generateBannerCode(fullName);
      const readme = atob(content.content);
      const exists = readme?.includes(bannerCode) || false;
      console.log('verification: use api');

      setCachedBannerExists(fullName, exists);

      return exists;
    }
  } catch (e) {
    setCachedBannerExists(fullName, false);
    return false;
  }

  return false;
}

"use server"

import { Octokit } from "@octokit/rest";

import { getRepositoryContributorsCache } from "@/cache/repositoryContributors";
import { RepositoryMeta, getRepositoryMetaCache } from "@/cache/repositoryMeta"
import { getRepositoryBannerExistsCache } from "@/cache/bannerExists";
import { generateBannerCode } from "@/utils";
import { getActiveToken } from "@/utils/getActiveToken";

const META_DATA_EXPIRATION = 1000 * 60 * 60 * 24; // 1 day


export const getMetaInformation = async (fullName: string): Promise<RepositoryMeta | null> => {
  const cache = getRepositoryMetaCache();
  const cacheData = cache.get(fullName);
  const [owner, repo] = fullName.split("/");

  if (!owner || !repo) {
    return null;
  }

  if (cacheData && (cacheData.last_update + META_DATA_EXPIRATION >= Date.now())) {
    console.log('meta: we use cache')
    return cacheData;
  } else {
    const token = await getActiveToken('request');
    const githubRestClient = new Octokit({ auth: token });

    try {
      const { data } = await githubRestClient.rest.repos.get({
        owner,
        repo
      });

      console.log('meta: we use api');

      const newRepoMetaData: RepositoryMeta = {
        name: repo,
        owner,
        last_update: Date.now(),
        description: data.description,
        language: data.language,
        stargazers_count: data.stargazers_count,
        forks_count: data.forks_count,
        license: data.license?.name || null,
        created_at: data.created_at,
        pushed_at: data.updated_at
      }

      cache.set(fullName, newRepoMetaData);

      return newRepoMetaData;
    } catch (error: any) {
      if (error?.status === 404) {
        return null;
      }
      throw error;
    }

  }
}

export const getContributors = async (fullName: string) => {
  const cache = getRepositoryContributorsCache();
  const cacheData = cache.get(fullName);
  const [owner, repo] = fullName.split("/");

  if (!owner || !repo) {
    throw new Error("Invalid repository name");
  }

  if (cacheData && (cacheData.updated_at + META_DATA_EXPIRATION >= Date.now())) {
    console.log('contributors: we use cache')
    return cacheData.data;
  } else {
    const token = await getActiveToken('request');
    const githubRestClient = new Octokit({ auth: token });

    try {
      const { data } = await githubRestClient.rest.repos.listContributors({
        owner,
        repo,
        per_page: 10
      });
      console.log('contributors: we use api');
      const newContributorsData = data.filter(d => d.login).map(({ login, contributions }) => ({ login: login || "Unknown", contributions }));

      cache.set(fullName, {
        data: newContributorsData,
        updated_at: Date.now()
      });

      return newContributorsData;

    } catch {
      // throw new Error("Error: Repository not found");
      return [];
    }
  }
}

const DEPENDENTS_REVALIDATE_TS = 60 * 60 * 24 * 7 * 4 * 3; // 3 months

let lastGitHubFetchTs = 0;
const MIN_FETCH_INTERVAL = 1000; // 1 second between requests

export async function getDependentsFromGitHub(fullName: string): Promise<{ name: string; description: string }[]> {
  const now = Date.now();
  const timeSinceLastFetch = now - lastGitHubFetchTs;

  if (timeSinceLastFetch < MIN_FETCH_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_FETCH_INTERVAL - timeSinceLastFetch));
  }

  lastGitHubFetchTs = Date.now();

  const res = await fetch(
    `https://github.com/${fullName}/network/dependents`,
    { next: { revalidate: DEPENDENTS_REVALIDATE_TS } }
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

  console.error(`getDependentsFromGitHub: found ${results.length} dependents for ${fullName}`);
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

  const bannersCache = getRepositoryBannerExistsCache();
  const cacheData = bannersCache.get(fullName);

  const [owner, repo] = fullName.split("/");

  if (!owner || !repo) return false;

  const cacheIsExpired = cacheData ? (Date.now() - cacheData.ts) > (cacheData.exists ? 1000 * 60 * 60 * 24 * 7 : 1000 * 60 * 60 * 12) : true;

  if (cacheData && !cacheIsExpired) {
    console.log('verification: use cache')
    return cacheData.exists;
  } else {
    const token = await getActiveToken('request');
    const githubRestClient = new Octokit({ auth: token });

    try {
      const { data: content } = await githubRestClient.rest.repos.getReadme({
        owner,
        repo
      });

      if (content.content) {
        const bannerCode = generateBannerCode(fullName);
        const readme = atob(content.content);
        const exists = readme?.includes(bannerCode) || false;
        console.log('verification: use api')

        bannersCache.set(fullName, { ts: Date.now(), exists });

        return exists;
      }
    } catch (e) {
      bannersCache.set(fullName, { ts: Date.now(), exists: false });
      return false;
    }
  }

  return false;
}
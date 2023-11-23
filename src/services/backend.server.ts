"use server";

import { PopularRepository, getPopularRepositoriesCache } from "@/cache/popularRepositories";
import { IRepository } from "@/components/RepositoryList/interfaces";
import { getTokensCache } from "@/cache/tokens";
import { ITokenMeta } from './../store/slices/tokensSlice';

import appConfig from '@/appConfig';
import { responseToEvent } from "@/utils/responseToEvent";

const CACHE_EXPIRATION = 1000 * 60 * 60 * 1; // 1 hour

interface IGetPopularRepository {
  (limit?: number): Promise<IRepository[]>
}

interface ITransformToRepositoryObject {
  (popularRepositories?: PopularRepository[]): Promise<IRepository[]>
}

const transformToRepositoryObject: ITransformToRepositoryObject = (popularRepositories = []) => {
  return popularRepositories.map((repoData: PopularRepository) => {
    const [owner, repo] = repoData.full_name.split('/');

    return {
      owner,
      repo,
      description: repoData.info.description,
      language: repoData.info.language,
      starsCount: repoData.info.stargazers_count,
      forksCount: repoData.info.forks_count,
    }
  });
}

export const getPopularRepository: IGetPopularRepository = async (limit?: number) => {

  const cache = getPopularRepositoriesCache();

  const ts = cache.ts;

  if (ts && (ts + CACHE_EXPIRATION >= Date.now())) {

    if (limit) {
      return transformToRepositoryObject(Array.from(cache.data.values()).slice(0, limit));
    } else {
      return transformToRepositoryObject(Array.from(cache.data.values()));
    }
  }

  const response = await fetch(`${appConfig.BACKEND_API_URL}/popular`);
  const data = await response.json();

  data.data.forEach((repo: PopularRepository) => {
    cache.data.set(repo.full_name, repo);
  });

  cache.ts = Date.now();

  if (limit) {
    return transformToRepositoryObject(Array.from(cache.data.values()).slice(0, limit));
  } else {
    return transformToRepositoryObject(Array.from(cache.data.values()));
  }
}

interface IObyteTokens {
  [asset: string]: ITokenMeta;
}

const TOKEN_CACHE_EXPIRATION = 1000 * 60 * 30; // 30 minutes

export const getTokens = async () => {

  const cache = getTokensCache();

  const ts = cache.ts;

  if (ts && (ts + TOKEN_CACHE_EXPIRATION >= Date.now())) {
    return cache.data;
  }

  const response = await fetch(`${appConfig.BACKEND_API_URL}/tokens`);
  const data = await response.json();

  Object.entries(data.data.Obyte as IObyteTokens).forEach(([asset, meta]) => {
    cache.data.set(asset, meta);
  });

  cache.ts = Date.now();

  return cache.data;
}

export const getTotalRecentEvents = async (page: number = 1) => {
  const responses = await fetch(`${appConfig.BACKEND_API_URL}/recent/${page}`);
  const data = await responses.json();

  const events = await responseToEvent(data.data);

  return { events, pagination: data.pagination };

}

export const getRepoRecentEvents = async (fullName: string, page: number = 1) => {
  const responses = await fetch(`${appConfig.BACKEND_API_URL}/recent/${fullName}/${page}`);
  const data = await responses.json();

  const events = await responseToEvent(data.data);

  return { events, pagination: data.pagination };
}

export interface ISearchRepoItem {
  title: string;
  description: string;
}

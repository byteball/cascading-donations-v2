"use server";

export interface IExistsBanner {
  exists: boolean;
  ts: number;
}

const repositoryBannerExists = new Map<string, IExistsBanner>();

export const getRepositoryBannerExistsCache = () => repositoryBannerExists;
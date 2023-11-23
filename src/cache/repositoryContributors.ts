"use server";

export interface Contributor {
  login: string;
  contributions: number;
}

export interface IContributorData {
  data: Contributor[],
  updated_at: number;
}

const repositoryContributorsMap = new Map<string, IContributorData>();

export const getRepositoryContributorsCache = () => repositoryContributorsMap;
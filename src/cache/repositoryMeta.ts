"use server";

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

const repositoryMetaMap = new Map<string, RepositoryMeta>();

export const getRepositoryMetaCache = () => repositoryMetaMap;
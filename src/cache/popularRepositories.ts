"use server";

interface IData {
  data: Map<string, PopularRepository>,
  ts: number;
}

export interface PopularRepository {
  full_name: string;
  total_received_in_base: number;
  info: {
    created_at: string;
    description: string;
    forks_count: number;
    stargazers_count: number;
    language: string;
  }
}

const popularRepositoriesMap: IData = {
  data: new Map<string, PopularRepository>(),
  ts: 0
};

export const getPopularRepositoriesCache = () => popularRepositoriesMap;
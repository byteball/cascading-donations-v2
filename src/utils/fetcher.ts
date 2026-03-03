export const fetcher = (url: string) => fetch(url).then((res) => res.json());
export const dataFetcher = (url: string) => fetcher(url).then((res) => res.data);

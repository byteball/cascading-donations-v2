export interface IRepository {
  owner: string;
  repo: string;
  description?: string;
  language?: string;
  starsCount?: number;
  forksCount?: number;
}

export interface IRepositoryProps extends IRepository {
  className?: string;
}

export interface IRepositoryListProps {
  className?: string;
  data: IRepository[];
}

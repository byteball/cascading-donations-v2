import { FC } from "react";
import cn from "classnames";

import { Repository } from "./Repository";
import { IRepositoryListProps } from "./interfaces";

export const RepositoryList: FC<IRepositoryListProps> = ({ className, data = [] }) => {

  return <div className={cn(className)}>
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((repo) => (
        <Repository
          owner={repo.owner}
          key={repo.owner + repo.repo}
          repo={repo.repo}
          language={repo.language}
          forksCount={repo.forksCount}
          starsCount={repo.starsCount}
          description={repo.description}
        />
      ))}
    </div>
  </div>
}
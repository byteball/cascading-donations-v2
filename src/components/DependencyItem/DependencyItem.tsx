import Link from "next/link";
import { FC } from "react";

interface DependencyItemProps {
  repo: string;
  description?: string;
}

export const DependencyItem: FC<DependencyItemProps> = ({ repo, description }) => (<div className="flex relative z-20 items-center space-x-3 rounded-lg">
  <div className="flex-shrink-0">
    <img className="h-14 w-14 rounded-full" src={`https://avatars.githubusercontent.com/${repo!.split("/")[0]}`} alt={`Account's avatar`} />
  </div>

  <div className="min-w-0 flex-1">
    <div className="block w-full">
      <Link href={`/repo/${repo.toLowerCase()}`} className='font-medium text-md md:text-xl line-clamp-1 break-all'>{repo}</Link>
    </div>

    {description ? <div className="text-gray-500 line-clamp-3">
      {description}
    </div> : null}
  </div>
</div>)

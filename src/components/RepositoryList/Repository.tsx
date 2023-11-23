import { FC } from "react";
import Link from "next/link";

import { IRepositoryProps } from "./interfaces";
import { ForkIcon } from "../Icons";
import { truncate } from "@/utils";

export const Repository: FC<IRepositoryProps> = ({ owner, repo, description = "No description", starsCount = 0, forksCount = 0, language = "JavaScript" }) => {
  return <Link href={`/repo/${owner}/${repo}`} className="flex relative z-50 items-center space-x-3 rounded-lg">
    <div className="flex-shrink-0">
      <img className="h-14 w-14 rounded-full" src={`https://avatars.githubusercontent.com/${owner}`} alt={`${owner}'s account`} />
    </div>
    <div className="min-w-0 flex-1">
      <span className="absolute inset-0" aria-hidden="true" />
      <p className="text-lg font-medium text-gray-900 truncate">{truncate(`${owner}/${repo}`, 30)}</p>
      <p className="truncate text-md text-gray-500">{description}</p>
      <div className="flex text-sm text-gray-500 space-x-3">
        {language ? <div>{language}</div> : null}
        <div className="flex items-center space-x-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          <div className="">
            {starsCount}
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <ForkIcon className="h-4 w-4" aria-hidden="true" />

          <div className="truncate">
            {forksCount}
          </div>
        </div>
      </div>
    </div>
  </Link>
}
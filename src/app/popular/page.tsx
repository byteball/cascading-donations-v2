import Link from "next/link";
import { FC } from "react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Metadata } from "next";

import { SubTitle, Title } from "@/components";
import { ForkIcon } from "@/components/Icons";
import { IRepository } from "@/components/RepositoryList/interfaces";
import { getPopularRepository } from "@/services/backend.server";
import { getAvatarUrl } from "@/utils";
 
export const metadata: Metadata = {
  title: 'Kivach - Popular repositories',
  description: 'Cascading donations to github repositories. Support open-source projects with donations in crypto, and they will automatically forward a part of your donation to other open-source projects that made them possible.',
  openGraph: {
    images: ["/og/popular.png"]
  }
}

export default async () => {
  const popularRepositories = await getPopularRepository();

  return <div className="mt-12">
    <Title level={1}>Popular repositories</Title>

    <SubTitle level={1} className="mt-6">
      Github repositories most popular among Kivach donors.
    </SubTitle>

    <div className="grid md:grid-cols-2 grid-cols-1 mt-24 gap-10">

      {popularRepositories.map((data) => <PopularRepositoryFullCard
        key={`${data.owner}/${data.repo}`}
        {...data}
      />)}
    </div>
  </div>
}

interface IPopularRepositoryFullCardProps extends IRepository { }

const PopularRepositoryFullCard: FC<IPopularRepositoryFullCardProps> = ({ owner, repo, description = "No description", forksCount, language, starsCount }) => {

  return <div >
    <div className="bg-gray-50 p-5 rounded-xl space-x-10">
      <div>
        <img className="h-12 w-12 rounded-full mb-4" src={getAvatarUrl(owner)} alt={`${owner}'s account`} />

        <div className="space-y-2">
          <div className="flex items-center"><a href={`https://github.com/${owner}/${repo}`} target="_blank" rel="noopener" className="font-semibold text-2xl truncate">{`${owner}/${repo}`} <ArrowTopRightOnSquareIcon className="h-[1em] inline-block mt-[-0.1em]" /></a></div>
          <div className="text-gray-600 line-clamp-1">{description || "No description"}</div>
          <div className="flex sm:space-x-6 sm:space-y-0  space-y-2 sm:items-center text-sm flex-col sm:flex-row">
            <div>{language}</div>
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

              <div className="">
                {forksCount}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-primary">
          <Link href={`/repo/${owner}/${repo}`}>Donate now {"->"}</Link>
        </div>
      </div>
    </div>

  </div>
}
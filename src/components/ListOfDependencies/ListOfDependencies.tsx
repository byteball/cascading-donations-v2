"use server";

import Link from "next/link";
import { FC } from "react";

import { getPackageDependencies } from "@/services/npm.server";
import { Title } from "..";

interface IDependencies {
  owner: string;
  repo: string;
}

export const ListOfDependencies: FC<IDependencies> = async ({ owner, repo }) => {
  const dependencies = await getPackageDependencies(`${owner}/${repo}`);

  const filteredDependencies = dependencies.filter(d => d.repo).map((d)=> ({...d, key: d.name + (Math.random() + 1).toString(36).substring(2) }));

  if (filteredDependencies.length === 0) return null;

  return (
    <>
      <div className='mt-12'>
        <Title level={2}>Support the dependencies of {owner}/{repo}</Title>
      </div>


      <div className='max-w-5xl grid gap-8 md:grid-cols-2 xl:grid-cols-3 mt-8'>
        {filteredDependencies.map(({ repo, key, description }) => {
          const owner = repo!.split("/")[0];

          return (<div key={key} className="flex relative z-20 items-center space-x-3 rounded-lg">
            <div className="flex-shrink-0">
              <img className="h-14 w-14 rounded-full" src={`https://avatars.githubusercontent.com/${owner}`} alt={`${owner}'s account`} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="block w-full">
                <Link href={`/repo/${repo}`} className='font-medium text-md md:text-xl line-clamp-1'>{repo}</Link>
              </div>

              {description ? <div className="text-gray-500 line-clamp-3">
                {description}
              </div> : null}
            </div>
          </div>)
        })}
      </div>
    </>
  )
}

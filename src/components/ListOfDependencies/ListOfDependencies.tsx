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
        <Title level={2}>Support project dependencies</Title>
      </div>


      <div className='max-w-5xl grid gap-8 md:grid-cols-2 xl:grid-cols-3 mt-8'>
        {filteredDependencies.map(({ name, repo, key }) => {
          const owner = repo!.split("/")[0];

          return (<div key={key} className="flex relative z-50 items-center space-x-3 rounded-lg">
            <div className="flex-shrink-0">
              <img className="h-14 w-14 rounded-full" src={`https://avatars.githubusercontent.com/${owner}`} alt={`${owner}'s account`} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="block w-full">
                <Link href={`/repo/${repo}`} className='font-medium text-md md:text-xl text-ellipsis break-all'>{repo}</Link>
              </div>

              {name ? <div>
                <a href={`https://www.npmjs.com/package/${name}`} target="_blank" rel="noreferrer">
                  <svg className="inline mr-2 opacity-80" width="1.8em" height=".8em" viewBox="0 0 2500 975" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M60 0C26.8629 0 0 26.8629 0 60V774.941C0 808.079 26.8629 834.941 60 834.941H634.98C668.118 834.941 694.98 861.804 694.98 894.941V914.902C694.98 948.039 721.843 974.902 754.98 974.902H1190C1223.14 974.902 1250 948.039 1250 914.902V894.941C1250 861.804 1276.86 834.941 1310 834.941H2440C2473.14 834.941 2500 808.079 2500 774.941V60C2500 26.8629 2473.14 0 2440 0H60Z" fill="#9CA3AF" />
                    <path d="M415.059 139.961H199.961C166.824 139.961 139.961 166.824 139.961 199.961V634.98C139.961 668.118 166.824 694.98 199.961 694.98H355.059C388.196 694.98 415.059 668.118 415.059 634.98V339.922C415.059 306.785 441.921 279.922 475.059 279.922H495.02C528.157 279.922 555.02 306.785 555.02 339.922V634.98C555.02 668.118 581.882 694.98 615.02 694.98H634.98C668.118 694.98 694.98 668.118 694.98 634.98V199.961C694.98 166.824 668.118 139.961 634.98 139.961H415.059ZM894.941 139.961C861.804 139.961 834.941 166.824 834.941 199.961V774.941C834.941 808.079 861.804 834.941 894.941 834.941H1054.86C1088 834.941 1114.86 808.078 1114.86 774.941V754.98C1114.86 721.843 1141.73 694.98 1174.86 694.98H1329.96C1363.1 694.98 1389.96 668.118 1389.96 634.98V199.961C1389.96 166.824 1363.1 139.961 1329.96 139.961H894.941ZM1250 495.02C1250 528.157 1223.14 555.02 1190 555.02H1174.86C1141.73 555.02 1114.86 528.157 1114.86 495.02V339.922C1114.86 306.785 1141.73 279.922 1174.86 279.922H1190C1223.14 279.922 1250 306.785 1250 339.922V495.02ZM1805.02 139.961H1589.92C1556.78 139.961 1529.92 166.824 1529.92 199.961V634.98C1529.92 668.118 1556.78 694.98 1589.92 694.98H1745.02C1778.16 694.98 1805.02 668.118 1805.02 634.98V339.922C1805.02 306.785 1831.88 279.922 1865.02 279.922H1884.98C1918.12 279.922 1944.98 306.785 1944.98 339.922V634.98C1944.98 668.118 1971.84 694.98 2004.98 694.98H2024.94C2058.08 694.98 2084.94 668.118 2084.94 634.98V339.922C2084.94 306.785 2111.8 279.922 2144.94 279.922H2164.9C2198.04 279.922 2224.9 306.785 2224.9 339.922V634.98C2224.9 668.118 2251.77 694.98 2284.9 694.98H2304.86C2338 694.98 2364.86 668.118 2364.86 634.98V199.961C2364.86 166.824 2338 139.961 2304.86 139.961H1805.02Z" fill="white" />
                  </svg>

                  <span className="text-gray-500">
                    {name}
                  </span>
                </a>
              </div> : null}
            </div>
          </div>)
        })}
      </div>
    </>
  )
}

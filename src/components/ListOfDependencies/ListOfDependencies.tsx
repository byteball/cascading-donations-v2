"use server";

import { FC } from "react";

import { getPackageDependencies } from "@/services/npm.server";
import { Title } from "..";
import { DependencyItem } from "../DependencyItem/DependencyItem";

interface IDependencies {
  owner: string;
  repo: string;
}

const ListOfDependencies: FC<IDependencies> = async ({ owner, repo }) => {
  const dependencies = await getPackageDependencies(`${owner}/${repo}`);

  const filteredDependencies = dependencies.filter(d => d.repo).map((d) => ({ ...d, key: d.name + (Math.random() + 1).toString(36).substring(2) }));

  if (filteredDependencies.length === 0) return null;

  return (
    <>
      <div className='mt-24'>
        <Title level={2}>Support the dependencies of {owner}/{repo}</Title>
      </div>


      <div className='max-w-5xl grid gap-8 md:grid-cols-2 xl:grid-cols-3 mt-8'>
        {filteredDependencies.map(({ repo, key, description }) => {
          if (!repo) return null;

          return <DependencyItem
            repo={repo}
            key={key}
            description={description}
          />
        })}
      </div>
    </>
  )
}

export default ListOfDependencies;
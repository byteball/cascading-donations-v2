"use server";

import { FC } from "react";

import { getListOfDependentsPackages } from "@/services/npm.server";
import { Title } from "..";
import { DependencyItem } from "../DependencyItem/DependencyItem";

interface IListOfDependentsProps {
  owner: string;
  repo: string;
}

export const ListOfDependents: FC<IListOfDependentsProps> = async ({ owner, repo }) => {
  const dependents = await getListOfDependentsPackages(`${owner}/${repo}`);

  const filteredDependents = dependents.filter(d => d?.name).map((d) => ({ ...d, key: d.name + (Math.random() + 1).toString(36).substring(2) }));

  if (filteredDependents.length === 0) return null;

  return (
    <>
      <div className='mt-12'>
        <Title level={2}>Support the dependents repositories</Title>
      </div>

      <div className='max-w-5xl grid gap-8 md:grid-cols-2 xl:grid-cols-3 mt-8'>
        {filteredDependents.map(({ name, key, description }) => {
          if (!name) return null;

          return <DependencyItem
            repo={name}
            key={key}
            description={description}
          />
        })}
      </div>
    </>
  )
}

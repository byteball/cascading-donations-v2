import { FC } from "react";
import { notFound } from 'next/navigation';

import { Title } from "@/components";
import { ForkIcon } from "@/components/Icons";
import { DonateModal } from "@/modals/DonateModal";
import { checkBannerExists, getMetaInformation } from "@/services/github.server";
import { getAvatarUrl, truncate } from "@/utils";

import { SettingsButton } from "./SettingsButton";
import { VerificationIcon } from "@/components/VerificationIcon/VerificationIcon";
import { GithubLogoIcon } from "@/components/Icons/GithubLogo";
import appConfig from "@/appConfig";

interface IMetaProps {
  owner: string;
  repo: string;
}

export const Meta: FC<IMetaProps> = async ({ owner, repo }) => {
  let metaData;
  const bannerExists = await checkBannerExists(`${owner}/${repo}`);

  try {
    metaData = await getMetaInformation(`${owner}/${repo}`);
  } catch {
    return notFound();
  }

  if (!metaData) return notFound();

  const disabled = appConfig.DISABLED_REPOS.includes(`${owner}/${repo}`);

  return <>
    <div className="flex flex-col md:flex-row justify-between  md:items-center">

      <div className="flex flex-col md:flex-row justify-start md:items-center md:space-x-8 space-y-4 md:space-y-0">
        <img src={getAvatarUrl(owner)} className="rounded-full" width="70px" height="70px" alt={owner} />
        <Title level={1} displayAsLevel={2}>{truncate(`${owner}/${repo}`, 35)}</Title>
        {bannerExists ? <div><VerificationIcon /> </div> : null}
        <a href={`https://github.com/${owner}/${repo}`} target="_blank" rel="noopener nofollow"><GithubLogoIcon fill="#101827" className="h-8 w-8 stroke-gray-900" /></a>
      </div>

      <div className='flex space-x-4 md:mt-0 mt-4'>

        <SettingsButton owner={owner} repo={repo} />

        {!disabled ? <DonateModal
          owner={owner}
          repo={repo}
        /> : <div className="p-4 text-gray-900 border rounded-xl border-gray-900">This repository doesn't receive donations</div>}
      </div>
    </div>

    <p className="relative mt-6 text-lg leading-8 text-gray-600 max-w-3xl">
      {metaData.description}
    </p>

    <div className="flex flex-wrap text-md text-gray-500 gap-3 mt-2">
      {metaData.language ? <div>{metaData.language}</div> : null}

      <div className="flex items-center space-x-1">
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
        <div>
          {metaData.stargazers_count ?? 0}
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <ForkIcon className="h-4 w-4" aria-hidden="true" />
        <div>
          {metaData.forks_count ?? 0}
        </div>
      </div>

      <div>
        {metaData?.license ?? "No license"}
      </div>
    </div>
  </>
}
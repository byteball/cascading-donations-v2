'use client';

import { useRouter } from "next/navigation";
import { FC } from "react";

import { SettingsIcon } from "@/components/Icons"
import { useSelector } from "@/store";
import { selectWalletGithubAccounts } from "@/store/slices/settingsSlice";

interface ISettingsButtonProps {
  owner: string;
  repo: string;
}

export const SettingsButton: FC<ISettingsButtonProps> = ({ owner, repo }) => {
  const accounts = useSelector(selectWalletGithubAccounts);

  const router = useRouter();

  if (accounts.includes(owner)) {
    return <button onClick={() => router.push(`/settings/${owner}/${repo}`)}>
      <SettingsIcon className='w-6 h-6' />
    </button>
  } else {
    return null
  };
}
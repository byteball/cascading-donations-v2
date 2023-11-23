"use client";

import { FC } from "react";
import { FacebookIcon, FacebookShareButton, LinkedinIcon, LinkedinShareButton, TelegramIcon, TelegramShareButton, TwitterShareButton, XIcon } from "react-share";

interface ISharesProps {
  owner: string;
  repo: string;
}

export const Shares: FC<ISharesProps> = ({ owner, repo }) => {
  const url = `https://kivach.org/repo/${owner}/${repo}`;
  const title = `Support ${owner}/${repo} on Kivach`;
  const size = 24;

  return <div className="mt-8">
    <div className="mb-2 flex flex-col md:flex-row md:space-x-6">
      <div>Share with your subscribers:</div>
      <div className="flex gap-4 mt-2 md:mt-0">

        <TwitterShareButton title={title} url={url} >
          <XIcon size={size} round />
        </TwitterShareButton>

        <TelegramShareButton
          url={url}
          title={title}
        >
          <TelegramIcon size={size} round />
        </TelegramShareButton>

        <FacebookShareButton
          url={url}
          title={title}
        >
          <FacebookIcon size={size} round />
        </FacebookShareButton>

        <LinkedinShareButton
          url={url}
          title={title}
        >
          <LinkedinIcon size={size} round />
        </LinkedinShareButton>
      </div>
    </div>

  </div>
}

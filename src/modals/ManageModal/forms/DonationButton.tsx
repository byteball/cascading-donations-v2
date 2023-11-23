import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { FC } from "react";

import appConfig from "@/appConfig";
import { Input } from "@/components";
import { generateBannerCode } from "@/utils";

interface IDonationButtonProps {
  owner: string;
  repo: string;
}

export const DonationButton: FC<IDonationButtonProps> = ({ owner, repo }) => {
  const fullName = `${owner}/${repo}`.toLowerCase();

  const code = generateBannerCode(fullName);

  return <div>
    <div className="mt-4">
      To request donations and display a fully setup checkmark <CheckCircleIcon className="w-[1.5em] h-[1.5em] inline text-primary" /> next to your repo, please add this code to your README.md:
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 mt-4 gap-4">
      <div>
        <Input copy copyText={code} value={code} />
      </div>

      <div>
        <img src={`${appConfig.BACKEND_API_URL}/banner?repo=${fullName}`} alt="Cascading donations" />
      </div>
    </div>
  </div>
}

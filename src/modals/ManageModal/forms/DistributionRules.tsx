import { useSelector } from "react-redux";
import { isEmpty } from "lodash";
import cn from "classnames";
import { MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { FC, useEffect, useState, useRef } from "react"
import { useSession, signIn } from "next-auth/react";

import { Button, Input, Search } from "@/components";
import { IRules } from "@/utils/getRepoRules";
import { QRButton } from "@/components/QRButton/QRButton";
import { GithubLogoIcon } from "@/components/Icons/GithubLogo";
import { generateLink, getCountOfDecimals, getRandomString } from "@/utils";
import appConfig from "@/appConfig";
import { selectWalletAddress } from "@/store/slices/settingsSlice";
import { sendGAEvent } from "@/gtag";

interface IDistributionRulesProps {
  rules: IRules | null;
  owner: string;
  repo: string;
  addBtn?: boolean;
}

interface ICurrentRuleState {
  repo: string;
  percent: number;
  key?: string;
}

const initialRuleItem: ICurrentRuleState = {
  repo: "",
  percent: 0,
}

interface IFormattedRules {
  [repo: string]: number;
}

export const DistributionRules: FC<IDistributionRulesProps> = ({ owner, repo, rules, addBtn = false }) => {
  const [currentRules, setCurrentRules] = useState<ICurrentRuleState[]>([]);
  const fullName = `${owner}/${repo}`.toLowerCase();
  const { status } = useSession();
  const btnRef = useRef<any>(null);

  const walletAddress = useSelector(selectWalletAddress);

  const percentSum = currentRules.reduce((acc, rule) => acc + Number(rule.percent || 0), 0)
  const ownerPercent = 100 - percentSum;

  useEffect(() => {
    if (rules) {
      setCurrentRules(Object.entries(rules).filter(([repo])=> repo !== fullName ).map(([repo, percent]) => ({ repo, percent, key: getRandomString() }) as ICurrentRuleState));
    } else {
      setCurrentRules([{ ...initialRuleItem, key: getRandomString() }]);
    }
  }, [rules]);

  const handleChangePercent = (value: any, index: number) => {
    const newRules = [...currentRules];
    newRules[index].percent = (value === "." || value === ",") ? "0." : value;
    const reg = /^[0-9.]+$/;

    if ((value && value.split(".").length <= 2 && (reg.test(String(value)) && getCountOfDecimals(value) <= 4)) && Number(value) < 1000 || value === "") {
      setCurrentRules(newRules);
    }
  }

  const removeRule = (index: number) => {
    const newRules = [...currentRules]
    newRules.splice(index, 1);
    setCurrentRules(newRules);
  }

  const changeRepo = (index: number, newRepoFullName: string) => {
    if (newRepoFullName.toLowerCase() !== fullName) {
      const newRules = [...currentRules]
      newRules[index].repo = newRepoFullName.toLowerCase();

      setCurrentRules(newRules);
    }
  }

  const handleEnter = (ev: React.KeyboardEvent) => {
    if (ev.key === "Enter" && btnRef.current) {
      btnRef.current.click();
    }
  }

  const formattedRules: IFormattedRules = {};

  currentRules.forEach(({ repo, percent }) => formattedRules[repo] = Number(percent));

  const link = generateLink({ amount: 1e4, aa: appConfig.AA_ADDRESS!, data: { set_rules: 1, repo: String(fullName).toLowerCase(), rules: !isEmpty(formattedRules) ? formattedRules : false }, from_address: walletAddress });
  const validRules = !currentRules.find(r => r.percent <= 0 || r.percent > 100 || !r.repo);

  const handleClick = () => {
    sendGAEvent({
      category: "Manage",
      action: "Set rules",
      label: fullName
    })
  }

  return <div>
    <div className="text-gray-700">
      <p className="mt-4">All the funds donated to your repo will be distributed between you and other repos you want to support.</p>
      <p className="mt-4">Please add <b>up to 10 other repos</b> you want to support and the percentages of the donated funds that will be forwarded to them. For example, you may want to add your most important dependencies (both direct and indirect) that made your work possible, platforms you use, developer tools, and the repos of your main contributors.</p>
    </div>

    <div className="relative">
      <div className={cn("relative", { "blur-md pointer-events-none": status !== "authenticated" })}>
        <div className="grid mt-4">
          <div className="flex w-full gap-4">
            <div className="w-full flex-grow-0">
              <Input value={fullName} disabled />
            </div>

            <div className="">
              <Input disabled className="w-[110px]" value={ownerPercent < 0 ? 0 : +ownerPercent.toFixed(4)} suffix="%" />
            </div>

            <div className="w-[30px] h-[30px] flex-shrink-0" />
          </div>
        </div>

        {currentRules.slice(0, status === "authenticated" ? currentRules.length : 2).map((rule, index) => <div key={rule.key} className="grid mt-4">
          <div className="flex w-full gap-4 items-center">
            <div className="w-full flex-grow-0">
              <Search error={!rule.repo} value={rule.repo} onChange={(fullName) => changeRepo(index, fullName)} />
            </div>
            <div>
              <Input suffix="%" onKeyDown={handleEnter} className="w-[110px]" value={rule.percent} error={Number(rule.percent) > 100 || rule.percent <= 0} onChange={(ev) => handleChangePercent(ev.target.value, index)} />
            </div>
            <div className="w-[30px] h-[30px] flex-shrink-0">
              <button onClick={() => removeRule(index)}>
                <MinusCircleIcon className="stroke-red-300 hover:stroke-red-500 stroke-1 w-[30px] h-[30px]" />
              </button>
            </div>
          </div>
        </div>)}

        <Button block icon={<PlusCircleIcon className="w-[1.2em] h-[1.2em] mr-2" />} disabled={currentRules.length >= 10} className="mt-4 w-full" dashed type="light" onClick={() => setCurrentRules((cr) => [...cr, { ...initialRuleItem, key: getRandomString() }])}>Add recipient</Button>
      </div>

      {status !== "authenticated" && <div className="absolute top-0 h-full bg-gray-500/10 z-50 w-full p-6 rounded-xl flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="mb-2"> <Button icon={<GithubLogoIcon className="w-[1.5em] mr-2" />} onClick={() => signIn("github", { redirect: false })}>Log in with Github</Button></div>
          <p className="text-center text-xs text-gray-500 leading-1">
            We do not collect your data, <br /> this authorization is needed to increase <a className="text-primary" target="_blank" rel="noopener" href="https://docs.github.com/en/rest/overview/resources-in-the-rest-api?apiVersion=2022-11-28#rate-limiting">the rate limit</a>
          </p>
        </div>
      </div>}
    </div>

    {percentSum > 100 && <div className="mt-4 text-red-500">
      The maximum cumulative percentage must not exceed 100
    </div>}

    <QRButton ref={btnRef} className="mt-4" type="primary" href={link} disabled={percentSum > 100 || !validRules} onClick={handleClick}>{addBtn ? "Add and save" : "Save"} rules</QRButton>
  </div>
}
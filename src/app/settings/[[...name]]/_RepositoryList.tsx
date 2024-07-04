"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { FC, useEffect, useState } from "react"
import cn from "classnames";
import { Octokit } from "@octokit/rest";
import { useDebounce } from "usehooks-ts";
import useSWR from 'swr';

import { Button, Input, Select, Spin } from "@/components";
import { useSelector } from "@/store";
import { generateBannerCode, getAvatarUrl } from "@/utils";
import { ManageModal } from "@/modals";
import { selectWalletAddress, selectWalletGithubAccounts, selectWalletGithubAccountsPersisted, selectWalletWasPersisted } from "@/store/slices/settingsSlice";

import appConfig from "@/appConfig";
import { getTokens } from "@/store/slices/tokensSlice";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
interface IRepositoryData {
  full_name: string;
  description: string | null;
  license: string | null;
  stargazers_count: number;
  fork: boolean;
  updated_at: string | null;
  fullSetup?: boolean;
}
interface IRepositoriesState {
  data: IRepositoryData[];
  loading: boolean;
  loaded: boolean;
  currentAccount?: string;
}


const fetcher = (url: string) => fetch(url).then((res) => res.json()).then((res) => res.data);
interface IRepositoryListProps {
  repo?: string;
  owner?: string;
}

export const RepositoryList: FC<IRepositoryListProps> = ({ repo, owner }) => {

  const walletAddress = useSelector(selectWalletAddress);
  const githubAccounts = useSelector(selectWalletGithubAccounts);

  const walletAddressIsPersisted = useSelector(selectWalletWasPersisted);
  const githubAccountsArePersisted = useSelector(selectWalletGithubAccountsPersisted);

  const tokens = useSelector(getTokens);

  const [page, setPage] = useState<number>(1);
  const [countOnPage, setCountOnPage] = useState<number>(20);
  const [query, setQuery] = useState<string>(repo || "");
  const { data: githubSession } = useSession();

  const [currentAccount, setCurrentAccount] = useState<string | null>();
  const [repositories, setRepositories] = useState<IRepositoriesState>({ data: [], loading: true, loaded: false });
  const { data, error, isLoading } = useSWR(currentAccount && walletAddress ? `/napi/settings/${currentAccount}` : null,
    fetcher,
    {
      refreshInterval: 1000 * 60 * 25, // refresh every 25 minutes
      revalidateOnReconnect: true,
      dedupingInterval: 1000 * 60 * 5, // dedupe requests with the same key every 5 minutes
      fallbackData: {
        rules: {},
        pools: {},
        notificationAas: {}
      }
    });

  if (error) {
    console.error(error);
  }

  const { rules: rulesByOwner, pools, notificationAas } = data;

  const sortFunc = (a: any, b: any) => {
    const aName = String(a.full_name).toLowerCase();
    const bName = String(b.full_name).toLowerCase();

    const pointsForRules = (bName in rulesByOwner ? 1 : 0) - (aName in rulesByOwner ? 1 : 0)

    return (Object.keys(pools[String(b.full_name).toLowerCase()] || {}).length - Object.keys(pools[String(a.full_name).toLowerCase()] || {}).length) + pointsForRules
  }


  const sortFonds = (a: any, b: any) => {
    const [asset1, amount1] = a;
    const [asset2, amount2] = b;

    const token1 = tokens.Obyte[asset1];
    const token2 = tokens.Obyte[asset2];

    if (token1 && token2) {
      return (amount2 * 10 ** token2.decimals) * (token2.price || 0) - (amount1 * 10 ** token1.decimals) * (token1.price || 0)
    } else if (!token1 && !token2) {
      return 0;
    } else if (token2 && !token1) {
      return 1;
    } else {
      return -1;
    }
  }

  // init account
  useEffect(() => {

    setCurrentAccount(githubAccounts[0]);

    if (!currentAccount) {
      setPage(1);
    }
  }, [githubAccounts]);

  const update = async (page: number = 1) => {
    if (!currentAccount) return null;

    const githubRestClient = new Octokit({ auth: githubSession?.access_token });

    if (currentAccount) {
      const data: any[] = await githubRestClient.rest.repos.listForUser({
        username: currentAccount,
        per_page: 100,
        page,
        sort: "updated",
      }).then(async (res) => res.data.map(({ full_name, description, license, stargazers_count, fork, updated_at }) => ({ full_name, description, license, stargazers_count, fork, updated_at })));

      if (githubSession?.access_token) {
        const fullSetupCheckerGetters = data.map(({ full_name }, index: number) => {
          return githubRestClient.rest.repos.getReadme({
            owner: currentAccount,
            repo: full_name.split("/")[1]
          }).then(({ data: content }) => {
            const code = generateBannerCode(full_name.toLowerCase());
            const readme = atob(content.content);
            data[index].fullSetup = readme?.includes(code) || false;
          }).catch(() => {
            data[index].fullSetup = false;
          });
        });

        await Promise.all(fullSetupCheckerGetters);
      }

      setRepositories((d) => ({ ...d, data: [...d.data, ...data], loading: data.length >= 100, loaded: data.length < 100, currentAccount }));

      if (data.length >= 100) {
        await update(page + 1);
      }
    }
  }

  const queryDebounced = useDebounce(query, 800);

  useEffect(() => {
    update(1);
  }, [currentAccount])

  const statuses = {
    complete: 'text-green-700 bg-green-50 ring-green-600/20',
    has_donations: 'text-gray-600 bg-gray-50 ring-gray-500/10',
    no_rules: 'text-yellow-800 bg-yellow-50 ring-yellow-600/20',
  }

  if (!walletAddressIsPersisted || isLoading || !githubAccountsArePersisted) return <div className="flex justify-center mt-8">
    <Spin size="large" />
  </div>;

  const sortedRepos = repositories.data.sort(sortFunc).filter(({ full_name }) => !queryDebounced || full_name.toLowerCase().includes(query.toLowerCase()));

  return <div className="mt-6">
    {!walletAddress ? <div>
      <p>Your repo can receive donations already now, without any setup. However, to set up your own distribution rules and withdraw the donated money, you need to prove ownership of the repo and link it to your wallet.</p>
      <p className="mt-4">As the first step, please <Link href="/settings?walletModal=1" className="text-primary">add your wallet</Link> to the site.</p>
    </div> : <div>

      {githubAccounts.length === 0 ? <div>
        <p className="mb-4">To link your wallet with your github account, you need to get an attestation.</p>
        <p className="mb-4">Please <a className="text-primary" target="_blank" rel="noopener" href={appConfig.ATTESTOR_PAIRING_URL}>pair with the GitHub attestation bot</a> in your Obyte wallet and follow its instructions. The bot will ask you to authenticate with your github account and sign a message with your Obyte address. Choose <i>public</i> attestation when asked by the bot. Then, the bot will post an attestation transaction.</p>
        <img src="/bot.jpg" alt="Attestation bot" style={{ maxWidth: 360 }} />
        <p className="mb-4">After successful attestation, you will automatically proceed to the next step.</p>
      </div> : <div className="w-full mt-8">
        <div className="flex flex-wrap md:flex-nowrap">
          <div className="flex gap-y-4 gap-x-8 basis-2/3 flex-wrap">

            {githubAccounts.map((account) => <div key={account} onClick={() => setCurrentAccount(account)} className={cn("flex space-x-2 cursor-pointer items-center rounded-2xl  px-4 py-2", currentAccount === account ? "bg-gray-950 text-white" : "bg-gray-100")}>
              <img className="w-8 h-8 rounded-full" src={getAvatarUrl(account)} />
              <div>{account}</div>
            </div>)}
          </div>

          <div className="basic-1 md:basis-1/3 mt-5 md:mt-0">
            <div className="flex justify-end gap-4">
              <div>
                <Input placeholder="Search by name" value={query} onChange={(ev: any) => setQuery(ev.target.value)} />
              </div>
              <div>
                <Select value={countOnPage} className="w-[100px]" search={false} onChange={(v) => setCountOnPage(v)}>
                  <Select.Option value={10}>10</Select.Option>
                  <Select.Option value={20}>20</Select.Option>
                  <Select.Option value={30}>30</Select.Option>
                  <Select.Option value={50}>50</Select.Option>
                  <Select.Option value={100}>100</Select.Option>
                </Select>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-8">

          {repositories.loading ? <div className="flex justify-center">
            <Spin size="large" />
          </div> : <div>
            {sortedRepos.length > 0 ? sortedRepos.slice(0, countOnPage * page).map(({ full_name, description, fullSetup }) => <div key={full_name} className="divide-y divide-gray-100">
              <li className="flex md:items-center justify-between gap-x-6 py-5 flex-col md:flex-row ">
                <div className="min-w-0 w-auto md:w-[600px]">
                  <div className="flex items-start gap-x-3 gap-y-1 flex-wrap md:flex-nowrap ">
                    <a className="text-sm font-semibold leading-6 text-gray-900" href={`https://github.com/${full_name}`} target="_blank" rel="noopener">{full_name}</a>
                    {fullSetup ? <CheckCircleIcon className="w-[1.5em] h-[1.5em] inline text-primary" /> : null}
                    {String(full_name).toLowerCase() in rulesByOwner ? null : <p
                      className={cn(
                        statuses["no_rules"],
                        'rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset'
                      )}
                    >
                      No distribution rules
                    </p>}

                    {String(full_name).toLowerCase() in pools && <p
                      className={cn(
                        statuses["complete"],
                        'rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset'
                      )}
                    >
                      New donations
                    </p>}
                  </div>
                  <div className="mt-1 flex items-center gap-x-2 text-sm leading-5 text-gray-500">
                    <p className="line-clamp-2 max-w-3xl">{description}</p>
                  </div>

                  <div className="mt-1 flex items-center flex-wrap gap-x-2 text-xs leading-5 text-gray-500 md:hidden">

                    {/* <p className="whitespace-nowrap">
                      Updated at {moment(updated_at).format("LLL")} */}
                    {/* <time dateTime={project.dueDateTime}>{project.dueDate}</time> */}
                    {/* </p> */}

                    {Object.entries(pools[full_name.toLowerCase()] || {}).sort(sortFonds).map(([asset, amount]: any, index) => <>
                      {index ? <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
                        <circle cx={1} cy={1} r={1} />
                      </svg> : null}
                      <p> {
                        tokens.Obyte[asset] ? `${amount / (10 ** tokens.Obyte[asset].decimals)} ${tokens.Obyte[asset].symbol}` : null
                      }</p>
                    </>)}
                  </div>
                </div>
                <div className="min-w-[200px] space-y-[5px] text-gray-500 justify-end text-xs hidden md:block">
                  {Object.entries(pools[full_name.toLowerCase()] || {}).sort(sortFonds).slice(0, 5).map(([asset, amount]: any) => <>
                    <div key={asset}> {
                      tokens.Obyte[asset] ? `${amount / (10 ** tokens.Obyte[asset].decimals)} ${tokens.Obyte[asset].symbol}` : null
                    }</div>
                  </>)}

                  {Object.values(pools[full_name.toLowerCase()] || {}).length > 5 ? <div>...</div> : null}

                </div>
                <div className="flex flex-none items-center gap-x-4 mt-4 md:mt-0">
                  <ManageModal
                    open={!!(repo && owner) && full_name.toLowerCase() === `${owner}/${repo}`}
                    notificationsAA={notificationAas[String(full_name).toLowerCase()] || null}
                    owner={full_name.split("/")[0]}
                    repo={full_name.split("/")[1]}
                    rules={rulesByOwner[String(full_name).toLowerCase()] || null}
                    pools={pools[String(full_name).toLowerCase()] || null}
                  />
                </div>
              </li>
            </div>) : <div>
              <p className="text-center text-gray-500">No repositories found</p>
            </div>}

            {sortedRepos.length >= countOnPage * page ? <div className="flex justify-center gap-4">
              <Button onClick={() => setPage(p => p + 1)}>
                Load more
              </Button>
            </div> : null}
          </div>}
        </div>
      </div>}
    </div>}
  </div>
}

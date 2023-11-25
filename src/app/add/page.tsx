"use client";

import { useSelector } from "react-redux";
import { CheckCircleIcon } from '@heroicons/react/20/solid'
import { useEffect, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import cn from "classnames";
import { useSession } from "next-auth/react";
import { Octokit } from "@octokit/rest";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import { Select, Spin, SubTitle, Title } from "@/components";
import { selectWalletAddress, selectWalletGithubAccounts, selectWalletGithubAccountsPersisted, selectWalletWasPersisted } from "@/store/slices/settingsSlice";
import { getAvatarUrl } from "@/utils";
import appConfig from "@/appConfig";
import { DistributionRules } from "@/modals/ManageModal/forms/DistributionRules";
import { DonationButton } from "@/modals/ManageModal/forms/DonationButton";

interface IRepositoryData {
	full_name: string;
	description: string | null;
	license: string | null;
	stargazers_count: number;
	fork: boolean;
	updated_at: string | null;
}

interface IRepositoriesState {
	data: IRepositoryData[];
	loading: boolean;
	loaded: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json()).then((res) => res.data);

export default () => {
	let status = '';
	const walletAddress = useSelector(selectWalletAddress);
	const githubAccounts = useSelector(selectWalletGithubAccounts);

	const walletAddressIsPersisted = useSelector(selectWalletWasPersisted);
	const githubAccountsArePersisted = useSelector(selectWalletGithubAccountsPersisted);

	const [currentRepo, setCurrentRepo] = useState<string | null>();
	const [currentAccount, setCurrentAccount] = useState<string | null>();
	const [repositories, setRepositories] = useState<IRepositoriesState>({ data: [], loading: false, loaded: false });

	const { data: githubSession } = useSession();

	const { data, error, isLoading } = useSWR(currentAccount && walletAddress ? `/api/settings/${currentAccount}` : null,
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

	if (walletAddress) {
		if (!githubAccounts.length) {
			status = 'attestation'
		} else {
			status = 'configuration'
		}
	} else {
		status = 'wallet'
	}


	// init account
	useEffect(() => {
		setCurrentAccount(githubAccounts[0]);
	}, [githubAccounts]);

	const update = () => {
		setRepositories({ data: [], loading: true, loaded: false });

		const githubRestClient = new Octokit({ auth: githubSession?.access_token });

		try {
			if (currentAccount) {

				githubRestClient.rest.repos.listForUser({
					username: currentAccount,
					per_page: 500,
					page: 1,
					sort: "updated",
				}).then((res) => {
					const data = res.data.map(({ full_name, description, license, stargazers_count, fork, updated_at }) => ({ full_name, description, license, stargazers_count, fork, updated_at }))
					setRepositories({ data, loading: false, loaded: true });
				});
			}
		} catch (e) {
			console.error('error', e)
		}

	}

	useEffect(() => {
		setCurrentRepo(null);
		update();
	}, [currentAccount])

	const steps = [
		{ name: 'Add wallet', status: status === 'wallet' ? 'current' : 'complete' },
		{ name: 'Attestation', status: status === 'attestation' ? 'current' : (status === "configuration" ? 'complete' : 'upcoming') },
		{ name: 'Configuration', status: status === 'configuration' ? 'current' : 'upcoming' },
	];

	const [owner, repo] = (currentRepo || "").split("/");

	if (!walletAddressIsPersisted || !githubAccountsArePersisted || walletAddress && githubAccounts.length && isLoading) return <div className="mt-12">
		<Title level={1}>Add repository</Title>

		<div className="mt-5 flex justify-center">
			<Spin size="large" />
		</div>
	</div>

	return <div className="mt-12">
		<Title level={1}>Add repository</Title>

		<nav className="mt-4 mb-8 select-none" aria-label="Progress">
			<ol role="list" className="gap-4 flex flex-col md:flex-row">
				{steps.map((step, index) => (
					<li key={step.name}>
						{step.status === 'complete' ? (
							<div className="group">
								<span className="flex items-center">
									<span className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center">
										<CheckCircleIcon
											className="h-full w-full text-primary"
											aria-hidden="true"
										/>
									</span>
									<span className="ml-3 text-md font-medium text-gray-950 ">
										{step.name}
									</span>
									{index !== steps.length - 1 && <ChevronRightIcon className="hidden md:block h-8 w-8 stroke-gray-400 ml-4" />}
								</span>

								{index !== steps.length - 1 && <ChevronDownIcon className="block md:hidden h-8 w-8 stroke-gray-400" />}

							</div>
						) : step.status === 'current' ? (
							<>
								<div className="flex items-center" aria-current="step">
									<span className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center" aria-hidden="true">
										<span className="absolute h-6 w-6 rounded-full bg-indigo-200" />
										<span className="relative block h-3 w-3 rounded-full bg-primary" />
									</span>
									<span className="ml-3 text-md font-medium text-primary">{step.name}</span>
									{index !== steps.length - 1 && <ChevronRightIcon className="hidden md:block h-8 w-8 stroke-gray-400 ml-4" />}
								</div>
								{index !== steps.length - 1 && <ChevronDownIcon className="block md:hidden h-8 w-8 stroke-gray-400" />}
							</>
						) : (
							<div className="group">
								<div className="flex items-center">
									<div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center" aria-hidden="true">
										<div className="h-4 w-4 rounded-full bg-gray-300 " />
									</div>
									<p className="ml-3 text-md font-medium text-gray-400">{step.name}</p>
									{index !== steps.length - 1 && <ChevronRightIcon className="hidden md:block h-8 w-8 stroke-gray-400 ml-4" />}
									{index !== steps.length - 1 && <ChevronDownIcon className="block md:hidden h-8 w-8 stroke-gray-400" />}
								</div>
							</div>
						)}
					</li>
				))}
			</ol>
		</nav>


		{!walletAddress ? <div>
			<p>Your repo can receive donations already now, without any setup. However, to set up your own distribution rules and withdraw the donated money, you need to prove ownership of the repo and link it to your wallet.</p>
			<p className="mt-4">As the first step, please <Link href="/settings?walletModal=1" className="text-primary">add your wallet</Link> to the site.</p>
		</div> : <div>

			{githubAccounts.length === 0 ? <div>
				<p className="mb-4">To link your wallet with your github account, you need to get an attestation.</p>
				<p className="mb-4">Please <a className="text-primary" target="_blank" rel="noopener" href={appConfig.PAIRING_URL}>pair with the GitHub attestation bot</a> in your Obyte wallet and follow its instructions. The bot will ask you to authenticate with your github account and sign a message with your Obyte address. Choose <i>public</i> attestation when asked by the bot. Then, the bot will post an attestation transaction.</p>
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
				</div>

				<div className="mt-8">
					{repositories.loading ? <div className="flex justify-center">
						<Spin size="large" />
					</div> : <div className="max-w-4xl">
						<Select onChange={(repo) => setCurrentRepo(repo.toLowerCase())} placeholder="Select the repository to add" value={currentRepo} >
							{repositories.data.map(({ full_name }) => {
								const v = full_name.toLowerCase();
								return <Select.Option key={v} value={v}>{v}</Select.Option>;
							})}
						</Select>

						{currentRepo && <div className="mt-8">
							<Title level={3}>Set up distribution rules for {currentRepo}</Title>

							<DistributionRules addBtn owner={owner} repo={repo} rules={data.rules[currentRepo]} />


							<Title level={3} className="mt-8">Donation button for {currentRepo}</Title>
							<DonationButton owner={owner} repo={repo} />
						</div>}
					</div>}
				</div>
			</div>}
		</div>}
	</div>
}
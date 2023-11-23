import { FC } from "react";

import { getContributors } from "@/services/github.server";
import { getAvatarUrl } from "@/utils";

interface ContributionsProps {
	owner: string;
	repo: string;
}

export const Contributions: FC<ContributionsProps> = async ({ owner, repo }) => {
	const contributions = await getContributors(`${owner}/${repo}`);

	if (!contributions.length) return <div className='text-gray-400 mt-8'>No contributors yet</div>

	return (
		<div className='max-w-5xl mt-8'>
			<div className='grid gap-8 md:grid-cols-2 xl:grid-cols-3'>
				{contributions.map(({ login, contributions }) => <div key={login} className='flex space-x-4'>
					<div className="flex-shrink-0">
						<img className="h-12 w-12 rounded-full" src={getAvatarUrl(login)} alt={`${login}'s profile`} />
					</div>
					<div>
						{login !== "Unknown"
							? <a href={`https://github.com/${login}`} target="_blank" rel="noopener" className='font-medium text-md md:text-xl'>{login}</a>
							: <span className='font-medium text-md md:text-xl'>{login}</span>
						}
						<div className='text-sm md:text-md'><b>{contributions ?? 0}</b> contributions</div>
					</div>
				</div>)}
			</div>
		</div>
	)
}

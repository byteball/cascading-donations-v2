// Opt out of caching for all data requests in the route segment
export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import dynamicLoader from 'next/dynamic';

import { RecentEvents, SubTitle, Title } from "@/components"

import { Meta } from '../../_layout/Meta';
import { Contributions } from '../../_layout/Contributors';
import { StatisticGrid } from '@/app/_layout/StatisticGrid/StatisticGrid';
import { Recipients } from '../../_layout/Recipients';

import appConfig from '@/appConfig';
import { getRepoRecentEvents } from '@/services/backend.server';
import { Shares } from '../../_layout/Shares';
import { ListOfDependenciesLoading } from '@/components/ListOfDependencies/ListOfDependenciesLoading';
import { ListOfDependentsLoading } from '@/components/ListOfDependents/ListOfDependentsLoading';
import { getMetaInformation } from '@/services/github.server';

const ListOfDependencies = dynamicLoader(() => import("@/components/ListOfDependencies/ListOfDependencies"), {
  ssr: true,
  loading: () => <ListOfDependenciesLoading />,
});

const ListOfDependents = dynamicLoader(() => import("@/components/ListOfDependents/ListOfDependents"), {
  ssr: true,
  loading: () => <ListOfDependentsLoading />,
});

type RepoPageProps = {
  params: { repo: string, owner: string }
}

const defaultFullDescription = 'Cascading donations to github repositories. Support open-source projects with donations in crypto, and they will automatically forward a part of your donation to other open-source projects that made them possible.';

export async function generateMetadata(
  { params }: RepoPageProps
): Promise<Metadata> {
  const fullName = `${params.owner}/${params.repo}`.toLowerCase();
  const metaData = await getMetaInformation(`${params.owner}/${params.repo}`);

  return {
    title: `Kivach - ${fullName} | ${metaData?.description || 'Cascading donations'}`,
    description: metaData?.description || defaultFullDescription,
    openGraph: {
      images: [appConfig.BACKEND_API_URL + '/banner/' + fullName + '.png'],
      title: `Kivach - ${fullName} | ${metaData?.description || 'Cascading donations'}`,
      description: metaData?.description || defaultFullDescription,
    },
  }
}

export default async function Page({ params }: RepoPageProps) {

  const { repo, owner } = params;

  if (!repo || !owner) return redirect("/");

  const { events, pagination } = await getRepoRecentEvents(`${owner}/${repo}`, 1);

  return <div className="mt-12">

    <Meta owner={owner} repo={repo} />

    <StatisticGrid owner={owner} repo={repo} />

    <Shares repo={repo} owner={owner} />

    <div className='relative'>
      <div
        className="absolute left-1/3 right-0 top-40 -z-10 -ml-24 transform-gpu overflow-hidden blur-3xl lg:ml-24 xl:ml-48"
        aria-hidden="true"
      >
        <div
          className="aspect-[801/1036] w-[50.0625rem] bg-gradient-to-tr from-primary to-[#9089fc] opacity-10"
          style={{
            clipPath:
              'polygon(63.1% 29.5%, 100% 17.1%, 76.6% 3%, 48.4% 0%, 44.6% 4.7%, 54.5% 25.3%, 59.8% 49%, 55.2% 57.8%, 44.4% 57.2%, 27.8% 47.9%, 35.1% 81.5%, 0% 97.7%, 39.2% 100%, 35.2% 81.4%, 97.2% 52.8%, 63.1% 29.5%)',
          }}
        />
      </div>

      <div className='mt-24'>
        <Recipients
          repo={repo}
          owner={owner}
        />
      </div>

      <ListOfDependencies
        owner={owner}
        repo={repo}
      />

      <ListOfDependents
        owner={owner}
        repo={repo}
      />

      <div className='mt-24'>
        <Title level={2}>Top contributors</Title>

        <Contributions
          owner={owner}
          repo={repo}
        />
      </div>

      <div className='mt-24'>
        <Title level={2}>Recent events</Title>

        <div className='mt-8'>

          <SubTitle level={2} className="mb-8">
            Kivach works on the <a className='text-primary' href="https://obyte.org" target="_blank" rel="noopener">Obyte network</a>, and therefore you can track all donations.
          </SubTitle>


          <RecentEvents data={events} />
        </div>
      </div>
    </div>
  </div>
}
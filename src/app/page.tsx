import Link from "next/link";

import { SubTitle, Title } from "@/components";
import { RepositoryList } from "@/components/RepositoryList/RepositoryList";
import { TotalRecentEvents } from "./_layout/TotalRecentEvents/TotalRecentEvents";
import { getPopularRepository } from "@/services/backend.server";
import { MainSearch } from "./_layout/MainSearch/MainSearch";

import { isNumber } from "lodash";
import { Metadata } from "next";
import appConfig from "@/appConfig";

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.PUBLIC_URL!),
  title: 'Kivach - Cascading donations',
  description: 'Cascading donations to github repositories. Support open-source projects with donations in crypto, and they will automatically forward a part of your donation to other open-source projects that made them possible.',
  openGraph: {
    images: ["/og/main.png"]
  }
}

export default async function Home({ searchParams }: { searchParams: { recentPage: string | undefined; } }) {
  const popularRepositories = await getPopularRepository(9);
  const page = Number(searchParams?.recentPage || 1)

  const recentEventsPage = isNumber(Number(page)) && page > 0 ? page : 1;

  return (
    <main className="">
      <div className="relative isolate">
        <div
          className="absolute left-1/2 right-0 top-0 -z-10 -ml-24 transform-gpu overflow-hidden blur-3xl lg:ml-24 xl:ml-48"
          aria-hidden="true"
        >
          <div
            className="aspect-[801/1036] w-[50.0625rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
            style={{
              clipPath:
                'polygon(63.1% 29.5%, 100% 17.1%, 76.6% 3%, 48.4% 0%, 44.6% 4.7%, 54.5% 25.3%, 59.8% 49%, 55.2% 57.8%, 44.4% 57.2%, 27.8% 47.9%, 35.1% 81.5%, 0% 97.7%, 39.2% 100%, 35.2% 81.4%, 97.2% 52.8%, 63.1% 29.5%)',
            }}
          />
        </div>
        <div className="">
          <div className="mx-auto max-w-7xl  pb-24 pt-24 sm:pt-30lg:pt-24">
            <div className="mx-auto max-w-2xl gap-x-14 lg:mx-0 lg:flex lg:max-w-none lg:items-center">
              <div className="w-full max-w-xl lg:shrink-0 xl:max-w-2xl">
                <Title level={1} className="tracking-tight">
                  Cascading donations <span className="opacity-40">to github repositories</span>
                </Title>

                <SubTitle level={1} className="mt-6">
                  Support open-source projects with donations in crypto, and they will automatically forward a part of your donation to other open-source projects that made them possible.
                </SubTitle>

                <div className="mt-10 flex items-center">
                  <MainSearch />
                </div>
              </div>
              <div className="mt-14 flex justify-end gap-8 lg:mt-0 lg:pl-0">
                <img src="/cascading-donations.svg" alt="How it works" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <Title level={2} className="mt-24">Most popular</Title>
          <RepositoryList data={popularRepositories} className="mt-10" />

          <div className="mt-8">
            <Link href='/popular' className="font-semibold">Go to the full page <span aria-hidden="true">&rarr;</span></Link>
          </div>
        </div>

        <div>
          <Title level={2} className="mt-24">Recent events</Title>
          <div className="mt-10">
            <SubTitle level={2} className="mb-8">
              Kivach works on the <a className='text-primary' href="https://obyte.org" target="_blank" rel="noopener">Obyte network</a>, and therefore you can track all donations.
            </SubTitle>

            <TotalRecentEvents page={recentEventsPage} />
          </div>
        </div>
      </div>
    </main>
  )
}

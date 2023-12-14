import { Metadata } from "next";

import { RepositoryList } from "./_RepositoryList";
import { Title } from "@/components";

import appConfig from "@/appConfig";

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.PUBLIC_URL!),
  title: 'Kivach - My repositories',
  description: 'Cascading donations to github repositories. Support open-source projects with donations in crypto, and they will automatically forward a part of your donation to other open-source projects that made them possible.',
  openGraph: {
    images: ["/og/my.png"]
  }
}

interface ISettingPageProps {
  params: { name: string[]; }
}

export default function Page({ params }: ISettingPageProps) {

  return <div className="mt-12">
    <Title level={1}>My repositories</Title>

    <RepositoryList owner={params?.name?.[0]} repo={params?.name?.[1]} />
  </div>
}



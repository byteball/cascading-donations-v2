import { Metadata } from "next";
import Link from "next/link";

import { SubTitle, Title } from "@/components"
import { SetNickForm } from "@/components/SetNickForm/SetNickForm";

export const metadata: Metadata = {
  title: 'Kivach - Set nickname',
  description: 'Cascading donations to github repositories. Support open-source projects with donations in crypto, and they will automatically forward a part of your donation to other open-source projects that made them possible.',
  openGraph: {
    images: ["/og/nick.png"]
  }
}

export default () => {
  return <div className="mt-12">
    <Title level={1}>Set nickname</Title>

    <SubTitle level={1} className="mt-6">
      If you want your donations show up under your nickname instead of address on the <Link href="/donors" className="text-primary">donors list</Link>, set your nickname here.
    </SubTitle>

    <SetNickForm />
  </div>
}

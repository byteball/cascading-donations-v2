import { Metadata } from "next";

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
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum doloremque corrupti architecto similique molestias quasi amet iusto sed illo, necessitatibus tenetur, adipisci voluptatem! Similique, nihil eligendi voluptatibus dolor eos natus?
    </SubTitle>

    <SetNickForm />
  </div>
}

import Link from "next/link";
import { Metadata } from "next";

import { SubTitle, Title } from "@/components";
import { ListOfDonors } from "@/components/ListOfDonors/ListOfDonors";

export const metadata: Metadata = {
  title: 'Kivach - List of donors',
  description: 'Cascading donations to github repositories. Support open-source projects with donations in crypto, and they will automatically forward a part of your donation to other open-source projects that made them possible.',
  openGraph: {
    images: ["/og/donors.png"]
  }
}

export default () => (<div className="mt-12 relative">
	<Title level={1}>List of donors</Title>

	<SubTitle level={1} className="mt-6">
		Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum doloremque corrupti architecto similique molestias quasi amet iusto sed illo, necessitatibus tenetur, adipisci voluptatem! Similique, nihil eligendi voluptatibus dolor eos natus?
	</SubTitle>

	<p className="my-4">
		If you want to show your nick instead of your address, please <Link href="set_nick" className="text-primary">set your nick</Link>.
	</p>

	<ListOfDonors />
</div>)
import Link from "next/link";
import { Metadata } from "next";

import { SubTitle, Title } from "@/components";
import { ListOfDonors } from "@/components/ListOfDonors/ListOfDonors";
import appConfig from "@/appConfig";

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
		If you want to show your nick instead of your address, please <Link href="set_nick" className="text-primary">set your nick</Link>.
	</SubTitle>

	<SubTitle level={1} className="mt-6">
		You can also get a special status in the <a href="https://discord.obyte.org" target="_blank" rel="noopener" className="text-primary">Obyte discord server</a> depending on the total amount of your donations. To do so, link your Obyte address to your discord username using <a href={"obyte:" +appConfig.BOT_PAIRING_CODE} className="text-primary">Kivach discord bot</a>.
	</SubTitle>

	<ListOfDonors />
</div>)
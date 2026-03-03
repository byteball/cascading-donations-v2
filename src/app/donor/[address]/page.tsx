import { Metadata } from "next";
import { notFound } from "next/navigation";
import obyte from "obyte";

import { Title } from "@/components";
import { DonorProfile } from "@/components/DonorProfile/DonorProfile";
import appConfig from "@/appConfig";
import { getNicks } from "@/utils/getNicks";

interface DonorPageProps {
  params: Promise<{ address: string }>;
}

export async function generateMetadata({ params }: DonorPageProps): Promise<Metadata> {
  const { address } = await params;

  if (!obyte.utils.isValidAddress(address)) return {};

  let displayName = address;
  try {
    const nicks = await getNicks(address);
    displayName = nicks[address] || address;
  } catch { }

  return {
    metadataBase: new URL(appConfig.PUBLIC_URL!),
    title: `Kivach - Donor ${displayName}`,
    description: `Donation history for ${displayName} on Kivach — cascading donations to open-source projects.`,
  };
}

export default async function DonorPage({ params }: DonorPageProps) {
  const { address } = await params;

  if (!obyte.utils.isValidAddress(address)) notFound();

  return (
    <div className="mt-12 relative">
      <Title level={1}>Donor profile</Title>
      <div className="mt-8">
        <DonorProfile address={address} />
      </div>
    </div>
  );
}

"use client";
import { FC, useState } from "react"

import { Button, Modal } from "@/components";
import { IRules } from "@/utils/getRepoRules";
import Tabs from "@/components/Tabs/Tabs";
import { DonationModalTitle } from "../DonateModal";
import { IPools } from "@/app/api/settings/[owner]/route";
import { Distribute } from "./forms/Distribute";
import { DistributionRules } from "./forms/DistributionRules";
import { DonationButton } from "./forms/DonationButton";
import { NotificationsAA } from "./forms/NotificationsAA";

interface IManageModalProps {
  rules: IRules;
  pools: IPools;
  owner: string;
  repo: string;
  open: boolean;
  notificationsAA: string | null;
}

export const ManageModal: FC<IManageModalProps> = (props) => {
  const [isOpen, setIsOpen] = useState<boolean>(props.open || false);
  const [tab, setTab] = useState(props.pools || props.rules ? "distribute" : "rules");
  const { owner, repo } = props;

  return <Modal
    isOpen={isOpen}
    setIsOpen={setIsOpen}
    title="Manage"
    subtitle={<DonationModalTitle owner={owner} repo={repo} />}
    trigger={<Button type="light" className="w-full md:w-none justify-center flex">Manage</Button>}
  >

    <Tabs value={tab} onChange={(v) => setTab(v)} className="mt-10">
      <Tabs.Item value={"distribute"} current={false}>Distribute now</Tabs.Item>
      <Tabs.Item value={"rules"} current={false}>Distribution rules</Tabs.Item>
      <Tabs.Item value={"button"} current={false}>Donation button</Tabs.Item>
      <Tabs.Item value={"notifications"} current={false}>Notifications</Tabs.Item>
    </Tabs>

    {tab === "distribute" && <Distribute {...props} />}
    {tab === "rules" && <DistributionRules {...props} />}
    {tab === "button" && <DonationButton owner={props.owner} repo={props.repo} />}
    {tab === "notifications" && <NotificationsAA
      aa={props.notificationsAA || null}
      owner={props.owner}
      repo={props.repo}
    />}
  </Modal>
}
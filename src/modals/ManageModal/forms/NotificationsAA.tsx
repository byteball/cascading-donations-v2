"use client";

import obyte from "obyte";
import { FC, useRef, useState } from "react";

import { useSelector } from "@/store";
import { selectWalletAddress } from "@/store/slices/settingsSlice";

import { Input } from "@/components";
import { QRButton } from "@/components/QRButton/QRButton";

import { generateLink } from "@/utils";

import appConfig from "@/appConfig";
interface NotificationsAAProps {
  aa: string | null;
  owner: string;
  repo: string;
}

export const NotificationsAA: FC<NotificationsAAProps> = ({ aa: actualAA, owner, repo }) => {

  const fullName = `${owner}/${repo}`;
  const buttonRef = useRef(null);
  const walletAddress = useSelector(selectWalletAddress);
  const [aa, setAA] = useState({ value: actualAA || "", valid: !!actualAA });

  const handleWalletAddress = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setAA({
      valid: obyte.utils.isValidAddress(ev.target.value),
      value: ev.target.value
    })
  }

  const handleEnter = (ev: React.KeyboardEvent) => {
    if (ev.key === "Enter" && buttonRef.current) {
      buttonRef.current.click();
    }
  }

  const link = generateLink({ amount: 1e4, data: { notification_aa: aa.value, distribute: 1, repo: String(fullName).toLowerCase() }, aa: appConfig.AA_ADDRESS!, from_address: walletAddress });


  return <div className="mt-4">
    <p>
      Optionally set up an AA to receive notifications about every donation. The AA might perform any action you choose, for example issue a token to the donor or track statistics.
    </p>
    <p className="mt-2">
      AAs are written in <a target="_blank" className="text-primary" href="https://developer.obyte.org/autonomous-agents/getting-started-guide" rel="noopener">oscript</a> language. <a href="https://oscript.org/s/ayduFGpeBpnB7UYu7PUGYWorBL4UMkKS" target="_blank" className="text-primary" rel="noopener">This is an example</a> of an AA that issues a token in response to donations.
    </p>

    <div className="mt-4">
      <Input placeholder="AA address"
        value={aa.value}
        error={!!(!aa.valid && aa.value)}
        onChange={handleWalletAddress}
        onKeyDown={handleEnter}
      />
    </div>

    <QRButton href={link} disabled={!aa.valid || !aa.value} className="mt-4" ref={buttonRef}>Change</QRButton>
  </div>
}
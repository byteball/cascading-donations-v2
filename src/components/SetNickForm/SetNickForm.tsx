"use client";

import appConfig from "@/appConfig";
import { Input, Spin } from "@/components"
import { QRButton } from "@/components/QRButton/QRButton";
import { useSelector } from "@/store"
import { selectWalletAddress, selectWalletWasPersisted } from "@/store/slices/settingsSlice"
import { generateLink } from "@/utils";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";

interface INicks {
  [key: string]: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json()).then((res) => res.data);

export const SetNickForm = () => {
  const walletAddress = useSelector(selectWalletAddress);
  const walletAddressIsPersisted = useSelector(selectWalletWasPersisted);
  const [nick, setNick] = useState<string>("");
  const buttonRef = useRef(null);

  const { data, isLoading } = useSWR<INicks>(walletAddress ? '/api/nicks/' + walletAddress : null,
    fetcher,
    {
      refreshInterval: 1000 * 60 * 20, // refresh every 60 minutes
      revalidateOnReconnect: true,
      dedupingInterval: 1000 * 60 * 25, // dedupe requests with the same key every 25 minutes
      fallbackData: {}
    });

  const currentNick = data && walletAddress ? data[walletAddress] : null;

  useEffect(() => {
    if (data && walletAddress) {
      const currentNick = data[walletAddress];

      if (currentNick) {
        setNick(currentNick);
      }
    }

  }, [data, walletAddress])

  const handleWalletAddress = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setNick(ev.target.value);
  }

  const handleEnter = (ev: React.KeyboardEvent) => {
    if (ev.key === "Enter" && buttonRef.current) {
      buttonRef.current.click();
    }
  }

  const link = generateLink({ aa: appConfig.AA_ADDRESS!, from_address: walletAddress, amount: 1e4, data: { nickname: nick } });

  if (isLoading || !walletAddressIsPersisted) return <div className="my-4 flex justify-center">
    <Spin size="large" />
  </div>

  return <div>
    {walletAddress ? <div className="mt-4">
      <Input placeholder="Nick"
        value={nick}
        onChange={handleWalletAddress}
        className="max-w-[600px]"
        onKeyDown={handleEnter}
      />

      <QRButton href={link} disabled={!nick || !!currentNick && currentNick === nick} className="mt-4" ref={buttonRef}>Set a nick</QRButton>

    </div> : <div className="mt-4">
      <Link href="/set_nick?walletModal=1" className="text-primary">Please add your wallet</Link>
    </div>}

    <div className="mt-8"><ArrowLeftIcon className="h-[1em] w-[1em] inline stroke-primary" /> <Link href="/donors" className="text-primary">Back to donor list</Link></div>


  </div>
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import obyte from "obyte";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import { Button, Input, Modal } from "@/components"
import { RootState, useDispatch } from "@/store";
import { changeWallet, selectWalletWasPersisted } from "@/store/slices/settingsSlice";
import { getGithubAccountsThunk } from "@/store/thunks/getAttestations";
import { LocalStorage } from "@/utils/localStorage";


export const AddWalletModal = () => {
  const [walletAddress, setWalletAddress] = useState({ valid: false, value: "" });
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<any>(null);
  const modalTriggerRef = useRef<any>(null);
  const currentWalletAddress = useSelector((state: RootState) => state.settings.walletAddress);
  const wasPersisted = useSelector(selectWalletWasPersisted);
  const router = useRouter();

  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('walletModal') && modalTriggerRef.current) {
      modalTriggerRef.current?.click();
      router.replace(window.location.pathname);
    }
  }, [searchParams, modalTriggerRef.current])

  useEffect(() => {
    if (currentWalletAddress) {
      setWalletAddress({ value: currentWalletAddress, valid: true });
    }
  }, [currentWalletAddress]);

  const handleWalletAddress = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setWalletAddress({
      valid: obyte.utils.isValidAddress(ev.target.value),
      value: ev.target.value
    })
  }

  const handleEnter = (ev: React.KeyboardEvent) => {
    if (ev.key === "Enter" && buttonRef.current) {
      buttonRef.current.click();
    }
  }


  const saveWallet = () => {
    if (walletAddress.value && walletAddress.valid) {
      dispatch(changeWallet(walletAddress.value));

      dispatch(getGithubAccountsThunk(walletAddress.value));

      LocalStorage.set("user_wallet", walletAddress.value);

      setIsOpen(false);
    }
  }

  if (!wasPersisted) return <div className="h-[34px] rounded-xl w-[20%] animate-pulse bg-slate-100" />

  return <Modal
    isOpen={isOpen}
    initRef={inputRef}
    setIsOpen={setIsOpen}
    subtitle="You need it to set up your own repos and receive donations. This address will also show up as donor when you donate from networks other than Obyte (Ethereum, BSC, etc)."
    title={currentWalletAddress ? "Change wallet" : "Add wallet"}
    trigger={<button className="text-sm font-semibold leading-6 text-gray-900 bg-gray-200 rounded-xl px-3 py-[5px]">
      {currentWalletAddress ? `${currentWalletAddress.slice(0, 3)}...${currentWalletAddress.slice(-3, currentWalletAddress.length)}` : <span>Add wallet <span aria-hidden="true">&rarr;</span></span>}
    </button>}
    advice={<span><a className="text-primary" href="https://obyte.org/#download" target="_blank" rel="noopener">Install Obyte wallet</a> if you don't have one yet, and copy/paste your address here.</span>}
  >
    <Input
      value={walletAddress.value}
      placeholder="Example: 2QVJOY3BRRGWP7IOYL64O5B..."
      onChange={handleWalletAddress}
      onKeyDown={handleEnter}
      ref={inputRef}
      error={walletAddress.value ? !walletAddress.valid ? 'Not valid address' : false : false}
    />

    <Button
      // type="primary"
      onClick={saveWallet}
      disabled={!walletAddress.valid || currentWalletAddress === walletAddress.value}
      ref={buttonRef}
      fluid
      className="mt-4"
    >
      Add wallet
    </Button>
  </Modal>
}
"use client";

import { useRouter } from "next/navigation";

import { Search } from "@/components"
import { sendGAEvent } from "@/gtag";

export const MainSearch = () => {
  const router = useRouter();

  return <Search
    placeholder="Repo name, e.g. bitcoin/bitcoin"
    className="md:w-[60%]"
    size="large"
    type="primary"
    showSearchIcon
    onChange={(fullName: string) => {
      router.push("/repo/" + String(fullName).toLowerCase());

      sendGAEvent({
        category: "Search",
        action: `search ${fullName}`,
      })
    }}
  />
}
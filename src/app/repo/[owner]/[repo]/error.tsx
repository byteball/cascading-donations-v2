"use client";

import Link from "next/link";

import { Button } from "@/components";

export default function Error() {
  return <>
    <div className="flex justify-center mt-10">
      <img src="/unknown_error.svg" alt="Error" className="max-w-[40%]" />
    </div>

    <div className="text-center mt-10">
      <div className="text-2xl font-light">Something went wrong</div>

      <Link href="/">
        <Button className="mt-4">Go to main page</Button>
      </Link>
    </div>
  </>
}

import Link from "next/link";

import { Button } from "@/components";

export default function Custom404() {
  return <>
    <div className="flex justify-center mt-10">
      <img src="/not-found.svg" alt="Not found" className="max-w-[40%]" />
    </div>

    <div className="text-center mt-10">
      <div className="text-2xl font-light">Not found</div>

      <Link href="/">
        <Button className="mt-4">Go to main page</Button>
      </Link>
    </div>
  </>
}

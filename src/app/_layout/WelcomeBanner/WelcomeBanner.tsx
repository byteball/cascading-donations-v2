"use client";

import { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

import { LocalStorage } from "@/utils/localStorage";

export const WelcomeBanner = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (LocalStorage.get("welcomeBanner") !== "hide") {
      setShow(true);
    } else {
      setShow(false);
    }
  }, []);

  const close = () => {
    setShow(false);
    LocalStorage.set("welcomeBanner", "hide");
  }

  if (!show) return null;

  return <div className="flex items-center gap-x-6 bg-gray-900 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
    <p className="text-sm leading-6 text-white">
      <a href="https://blog.obyte.org/kivach-cascading-donations-for-github-repositories-2b175bdbff77" target="_blank" rel="noopener">
        <strong className="font-semibold">Welcome to Kivach</strong>
        <svg viewBox="0 0 2 2" className="mx-2 inline h-0.5 w-0.5 fill-current" aria-hidden="true">
          <circle cx={1} cy={1} r={1} />
        </svg>
        If you are first time here and want to learn more about Kivach, read the introductory article
      </a>
    </p>
    <div className="flex flex-1 justify-end">
      <button type="button" className="-m-3 p-3 focus-visible:outline-offset-[-4px]" onClick={close}>
        <span className="sr-only">Dismiss</span>
        <XMarkIcon className="h-5 w-5 text-white" aria-hidden="true" />
      </button>
    </div>
  </div>
}
"use client";

import { useDispatch, useSelector } from "@/store"
import { changeVisibleCookieBanner, selectShowCookieBanner, selectShowCookieBannerWasPersisted } from "@/store/slices/settingsSlice"
import { LocalStorage } from "@/utils/localStorage";

export const CookieBanner = () => {
  const persisted = useSelector(selectShowCookieBannerWasPersisted);
  const show = useSelector(selectShowCookieBanner);
  const dispatch = useDispatch();

  if (!persisted || !show) return null;

  const close = () => {
    dispatch(changeVisibleCookieBanner(false));
    
    LocalStorage.set("cookie_banner", false);
  }

  return <div className="pointer-events-none z-50 fixed inset-x-0 bottom-0 px-6 pb-6">
    <div className="pointer-events-auto ml-auto max-w-md rounded-xl bg-white p-6 shadow-lg ring-1 ring-gray-900/10">
      <p className="text-sm leading-6 text-gray-900">
        We use cookies for Google Analytics and for connection with Github.
      </p>
      <div className="mt-4 flex items-center gap-x-5">
        <button
          type="button"
          onClick={close}
          className="rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
        >
          Accept
        </button>
      </div>
    </div>
  </div>
}
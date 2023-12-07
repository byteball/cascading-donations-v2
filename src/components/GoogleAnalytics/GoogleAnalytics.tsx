"use client";

import Script from "next/script"

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import * as gtag from "../../gtag";
import appConfig from "@/appConfig";

export const GoogleAnalytics = () => {

  const pathname = usePathname();

  useEffect(() => {
    gtag.pageview();
  }, [pathname])

  if (!appConfig.GA_TAG_ID) return null;
  
  return <>
    <Script
      strategy="afterInteractive"
      src={`https://www.googletagmanager.com/gtag/js?id=${appConfig.GA_TAG_ID}`}
    />

    <Script id="gtag-init" strategy="afterInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', '${appConfig.GA_TAG_ID}', {send_page_view: false});
      `}
    </Script>
  </>
}

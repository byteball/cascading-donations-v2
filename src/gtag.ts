//@ts-nocheck
"use client";

import appConfig from "./appConfig";

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = () => {
  if (appConfig.GA_TAG_ID) {
    window.gtag("event", 'page_view')
  }
}

type SendGAEvent = {
  action: string
  category: string
  label?: string
  value?: number
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const sendGAEvent = ({ action, category, label, value }: SendGAEvent) => {
  if (appConfig.GA_TAG_ID) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}
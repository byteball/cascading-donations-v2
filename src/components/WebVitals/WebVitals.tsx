'use client'

import { useReportWebVitals } from 'next/web-vitals'

// see more https://nextjs.org/docs/app/building-your-application/optimizing/analytics#web-vitals

export const WebVitals = () => {
  useReportWebVitals((metric) => {
    switch (metric.name) {
      case 'FCP': {
        console.log('FCP', metric)
      }
      case 'LCP': {
        console.log('LCP', metric)
      }
      case 'TTFB': {
        console.log('TTFB', metric)
      }
      case 'FID' : {
        console.log('FID', metric)
      }
    }
  });

  return null
}

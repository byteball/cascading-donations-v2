'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

// see more https://nextjs.org/docs/app/building-your-application/optimizing/analytics#web-vitals

export const WebVitals = () => {
  useReportWebVitals((metric) => {
    switch (metric.name) {
      case 'FCP': {
        console.log('FCP', metric, window.location.pathname)
        break;
      }
      case 'LCP': {
        console.log('LCP', metric, window.location.pathname)
        break;
      }
      case 'TTFB': {
        fetch('/napi/web-vitals', {
          method: 'POST',
          body: JSON.stringify({
            value: metric.value,
            pathname: window.location.pathname,
            id: window.gaGlobal?.vid
          })
        });

        break;
      }
      case 'FID': {
        console.log('FID', metric, window.location.pathname)
        break;
      }
    }
  });

  return <ProgressBar
    color="#0137FF"
    options={{ showSpinner: true }}
    shallowRouting
    shouldCompareComplexProps={true}
  />
}

'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

// see more https://nextjs.org/docs/app/building-your-application/optimizing/analytics#web-vitals

function ReportWebVitals() {
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

  return null;
}

export const WebVitals = () => {
  return <>
    <ReportWebVitals />
    <ProgressBar
      height="3px"
      color="#0137FF"
      options={{ showSpinner: true }}
      stopDelay={200}
      style={`
        #nprogress { pointer-events: none; }
        #nprogress .bar { background: #0137FF; position: fixed; z-index: 99999; top: 0; left: 0; width: 100%; height: 3px; }
        #nprogress .peg { display: block; position: absolute; right: 0; width: 100px; height: 100%; box-shadow: 0 0 10px #0137FF, 0 0 5px #0137FF; opacity: 1; transform: rotate(3deg) translate(0px, -4px); }
        #nprogress .spinner { display: block; position: fixed; z-index: 99999; top: 15px; right: 15px; }
        #nprogress .spinner-icon { width: 18px; height: 18px; box-sizing: border-box; border: solid 2px transparent; border-top-color: #0137FF; border-left-color: #0137FF; border-radius: 50%; animation: nprogress-spinner 400ms linear infinite; }
        @keyframes nprogress-spinner { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}
      targetPreprocessor={(url) => {
        if (url.protocol === 'obyte:') {
          return new URL(window.location.href);
        } else {
          return url;
        }
      }}
    />
  </>
}


'use client'

import Script from 'next/script'

export default function GoogleAnalytics() {
  const trackingId = process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID;

  if (!trackingId) {
    console.warn("[Google Analytics] Tracking ID (NEXT_PUBLIC_GA_ID or NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) is missing. Analytics will not be enabled.");
    return null;
  }

  return (
    <>
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`}
      />
      <Script id="google-analytics-script" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${trackingId}');
        `}
      </Script>
    </>
  )
}

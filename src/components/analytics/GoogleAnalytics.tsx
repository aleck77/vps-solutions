
'use client'

import Script from 'next/script'

interface GoogleAnalyticsProps {
    trackingId: string;
}

export default function GoogleAnalytics({ trackingId }: GoogleAnalyticsProps) {
  if (!trackingId) {
    console.warn("Google Analytics tracking ID is missing. Analytics will not be enabled.");
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

"use client";

import Script from "next/script";
import { useEffect } from "react";
import { captureUtmFromLocation } from "@/lib/analytics/utm";
import type { SiteSettings } from "@/lib/cms";

export function SiteAnalytics({ settings }: { settings?: SiteSettings | null }) {
  useEffect(() => {
    captureUtmFromLocation();
  }, []);

  const gtmId = settings?.seo?.googleTagManagerId?.trim();
  const gaId = settings?.seo?.googleAnalyticsId?.trim();

  if (gtmId) {
    return (
      <>
        <Script id="gtm-init" strategy="afterInteractive">{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `}</Script>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
      </>
    );
  }

  if (gaId) {
    return (
      <>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}</Script>
      </>
    );
  }

  return null;
}

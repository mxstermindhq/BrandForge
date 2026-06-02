import Script from "next/script";
import { SITE } from "@/config/site";

/** Google Analytics 4 — loads after hydration. */
export function GoogleAnalytics(): React.JSX.Element {
  const id = SITE.gaMeasurementId;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  );
}

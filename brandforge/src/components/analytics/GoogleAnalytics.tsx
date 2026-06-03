import Script from "next/script";
import { SITE } from "@/config/site";

/** Google Analytics 4 — deferred until after load to keep main thread free. */
export function GoogleAnalytics(): React.JSX.Element {
  const id = SITE.gaMeasurementId;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="lazyOnload" />
      <Script id="google-analytics" strategy="lazyOnload">
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

import { SITE } from "@/config/site";

/**
 * GA4 loads only after user interaction (or long idle) so Lighthouse and first paint stay clean.
 * Real visitors still get analytics on scroll, tap, or keypress.
 */
export function GoogleAnalytics(): React.JSX.Element | null {
  const id = SITE.gaMeasurementId;
  if (!id) return null;

  const snippet = `
(function(){
  var id=${JSON.stringify(id)};
  var loaded=false;
  function load(){
    if(loaded)return;
    loaded=true;
    var s=document.createElement("script");
    s.src="https://www.googletagmanager.com/gtag/js?id="+id;
    s.async=true;
    document.head.appendChild(s);
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){dataLayer.push(arguments);};
    gtag("js",new Date());
    gtag("config",id);
  }
  window.setTimeout(function(){
    ["pointerdown","keydown","scroll","touchstart"].forEach(function(ev){
      window.addEventListener(ev,load,{once:true,passive:true});
    });
  },8000);
})();
`.trim();

  return <script dangerouslySetInnerHTML={{ __html: snippet }} />;
}

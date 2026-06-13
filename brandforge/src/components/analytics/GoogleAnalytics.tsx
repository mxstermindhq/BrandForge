import { SITE } from "@/config/site";

/**
 * GA4 loads after window load (idle) or first user interaction — never blocks LCP.
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
    gtag("config",id,{send_page_view:true});
    document.addEventListener("click",function(e){
      var t=e.target;
      if(!t||!t.closest)return;
      var el=t.closest("[data-bf-cta]");
      if(!el)return;
      var cta=el.getAttribute("data-bf-cta")||"unknown";
      var campaign=el.getAttribute("data-bf-campaign")||"unknown";
      var pagePath=location.pathname||"/";
      gtag("event","page_conversion",{page_path:pagePath,cta:cta,campaign:campaign});
      if(cta==="discord")gtag("event","click_discord",{campaign:campaign,page_path:pagePath});
      else if(cta==="telegram")gtag("event","click_telegram",{campaign:campaign});
      else if(cta==="package")gtag("event","click_package_tier",{campaign:campaign});
      else if(cta==="calendly")gtag("event","click_calendly",{campaign:campaign});
      else if(cta==="copy")gtag("event","click_copy_discord",{campaign:campaign});
      else gtag("event","cta_click",{platform:cta,campaign:campaign});
    },true);
  }
  function scheduleAfterLoad(){
    if(typeof requestIdleCallback==="function"){
      requestIdleCallback(load,{timeout:2500});
    }else{
      setTimeout(load,1);
    }
  }
  if(document.readyState==="complete"){
    scheduleAfterLoad();
  }else{
    window.addEventListener("load",scheduleAfterLoad,{once:true,passive:true});
  }
  ["pointerdown","keydown","scroll","touchstart"].forEach(function(ev){
    window.addEventListener(ev,load,{once:true,passive:true});
  });
})();
`.trim();

  return <script dangerouslySetInnerHTML={{ __html: snippet }} />;
}

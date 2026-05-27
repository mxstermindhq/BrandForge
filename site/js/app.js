(function(){
  var cfg=window.BF_CONFIG||{};
  var pkgs=cfg.packages||{};
  var m=window.matchMedia("(prefers-reduced-motion: reduce)");

  function rm(){
    document.documentElement.classList.toggle("reduce-motion",m.matches);
    if(m.matches)document.documentElement.style.scrollBehavior="auto";
  }
  rm();
  m.addEventListener("change",rm);

  if(!m.matches){
    var obs=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){e.target.classList.add("in");obs.unobserve(e.target);}
      });
    },{threshold:.07,rootMargin:"0px 0px -28px 0px"});
    document.querySelectorAll(".rv").forEach(function(el){obs.observe(el);});
  }else{
    document.querySelectorAll(".rv").forEach(function(el){el.classList.add("in");});
  }

  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener("click",function(ev){
      var id=a.getAttribute("href");
      if(!id||id==="#")return;
      var t=document.querySelector(id);
      if(!t)return;
      ev.preventDefault();
      t.scrollIntoView({behavior:m.matches?"auto":"smooth",block:"start"});
    });
  });

  function toast(msg){
    var el=document.getElementById("bf-toast");
    if(!el){
      el=document.createElement("div");
      el.id="bf-toast";
      el.className="bf-toast";
      el.setAttribute("role","status");
      document.body.appendChild(el);
    }
    el.textContent=msg;
    el.classList.add("bf-toast-show");
    clearTimeout(el._t);
    el._t=setTimeout(function(){el.classList.remove("bf-toast-show");},4200);
  }

  function copyText(text){
    if(navigator.clipboard&&window.isSecureContext){
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function(resolve,reject){
      var ta=document.createElement("textarea");
      ta.value=text;
      ta.setAttribute("readonly","");
      ta.style.position="fixed";
      ta.style.left="-9999px";
      document.body.appendChild(ta);
      ta.select();
      try{document.execCommand("copy");resolve();}catch(e){reject(e);}
      document.body.removeChild(ta);
    });
  }

  function telegramUrl(msg){
    var base=cfg.telegram||"https://t.me/Notmxstermind";
    return base+(base.indexOf("?")>-1?"&":"?")+"text="+encodeURIComponent(msg);
  }

  document.querySelectorAll("[data-pkg]").forEach(function(el){
    var key=el.getAttribute("data-pkg");
    var pkg=pkgs[key];
    if(!pkg)return;
    var channel=(el.getAttribute("data-channel")||"discord").toLowerCase();
    if(channel==="telegram"){
      el.setAttribute("href",telegramUrl(pkg.telegramMsg));
      return;
    }
    el.setAttribute("href",cfg.discord||"https://discord.gg/a8Nz2R6M55");
    el.addEventListener("click",function(){
      copyText(pkg.discordMsg).then(function(){
        toast("Copied your "+pkg.label+" message — paste it in Discord when you join.");
      }).catch(function(){
        toast("Open Discord and mention: "+pkg.label);
      });
    });
  });
})();

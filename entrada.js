/* Resolver únicamente fragmentos históricos declarados en el HTML. */
function restoreBookmark() {
  const target = document.getElementById(location.hash.slice(1));
  if (!target?.matches("a.legacy")) return false;
  const destination = new URL(target.href);
  destination.search = location.search;
  location.replace(destination.href);
  return true;
}
window.addEventListener("hashchange",restoreBookmark);

async function animateConnection() {
  const media = matchMedia("(prefers-reduced-motion: no-preference)");
  if (!media.matches) return;
  const load = name => new Promise((resolve,reject) => {
    const script = document.createElement("script");
    script.src = "vendor/gsap/" + name + ".min.js";
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
  try { await load("gsap"); await load("ScrollTrigger"); } catch { return; }
  gsap.registerPlugin(ScrollTrigger);
  gsap.matchMedia().add({motion:"(prefers-reduced-motion: no-preference)",small:"(max-width:40rem)"}, context => {
    if (!context.conditions.motion) return;
    const small = context.conditions.small;
    gsap.from(".portal",{y:10,opacity:.87,duration:.5,stagger:.06,clearProps:"transform,opacity"});
    gsap.fromTo(".connection i",small ? {y:-10} : {x:-16},
      {...(small ? {y:10} : {x:16}),duration:1.3,repeat:1,yoyo:true,ease:"sine.inOut",
       scrollTrigger:{trigger:".connection",start:"top 98%",once:true}});
  });
}
if (!restoreBookmark()) animateConnection();

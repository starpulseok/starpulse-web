/* Los efectos se cargan después del contenido y solo cuando se admite movimiento. */
const motionPreference = matchMedia("(prefers-reduced-motion: no-preference)");
const assetsBase = new URL(".", document.currentScript.src);
let motionLibraries;

function loadLibrary(name) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = new URL("vendor/gsap/" + name + ".min.js", assetsBase);
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
}

async function enableMotion() {
  if (!motionPreference.matches || motionLibraries) return;
  motionLibraries = loadLibrary("gsap").then(() => loadLibrary("ScrollTrigger"));
  try { await motionLibraries; } catch { return; }
  gsap.registerPlugin(ScrollTrigger);
  gsap.matchMedia().add({
    allowed: "(prefers-reduced-motion: no-preference)",
    desktop: "(min-width: 801px) and (pointer: fine)"
  }, context => {
    const { allowed, desktop } = context.conditions;
    if (!allowed) return;
    const distance = desktop ? 14 : 5;
    const hero = document.querySelector(".hero");
    gsap.from(hero.querySelectorAll("h1,p,.actions,.button,.art,.architecture"), {
      opacity: .78, y: distance, duration: .48, stagger: .035, clearProps: "transform,opacity"
    });
    document.querySelectorAll("main h2,.cards article,.services li").forEach(el => {
      gsap.from(el, { y: distance, opacity: .8, duration: .42, clearProps: "transform,opacity",
        scrollTrigger: { trigger: el, start: "top 94%", once: true } });
    });
    if (!desktop) return;
    const layer = hero.querySelector(".art img,.architecture i:last-child");
    if (layer) gsap.to(layer, { y: 12, ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    const cards = document.querySelectorAll(".cards article,.services li");
    function light(event) {
      const card = event.currentTarget;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--light-x", (event.clientX - rect.left) + "px");
      card.style.setProperty("--light-y", (event.clientY - rect.top) + "px");
    }
    cards.forEach(card => card.addEventListener("pointermove", light));
    return () => cards.forEach(card => card.removeEventListener("pointermove", light));
  });
}
motionPreference.addEventListener("change", enableMotion);
enableMotion();

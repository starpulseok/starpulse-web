const cycle = document.querySelector(".lifecycle");
const links = [...cycle.querySelectorAll(".cycle-links a")];
const panels = links.map(link => document.getElementById(link.hash.slice(1)));
const signal = cycle.querySelector(".signal");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
let pulse;

function selectPhase(index, animate) {
  panels.forEach((panel, i) => {
    panel.hidden = i !== index;
    if (i === index) links[i].setAttribute("aria-current", "step");
    else links[i].removeAttribute("aria-current");
  });
  pulse?.kill();
  const offset = -60 * index;
  if (animate && !reduced.matches && window.gsap) {
    // Avanzar por el anillo también al pasar de Evolución a Necesidad.
    const start = Number(signal.getAttribute("stroke-dashoffset") || 0);
    const delta = ((start - offset) % 360 + 360) % 360;
    pulse = gsap.to(signal, {attr:{"stroke-dashoffset":start-delta}, duration:.42,
      ease:"power2.out", onComplete:() => signal.setAttribute("stroke-dashoffset",offset)});
  } else signal.setAttribute("stroke-dashoffset",offset);
}
function followFragment() {
  const phase = links.findIndex(link => link.hash === location.hash);
  if (phase >= 0) selectPhase(phase,false);
  const target = document.getElementById(location.hash.slice(1));
  if (target?.matches("details.service")) target.open = true;
}
links.forEach((link,index) => link.addEventListener("click", event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  selectPhase(index,true);
  if (matchMedia("(max-width:34rem)").matches) panels[index].scrollIntoView({block:"nearest",behavior:"instant"});
}));
cycle.querySelectorAll(".phase a").forEach(link => link.addEventListener("click", () => {
  document.getElementById(link.hash.slice(1)).open = true;
}));
reduced.addEventListener("change", () => selectPhase(panels.findIndex(panel => !panel.hidden),false));
selectPhase(0,false);
followFragment();
window.addEventListener("hashchange",followFragment);

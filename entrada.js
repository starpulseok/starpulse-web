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

restoreBookmark();

function enableAmbientMotion() {
  const home = document.querySelector(".home");
  const canvas = home.querySelector(".field");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const controls = home.querySelector(".controls");
  const button = controls.querySelector("button");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = matchMedia("(hover: hover) and (pointer: fine) and (min-width: 41rem)");
  const palette = Array.from({length:64}, (_, i) => {
    const mix = i / 63;
    return "rgb(" + [111 + 144 * mix, 186 + 25 * mix, 255 - 124 * mix].map(Math.round).join(",") + ")";
  });
  let width, height, count, interval;
  let frame = 0, previous = null, time = 0;
  let paused = false;
  let targetX = 0, targetY = 0, offsetX = 0, offsetY = 0;
  const dots = [];

  function makeDot(i) {
    return {
      start:Math.random(), level:Math.random(), depth:.22 + .78 * Math.random(),
      phase:Math.random() * 2 * Math.PI, band:i % 3,
      inFlow:i % 5 < 3, x:0, y:0, color:0
    };
  }

  function paint() {
    ctx.clearRect(0, 0, width, height);
    const distance = Math.min(110, width * .16);
    for (let i = 0; i < count; i++) {
      const dot = dots[i];
      // Los puntos vuelven al otro extremo fuera del área visible.
      const span = width + 64;
      const x = (dot.start * span + time * (4 + 11 * dot.depth)) % span - 32;
      const drift = Math.sin(time * .12 + dot.phase);
      let y = dot.level * height;
      if (dot.inFlow) {
        const crest = Math.sin(x / width * 5.6 + time * .07 + dot.band * .24);
        y = height * (.49 + .23 * crest + (dot.band - 1) * .085 + (dot.level - .5) * .15);
      }
      dot.x = x + offsetX * dot.depth;
      dot.y = y + 13 * drift * dot.depth + offsetY * dot.depth;
      dot.color = Math.max(0, Math.min(63, Math.round(x / width * 63)));
      ctx.fillStyle = palette[dot.color];
      ctx.globalAlpha = .32 + dot.depth * .58;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, .5 + dot.depth * 1.05, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Solo una fracción del campo participa en la red. La distancia regula su aparición.
    ctx.lineWidth = .8;
    for (let i = 3; i < count; i += 5) {
      const a = dots[i];
      for (let j = i + 5; j < count; j += 5) {
        const b = dots[j];
        const d2 = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
        if (d2 >= distance * distance) continue;
        ctx.globalAlpha = .36 * (1 - d2 / (distance * distance));
        ctx.strokeStyle = palette[(a.color + b.color) >> 1];
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const compact = width <= 640;
    const scale = Math.min(devicePixelRatio || 1, compact ? 1.25 : 1.5);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    count = Math.min(compact ? 130 : 420, Math.max(45, Math.round(width * height / 2800)));
    interval = 1000 / (compact ? 24 : 30);
    while (dots.length < count) dots.push(makeDot(dots.length));
    paint();
  }

  function tick(now) {
    if (previous === null) previous = now;
    const elapsed = now - previous;
    if (elapsed >= interval - .5) {
      previous = now;
      const delta = Math.min(elapsed / 1000, .09);
      time += delta;
      const blend = 1 - Math.exp(-delta * 4);
      offsetX += (targetX - offsetX) * blend;
      offsetY += (targetY - offsetY) * blend;
      paint();
    }
    frame = requestAnimationFrame(tick);
  }

  function move(event) {
    targetX = (event.clientX / width - .5) * 22;
    targetY = (event.clientY / height - .5) * 14;
  }
  function center() { targetX = targetY = 0; }

  function sync() {
    const still = paused || reduced.matches || document.hidden;
    home.toggleAttribute("data-still", still);
    home.classList.toggle("motion", !reduced.matches);
    controls.hidden = reduced.matches;
    button.toggleAttribute("data-paused", paused);
    button.textContent = paused ? "Reanudar animación" : "Pausar animación";
    if (still) {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = null;
    } else if (!frame) {
      frame = requestAnimationFrame(tick);
    }
    if (!still && pointer.matches) document.addEventListener("pointermove", move, {passive:true});
    else {
      document.removeEventListener("pointermove", move);
      center();
    }
  }
  resize();
  canvas.classList.add("ready");
  window.addEventListener("resize", resize);
  button.addEventListener("click", () => { paused = !paused; sync(); });
  document.documentElement.addEventListener("pointerleave", center);
  document.addEventListener("visibilitychange", sync);
  reduced.addEventListener("change", sync);
  pointer.addEventListener("change", sync);
  sync();
}

enableAmbientMotion();

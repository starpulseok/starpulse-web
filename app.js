// ================== CONFIG ==================
const OFFSET = 120; // altura del header aprox (probá 110-140 si querés)
const PHONE = "5493564661474";
const MSG =
  "Hola Star Pulse! Quiero cotizar un armado o consultar productos. Mi presupuesto es ... y lo necesito para ...";

// ================== WhatsApp ==================
const waLink = `https://wa.me/${PHONE}?text=${encodeURIComponent(MSG)}`;

const waTop = document.getElementById("waTop");
const waBottom = document.getElementById("waBottom");
if (waTop) waTop.href = waLink;
if (waBottom) waBottom.href = waLink;

// ================== Header shadow ==================
const header = document.querySelector(".header");
window.addEventListener("scroll", () => {
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 10);
});

// ================== FIX ANCLAS / HASH ==================

// 1) Desactiva que el navegador "recuerde" el scroll anterior
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

function scrollToEl(el) {
  const y = el.getBoundingClientRect().top + window.scrollY - OFFSET;
  window.scrollTo({ top: y, behavior: "smooth" });
}

function goToHash(hash) {
  if (!hash || hash === "#") return;

  const el = document.querySelector(hash);
  if (!el) return;

  // Fuerza a arriba primero (evita que quede en la posición anterior)
  window.scrollTo(0, 0);

  // Espera un toque para que termine de acomodar el layout (fuentes/blur)
  setTimeout(() => scrollToEl(el), 50);
  setTimeout(() => scrollToEl(el), 200); // segundo “ajuste” por si cambió el layout
}

// 2) Al cargar: si hay hash, ir al lugar correcto sí o sí
window.addEventListener("load", () => {
  goToHash(window.location.hash);
});

// 3) Si el usuario cambia el hash (o entra con otro)
window.addEventListener("hashchange", () => {
  goToHash(window.location.hash);
});

// 4) Click en menú: controlado (y evita href="#" de otros botones)
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const hash = a.getAttribute("href");
    if (!hash || hash === "#") return; // no tocar links vacíos

    e.preventDefault();
    history.pushState(null, "", hash);
    goToHash(hash);
  });
});

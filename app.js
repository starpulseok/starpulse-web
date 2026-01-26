// ================== WHATSAPP ==================
const PHONE = "5493564661474";

const MSG_GENERAL =
  "Hola Star Pulse 👋\nQuería consultar por hardware, periféricos o el armado de una PC a medida. Gracias.";

const MSG_CONTACTO =
  "Hola Star Pulse 👋\nQuisiera hacer una consulta. Gracias.";

function waLink(message) {
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
}

const waTop = document.getElementById("waTop");
const waBottom = document.getElementById("waBottom");

if (waTop) waTop.href = waLink(MSG_GENERAL);
if (waBottom) waBottom.href = waLink(MSG_CONTACTO);

// ================== HEADER SOMBRA ==================
const header = document.querySelector(".header");
window.addEventListener(
  "scroll",
  () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 10);
  },
  { passive: true }
);

// ================== AÑO AUTOMÁTICO ==================
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ================== REVEAL ANIMATIONS ==================
const reveals = document.querySelectorAll(".reveal");

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("show");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);

reveals.forEach((el) => io.observe(el));

// ================== NAV ACTIVO ==================
const navLinks = document.querySelectorAll(".nav-link");
const sections = ["#quienes", "#servicios", "#contacto"]
  .map((id) => document.querySelector(id))
  .filter(Boolean);

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const id = "#" + entry.target.id;
      navLinks.forEach((a) => {
        a.classList.toggle("active", a.getAttribute("href") === id);
      });
    });
  },
  { rootMargin: "-40% 0px -55% 0px", threshold: 0.01 }
);

sections.forEach((s) => sectionObserver.observe(s));

// ================== WHATSAPP ==================
const PHONE = "5493564661474";

// Mensajes según intención
const MSG_GENERAL =
  "Hola Star Pulse 👋\nQuería hacer una consulta general sobre productos o armado de PCs. Gracias.";

const MSG_RECOMENDACION =
  "Hola Star Pulse 👋\nQuiero una recomendación para armar una PC.\nPresupuesto aproximado: ___\nUso principal: (trabajo / gaming / estudio / otro).";

const MSG_CONTACTO =
  "Hola Star Pulse, ¿cómo están?\nQuisiera comunicarme con ustedes por una consulta. Gracias.";

// Función para armar link
function waLink(message) {
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;
}

// Botones
const waTop = document.getElementById("waTop");         // Hero
const waServices = document.getElementById("waServices"); // Servicios
const waBottom = document.getElementById("waBottom");  // Contacto

if (waTop) waTop.href = waLink(MSG_GENERAL);
if (waServices) waServices.href = waLink(MSG_RECOMENDACION);
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

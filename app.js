// ===== WhatsApp (mensajes distintos) =====
const phone = "5493564661474";

// 1) Botón HERO
const msgHero =
  "Hola Star Pulse 👋\nQuiero consultar por productos o el armado de una PC a medida.\n\nMi presupuesto aproximado es: \nLa necesito para: (trabajo / gaming / estudio)\nGracias!";

// 2) Botón CONTACTO
const msgContacto =
  "Hola Star Pulse 👋\nQuisiera hacer una consulta rápida. Gracias!";

const linkHero = `https://wa.me/${phone}?text=${encodeURIComponent(msgHero)}`;
const linkContacto = `https://wa.me/${phone}?text=${encodeURIComponent(msgContacto)}`;

const waTop = document.getElementById("waTop");
const waBottom = document.getElementById("waBottom");

if (waTop) waTop.href = linkHero;
if (waBottom) waBottom.href = linkContacto;

// ===== Header sombra al scrollear =====
const header = document.querySelector(".header");
window.addEventListener("scroll", () => {
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 10);
}, { passive: true });

// ===== Año automático =====
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Nav activo según sección =====
const navLinks = document.querySelectorAll(".nav-link");
const sections = ["#quienes", "#servicios", "#contacto"]
  .map(id => document.querySelector(id))
  .filter(Boolean);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = "#" + entry.target.id;
    navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === id));
  });
}, { rootMargin: "-40% 0px -55% 0px", threshold: 0.01 });

sections.forEach(s => observer.observe(s));

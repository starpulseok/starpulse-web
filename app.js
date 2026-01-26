// ===== WhatsApp =====
const phone = "5493564661474";
const msg = "Hola Star Pulse! Quiero cotizar un armado o consultar productos. Mi presupuesto es ... y lo necesito para ...";
const link = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

const waTop = document.getElementById("waTop");
const waBottom = document.getElementById("waBottom");
const waServices = document.getElementById("waServices");

if (waTop) waTop.href = link;
if (waBottom) waBottom.href = link;
if (waServices) waServices.href = link;

// ===== Año automático en footer =====
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Header sombra al scrollear =====
const header = document.querySelector(".header");
window.addEventListener("scroll", () => {
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 10);
}, { passive: true });

// ===== Reveal animations =====
const reveals = document.querySelectorAll(".reveal");

const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add("show");
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

reveals.forEach((el) => io.observe(el));

// ===== Nav link activo según sección visible =====
const navLinks = document.querySelectorAll(".nav-link");
const sections = ["#quienes", "#servicios", "#contacto"]
  .map((id) => document.querySelector(id))
  .filter(Boolean);

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    const id = "#" + entry.target.id;
    navLinks.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === id);
    });
  });
}, { rootMargin: "-40% 0px -55% 0px", threshold: 0.01 });

sections.forEach((s) => sectionObserver.observe(s));

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
if ('IntersectionObserver' in window) {
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
  document.documentElement.classList.add("reveal-enabled");

  // ================== NAV ACTIVO ==================
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = Array.from(navLinks, (link) => link.hash)
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
}

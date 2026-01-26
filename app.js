// ===== WhatsApp =====
const phone = "5493564661474";

// Botón hero (cotización/armado)
const msgHero =
  "Hola Star Pulse! Quiero cotizar un armado o consultar productos.\n" +
  "Presupuesto aproximado: ...\n" +
  "Lo necesito para: ...\n" +
  "¿Me recomendás algo?";

// Botón contacto (consulta rápida)
const msgContacto =
  "Hola Star Pulse! Quiero hacer una consulta. ¿Me pueden ayudar?";

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
});

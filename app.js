const phone = "5493564661474";
const msg = "Hola Star Pulse! Quiero cotizar un armado o consultar productos. Mi presupuesto es ... y lo necesito para ...";

const link = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

document.getElementById("waTop").href = link;
document.getElementById("waBottom").href = link;

// Header sombra al scrollear
const header = document.querySelector(".header");
window.addEventListener("scroll", () => {
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 10);
});

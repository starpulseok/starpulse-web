const phone = "5493564661474";
const msg = "Hola Star Pulse! Quiero consultar por un armado o producto.";

const link = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

document.getElementById("waTop").href = link;
document.getElementById("waBottom").href = link;

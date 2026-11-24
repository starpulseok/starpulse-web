/* Las respuestas solo existen en el documento abierto. */
const guide = document.querySelector(".guide");
const field = id => guide.querySelector("#" + id);
const fields = guide.querySelector(".guide-fields");
const review = guide.querySelector(".guide-review");
const corporateIT = guide.dataset.brand === "KOLOSSUS";
const draft = field("draft");
let previousSummary;

function chooseBranch() {
  for (const branch of guide.querySelectorAll("[data-branch]")) {
    branch.hidden = branch.dataset.branch !== field("mode").value;
  }
  if (!corporateIT) field("quantity-label").textContent = field("mode").value === "Empresa"
    ? "¿Cuántos puestos necesitan equipar?" : "¿Cuántos equipos buscás?";
}

function prepareReview() {
  const mode = field("mode").value;
  const lines = ["Hola, equipo de " + guide.dataset.brand + "."];
  let suggestion;
  if (corporateIT) {
    const need = field("need");
    const areas = ["soporte y mantenimiento", "infraestructura IT", "seguridad y continuidad operativa", "gestión de activos", "consultoría e ingeniería"];
    suggestion = "Área de consulta: " + areas[need.selectedIndex] + ".";
    lines.push("Modalidad: " + mode + ".", "Situación: " + need.value + ".", "Alcance: " + field("impact").value + ".");
  } else {
    if (!field("quantity").reportValidity()) return;
    const company = mode === "Empresa";
    const purpose = field(company ? "business" : "personal").value;
    const guidance = company ? [
      "Para equipar puestos, conviene cotizar por perfil de trabajo y cantidad.",
      "Para una renovación, podemos revisar qué equipos reemplazar y qué componentes aprovechar.",
      "Para cotizar componentes, indicá el modelo del equipo y la mejora que buscás.",
      "Para cotizar periféricos, indicá el tipo de accesorio y cuántos puestos lo necesitan.",
      "Podemos organizar la cotización por puesto, componentes y periféricos."
    ] : [
      "Para estudiar, contanos qué programas usás en tus materias.",
      "Para gaming, indicá los juegos y la resolución de tu monitor.",
      "Para uso profesional, indicá las aplicaciones que más usás.",
      "Para crear contenido, contanos si trabajás con video, audio, imágenes o 3D.",
      "Para uso personal, contanos tus tareas habituales y qué equipo tenés hoy."
    ];
    suggestion = guidance[field(company ? "business" : "personal").selectedIndex];
    lines.push(company ? "Quisiera una cotización para nuestra empresa." : "Quisiera asesoramiento para elegir una PC.", "Necesidad: " + purpose + ".");
    if (field("quantity").value) lines.push("Cantidad de equipos: " + field("quantity").value + ".");
    if (field("budget").value.trim()) lines.push("Presupuesto orientativo: " + field("budget").value.trim() + ".");
  }
  if (field("meeting").checked) lines.push("Me gustaría coordinar una reunión para conversar sobre esta consulta.");
  const summary = lines.join("\n");
  if (summary !== previousSummary) draft.value = summary;
  previousSummary = summary;
  field("suggestion").textContent = suggestion;
  updateChannels();
  fields.hidden = true;
  review.hidden = false;
  review.querySelector("h3").focus();
}

function updateChannels() {
  const links = [field("whatsapp"), field("email")];
  if (!draft.value.trim()) {
    links.forEach(link => { link.removeAttribute("href"); link.setAttribute("aria-disabled", "true"); });
    return;
  }
  links.forEach(link => link.removeAttribute("aria-disabled"));
  const body = encodeURIComponent(draft.value);
  field("whatsapp").href = "https://wa.me/5493564661474?text=" + body;
  field("email").href = "mailto:" + guide.dataset.email + "?subject=" + encodeURIComponent("Consulta para " + guide.dataset.brand) + "&body=" + body;
}

field("mode").addEventListener("change", chooseBranch);
field("review").addEventListener("click", prepareReview);
draft.addEventListener("input", updateChannels);
field("back").addEventListener("click", () => {
  review.hidden = true;
  fields.hidden = false;
  field("mode").focus();
});
chooseBranch();
guide.querySelector(".guide-card").hidden = false;

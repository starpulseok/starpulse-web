(() => {
  const card = document.querySelector(".contact-editor");
  const brand = card.dataset.brand;
  const draft = card.querySelector("[data-draft]");
  const type = card.querySelector("[data-type]");
  const recipient = card.querySelector("[data-recipient]");
  const fields = [...card.querySelectorAll("[data-field]")];
  const whatsapp = card.querySelector("[data-chat]");
  const email = card.querySelector("[data-mail]");
  const status = card.querySelector("[role=status]");
  const rebuild = card.querySelector("[data-rebuild]");
  const copy = card.querySelector("[data-copy]");
  let context = "";
  let edited = false;
  const drafts = new Map();

  function format() {
    const lines = [brand + " · " + type.value];
    if (context) lines.push(context);
    for (const field of fields) {
      if (!field.closest("label").hidden && field.value.trim()) lines.push(field.dataset.field + ": " + field.value.trim());
    }
    if (type.value === "Reunión") lines.push("Quisiera coordinar una reunión para conversar sobre esta consulta.");
    return lines.join("\n");
  }
  function channels() {
    const value = draft.value.trim();
    const person = recipient?.selectedOptions[0] || card;
    const invalid = fields.find(field => !field.closest("label").hidden && !field.validity.valid);
    if (invalid) status.textContent = "Revisá la cantidad de equipos. Ingresá un número entero mayor que cero.";
    copy.disabled = !value || Boolean(invalid);
    if (!value || invalid) {
      whatsapp.removeAttribute("href");
      email.removeAttribute("href");
      return;
    }
    const body = encodeURIComponent(value.toWellFormed());
    whatsapp.href = "https://wa.me/" + person.dataset.phone + "?text=" + body;
    email.href = "mailto:" + person.dataset.email + "?subject=" + encodeURIComponent(brand + " · " + type.value) + "&body=" + body;
  }
  function refresh() {
    if (!edited) draft.value = format();
    rebuild.hidden = !edited;
    channels();
  }
  function selectContext(next, intent, original) {
    if (context !== next) {
      if (edited) drafts.set(context, draft.value);
      context = next;
      draft.value = drafts.get(next) ?? "";
      edited = drafts.has(next);
    }
    if (intent) type.value = intent;
    if (original) { draft.value = brand + " · " + type.value + "\n" + next + "\n" + original; edited = true; }
    const company = card.querySelector("[data-company]");
    if (company) company.hidden = next.startsWith("Perfil: Persona");
    card.querySelector("[data-context-label]").textContent = next;
    status.textContent = "";
    refresh();
  }
  function fromSolution(solution) {
    if (!solution) return "";
    return "Perfil: " + solution.dataset.profile + "\nActividad: " + solution.dataset.activity;
  }
  document.addEventListener("click", event => {
    const link = event.target.closest("a");
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (link.matches(".profile-card,.activity-card")) {
      selectContext(fromSolution(document.querySelector(".solution:not([hidden])")));
      return;
    }
    if (!link.hasAttribute("data-compose")) return;
    const service = link.closest(".service");
    const phase = link.closest(".phase");
    const solution = link.closest(".solution");
    const practical = link.closest(".solution-list details");
    const explorer = link.closest(".consult");
    let next = link.dataset.compose;
    let original;
    let intent = link.dataset.request;
    if (service) {
      next = "Servicio: " + service.querySelector(".area").textContent;
      const local = service.querySelector("textarea");
      if (local.value !== local.defaultValue) original = local.value;
    } else if (phase) next = "Etapa: " + phase.querySelector("h3").textContent;
    else if (practical) next = "Solución: " + practical.querySelector("summary").textContent;
    else if (solution || explorer) {
      next = fromSolution(solution || document.querySelector(".solution:not([hidden])"));
      const local = document.querySelector(".compose textarea");
      if (explorer || solution) {
        intent = document.querySelector(".meet input").checked ? "Reunión" :
          document.querySelector('[data-intent="cotización"]').getAttribute("aria-pressed") === "true" ? "Cotización" : "Asesoramiento";
        if (explorer && local.dataset.edited === "true") original = local.value;
      }
    }
    if (link.hash !== "#preparar-consulta") {
      event.preventDefault();
      location.hash = "preparar-consulta";
    }
    if (!next && brand === "Star Pulse" && !solution && !explorer) next = context;
    selectContext(next, intent, original);
    const match = solution || (explorer && document.querySelector(".solution:not([hidden])"));
    const hint = card.querySelector("[data-suggestions]");
    if (hint) hint.textContent = match?.querySelector("strong")?.parentElement.textContent || "";
    card.focus({preventScroll:true});
  });
  card.addEventListener("input", event => {
    status.textContent = "";
    if (event.target === draft) edited = true;
    refresh();
  });
  rebuild.addEventListener("click", () => {
    drafts.delete(context); edited = false; refresh(); draft.focus();
  });
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(draft.value);
      status.textContent = "Mensaje copiado.";
    } catch {
      draft.focus(); draft.select();
      status.textContent = "Texto seleccionado. Usá la opción Copiar de tu dispositivo.";
    }
  });
  card.hidden = false;
  selectContext("");
})();
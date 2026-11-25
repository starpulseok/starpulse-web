const explorer = document.querySelector(".explore");
const profiles = [...explorer.querySelectorAll(".profile-card")];
const activities = [...explorer.querySelectorAll(".activity-card")];
const message = explorer.querySelector("textarea");
const meeting = explorer.querySelector(".meet input");
const intents = explorer.querySelectorAll("[data-intent]");
const memories = new Map();
let selected, intent = "asesoramiento";

function updateChannels() {
  const text = message.value.trim();
  const wa = explorer.querySelector("#explore-wa");
  const mail = explorer.querySelector("#explore-email");
  if (!text) {
    wa.removeAttribute("href");
    mail.removeAttribute("href");
    return;
  }
  const body = encodeURIComponent(text.toWellFormed());
  wa.href = "https://wa.me/5493564661474?text=" + body;
  mail.href = "mailto:starpulse.contacto@gmail.com?subject=" + encodeURIComponent("Consulta para Star Pulse") + "&body=" + body;
}

function compose() {
  const key = [selected.id, intent, meeting.checked].join("/");
  const { profile, activity } = selected.dataset;
  message.dataset.edited = String(memories.has(key));
  message.value = memories.get(key) ?? ("Hola, Star Pulse. Quisiera " + intent + " para " + activity + " (perfil " + profile + "). Me interesa comparar alternativas para mi actividad." + (meeting.checked ? " Quisiera coordinar una reunión." : ""));
  intents.forEach(button => button.setAttribute("aria-pressed", button.dataset.intent === intent));
  updateChannels();
}

function select(activityLink) {
  selected = document.getElementById(activityLink.hash.slice(1));
  const group = selected.closest(".activity-group");
  for (const candidate of explorer.querySelectorAll(".activity-group")) candidate.hidden = candidate !== group;
  for (const solution of explorer.querySelectorAll(".solution")) solution.hidden = solution !== selected;
  for (const link of profiles) link.setAttribute("aria-current", link.hash === "#" + group.id);
  for (const link of activities) link.setAttribute("aria-current", link === activityLink);
  compose();
}

for (const link of [...profiles, ...activities]) {
  link.addEventListener("click", event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const target = document.getElementById(link.hash.slice(1));
    select(target.matches(".activity-group") ? target.querySelector(".activity-card") : link);
  });
}
for (const button of intents) button.addEventListener("click", () => { intent = button.dataset.intent; compose(); });
message.addEventListener("input", () => {
  message.dataset.edited = "true";
  memories.set([selected.id,intent,meeting.checked].join("/"),message.value);
  updateChannels();
});
meeting.addEventListener("change",compose);
for (const control of explorer.querySelectorAll(".compose [hidden]")) control.hidden = false;
const initial = activities.find(link => link.hash === location.hash) ||
  activities.find(link => "#" + link.closest(".activity-group").id === location.hash);
select(initial || activities[0]);

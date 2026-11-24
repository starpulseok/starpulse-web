/* Los enlaces base funcionan sin JavaScript. Cada tarjeta edita su propio borrador. */
for (const card of document.querySelectorAll(".service")) {
  const label = card.querySelector(".draft-label");
  const draft = label.querySelector("textarea");
  const chat = card.querySelector(".chat");
  const mail = card.querySelector(".mail");
  const meeting = card.querySelector(".meet-link");
  const emailBase = mail.href.split("&body=")[0] + "&body=";
  const chatBase = chat.href.split("?")[0] + "?text=";
  label.hidden = false;
  draft.addEventListener("input", () => {
    const text = draft.value.trim();
    if (!text) {
      for (const link of [chat,mail,meeting]) link.removeAttribute("href");
      return;
    }
    chat.href = chatBase + encodeURIComponent(text);
    mail.href = emailBase + encodeURIComponent(text);
    meeting.href = emailBase + encodeURIComponent(text + " Me gustaría coordinar una reunión.");
  });
}

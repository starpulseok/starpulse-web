const header = document.querySelector(".header");
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

const sections = Array.from(document.querySelectorAll('nav a[href^="#"]'), link => ({
  link,
  section: document.getElementById(link.hash.slice(1))
})).filter(item => item.section);

function updateNavigation() {
  header?.classList.toggle("scrolled", window.scrollY > 10);
  const marker = Math.max(header?.offsetHeight || 0, window.innerHeight * 0.35);
  const atEnd = window.scrollY > 0 &&
    window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
  let current;
  for (const item of sections) {
    if (atEnd || item.section.getBoundingClientRect().top <= marker) current = item.link;
  }
  for (const { link } of sections) {
    if (link === current) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
}

window.addEventListener("scroll", updateNavigation, { passive: true });
window.addEventListener("resize", updateNavigation);
window.addEventListener("pageshow", updateNavigation);
updateNavigation();

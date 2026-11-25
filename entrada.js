/* Resolver únicamente fragmentos históricos declarados en el HTML. */
function restoreBookmark() {
  const target = document.getElementById(location.hash.slice(1));
  if (!target?.matches("a.legacy")) return false;
  const destination = new URL(target.href);
  destination.search = location.search;
  location.replace(destination.href);
  return true;
}
window.addEventListener("hashchange",restoreBookmark);

restoreBookmark();

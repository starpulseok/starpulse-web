/* Genera un plan por stdout. No edita el sitio ni publica archivos. */
const { URL } = require("node:url");

function productionPlan(input) {
  const base = new URL(input);
  if (base.protocol !== "https:" || base.username || base.password || base.search || base.hash || !base.pathname.endsWith("/")) {
    throw new Error("Ingresá la URL HTTPS de la entrada conjunta con barra final, sin credenciales, consulta ni fragmento.");
  }
  const pages = [
    { file:"index.html", route:"", image:null },
    { file:"kolossus/index.html", route:"kolossus/", image:"kolossus/logo.webp" },
    { file:"starpulse/index.html", route:"starpulse/", image:"assets/hero-logo.webp" }
  ].map(({file,route,image}) => ({
    file, canonical:new URL(route,base).href, socialImage:image ? new URL(image,base).href : null
  }));
  const locations = pages.map(page => "  <url><loc>" + page.canonical.replaceAll("&","&amp;") + "</loc></url>");
  return {
    pages, errorBase:base.pathname,
    sitemap:['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',...locations,'</urlset>'].join("\n"),
    robots:"User-agent: *\nAllow: /\nSitemap: " + new URL("sitemap.xml",base).href + "\n"
  };
}

if (require.main === module) {
  try { console.log(JSON.stringify(productionPlan(process.argv[2]),null,2)); }
  catch (error) { console.error(error.message); process.exitCode=1; }
}
module.exports = { productionPlan };

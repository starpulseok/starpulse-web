/* Planifica la publicación sin escribir en la raíz pública. */
const fs = require("node:fs");
const path = require("node:path").posix;

function httpsUrl(value, directory) {
  if (typeof value !== "string" || !/^https:\/\/[A-Za-z0-9.-]+\/[A-Za-z0-9./_-]*$/.test(value) ||
      value.slice(8).split("/").some(part => part.startsWith(".") || part.endsWith(".") ||
        /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i.test(part))) {
    throw new Error("URL HTTPS o ruta de despliegue no admitida.");
  }
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash ||
      url.port || !/^[A-Za-z0-9./_-]*$/.test(url.pathname) || url.pathname.includes("//") ||
      (directory !== url.pathname.endsWith("/"))) {
    throw new Error("Se requiere una URL HTTPS sin credenciales, parámetros ni fragmentos. Las páginas deben terminar en barra.");
  }
  return url;
}

function productionPlan(input) {
  const single = typeof input === "string";
  const base = httpsUrl(single ? input : input.entrada,true);
  const pages = [
    ["entrada","index.html","",null],
    ["kolossus","kolossus/index.html","kolossus/","kolossus/logo.webp"],
    ["starpulse","starpulse/index.html","starpulse/","assets/hero-logo.webp"]
  ].map(([key,file,route,image]) => {
    const canonical = single ? new URL(route,base) : httpsUrl(input[key],true);
    return {file,canonical:canonical.href,image};
  });
  if (new Set(pages.map(p=>p.canonical)).size !== pages.length) throw new Error("Las tres páginas deben tener URL distintas.");
  const hosts = [];
  for (const origin of new Set(pages.map(p=>new URL(p.canonical).origin))) {
    const group = pages.filter(p=>new URL(p.canonical).origin === origin);
    let mount = new URL(group[0].canonical).pathname;
    while (!group.every(p=>new URL(p.canonical).pathname.startsWith(mount))) {
      mount = path.dirname(mount.slice(0,-1)).replace(/\/$/,"") + "/";
    }
    const locations = group.map(p=>"  <url><loc>"+p.canonical+"</loc></url>");
    const sitemap = ['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',...locations,'</urlset>'].join("\n");
    const robots = "User-agent: *\nAllow: /\nSitemap: "+origin+mount+"sitemap.xml\n";
    hosts.push({origin,mount,sitemap,robots});
    for (const page of group) {
      page.socialImage = page.image ? new URL(page.image,origin+mount).href :
        (single ? null : httpsUrl(input.imagenConjunta,false).href);
      delete page.image;
    }
  }
  const primary = hosts[0];
  return {pages,hosts,errorBase:primary.mount,sitemap:primary.sitemap,robots:primary.robots};
}

if (require.main === module) {
  try {
    const input = process.argv[2] === "--config" ? JSON.parse(fs.readFileSync(process.argv[3] === "-" ? 0 : process.argv[3],"utf8").replace(/^\uFEFF/,"")) : process.argv[2];
    console.log(JSON.stringify(productionPlan(input),null,2));
  } catch (error) { console.error(error.message); process.exitCode=1; }
}
module.exports = { productionPlan };

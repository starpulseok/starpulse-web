const destino = new URL(document.getElementById("destino").href);
destino.search = location.search;
destino.hash = location.hash;
location.replace(destino.href);

"""Paquetes estáticos de KOLOSSUS y Astra Pulse. Solo usa Git y bibliotecas estándar."""
import argparse
import hashlib
import html
import json
import posixpath
import re
import subprocess
import sys
import tempfile
import zipfile
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit, urlunsplit

TOOLS = Path(__file__).resolve().parent
REPO = TOOLS.parent
PAGES = ["index.html", "kolossus/index.html", "astrapulse/index.html"]
SOURCE = set((TOOLS / "publicacion.txt").read_text().splitlines())
META = '<meta name="robots" content="noindex, follow">'
ZIP = "sitio.zip"


def require(ok, message):
    if not ok:
        raise ValueError(message)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def git(*args):
    return subprocess.check_output(["git", "-C", str(REPO), *args])


def revision(ref):
    return git("rev-parse", "--verify", "--end-of-options", ref + "^{commit}").decode().strip()


def read_source(sha):
    tree = {}
    for entry in git("ls-tree", "-rz", sha).split(b"\0"):
        if entry:
            info, name = entry.split(b"\t", 1)
            tree[name.decode()] = info.split()[0]
    missing = sorted(name for name in SOURCE if tree.get(name) not in (b"100644", b"100755"))
    require(not missing, "Archivos obligatorios ausentes o no regulares: " + ", ".join(missing))
    blobs = {name:git("cat-file", "blob", sha + ":" + name) for name in sorted(SOURCE)}
    for name in ("vendor/gsap/ScrollTrigger.min.js", "vendor/gsap/gsap.min.js"):
        require(b"@license" in blobs[name][:1024], "Falta el aviso de licencia: " + name)
    return blobs


def mount_path(value):
    require(re.fullmatch(r"/(?:[A-Za-z0-9_-]+/)*", value), "El montaje debe tener la forma / o /directorio/.")
    return value


def replace_once(text, old, new):
    require(text.count(old) == 1, "Estructura HTML inesperada: " + old)
    return text.replace(old, new)


def configure_preview(source, mount):
    result = source.copy()
    text = result["404.html"].decode()
    result["404.html"] = replace_once(text, '<base href="/starpulse-web/">',
                                      '<base href="' + mount_path(mount) + '">').encode()
    for name in PAGES + ["404.html", "starpulse/index.html"]:
        require(META in result[name].decode(), "Falta noindex en " + name)
    return result


def seo(config):
    require(isinstance(config, dict) and all(isinstance(config.get(key), str) and config[key]
            for key in ("entrada", "kolossus", "astrapulse", "imagenConjunta")),
            "Faltan las URL aprobadas de las tres paginas o la imagen conjunta")
    output = subprocess.check_output(["node", str(TOOLS / "plan-seo.cjs"), "--config", "-"],
                                     input=json.dumps(config).encode())
    return json.loads(output)


def relocate(text, source_name, destination, pages, base):
    """Reubica referencias del HTML propio; las anclas locales conservan su documento."""
    def url(raw):
        if not raw or raw.startswith("#") or urlsplit(raw).scheme:
            return raw
        old = urlsplit(urljoin("https://fuente.invalid/" + source_name, raw))
        name = old.path.lstrip("/")
        absolute = pages.get(name, urljoin(base, name))
        target = urlsplit(absolute)
        address = absolute
        if target.netloc == urlsplit(destination).netloc:
            address = posixpath.relpath(target.path, urlsplit(destination).path)
            if target.path.endswith("/"):
                address += "/"
        return urlunsplit(("", "", address, old.query, old.fragment))

    def attribute(m):
        key, raw = m.groups()
        if key == "srcset":
            items = []
            for candidate in raw.split(","):
                resource, size = candidate.strip().split()
                items.append(url(resource) + " " + size)
            value = ", ".join(items)
        else:
            value = url(html.unescape(raw))
        return key + '="' + html.escape(value, quote=True) + '"'

    return re.sub(r'\b(href|src|srcset)="([^"]*)"', attribute, text)


def configure_production(source, plan):
    pages = {p["file"]:p["canonical"] for p in plan["pages"]}
    result = {}

    def put(path, content):
        require(path not in result, "Colisión de rutas en el alojamiento: " + path)
        result[path] = content

    for host in plan["hosts"]:
        origin, mount = host["origin"], host["mount"]
        folder = urlsplit(origin).netloc + "/"
        base = origin + mount
        assets = folder + mount.lstrip("/")
        for name in sorted(SOURCE - set(PAGES + ["404.html", "starpulse/index.html"])):
            put(assets + name, source[name])
        for page in plan["pages"]:
            absolute = page["canonical"]
            if urlsplit(absolute).netloc != urlsplit(origin).netloc:
                continue
            name = page["file"]
            text = relocate(source[name].decode(), name, absolute, pages, base)
            text = replace_once(text, META, '<link rel="canonical" href="' + absolute + '">\n  <meta property="og:url" content="' + absolute + '">')
            image = page["socialImage"]
            for key, attr in [("og:image","property"), ("twitter:image","name")]:
                tag = f'<meta {attr}="{key}" content="{image}">'
                pattern = f'<meta {attr}="{key}" content="[^"]*">'
                if re.search(pattern, text):
                    text = re.sub(pattern, lambda _: tag, text)
                else:
                    text = text.replace("</head>", "  " + tag + "\n</head>")
            if name != "index.html":
                logo = urljoin(base, "assets/astrapulse/horizontal.webp") if name == "astrapulse/index.html" else image
                text, count = re.subn(r'"logo": "[^"]+"', lambda _: '"logo": ' + json.dumps(logo), text)
                require(count == 1, "Falta el logo estructurado de " + name)
            put(folder + urlsplit(absolute).path.lstrip("/") + "index.html", text.encode())
        if urlsplit(origin).netloc == urlsplit(pages["index.html"]).netloc:
            legacy = "starpulse/index.html"
            destination = urljoin(pages["index.html"], "starpulse/")
            redirect = relocate(source[legacy].decode(), legacy, destination, pages, base)
            put(folder + urlsplit(destination).path.lstrip("/") + "index.html", redirect.encode())
        # El documento de error funciona incluso cuando se sirve desde una URL profunda.
        error = replace_once(source["404.html"].decode(), '<base href="/starpulse-web/">', "")
        error = relocate(error, "404.html", base, pages, base)
        error = error.replace("<head>", '<head>\n  <base href="' + mount + '">')
        put(assets + "404.html", error.encode())
        put(assets + "sitemap.xml", host["sitemap"].encode())
        put(folder + "robots.txt", host["robots"].encode())
    return result


class Links(HTMLParser):
    def __init__(self, data):
        super().__init__()
        self.refs = []
        self.ids = set()
        self.base = ""
        self.feed(data.decode())

    def handle_starttag(self, tag, pairs):
        attrs = dict(pairs)
        if "id" in attrs:
            self.ids.add(attrs["id"])
        if tag == "base":
            self.base = attrs["href"]
            return
        for key in ["href", "src"]:
            if attrs.get(key):
                self.refs.append(attrs[key])
        self.refs.extend(item.split()[0] for item in attrs.get("srcset", "").split(",") if item.strip())


def check_links(files, settings):
    preview = settings["mode"] == "preview"
    prefix = settings.get("mount", "/")
    docs = {key:Links(data) for key,data in files.items() if key.endswith(".html")}
    hosts = {"preview.invalid"} if preview else {urlsplit(h["origin"]).netloc for h in settings["plan"]["hosts"]}
    for key, doc in docs.items():
        address = "https://preview.invalid" + prefix + key if preview else "https://" + key
        for ref in doc.refs:
            u = urlsplit(urljoin(urljoin(address, doc.base), ref))
            if u.scheme == "mailto" or (u.scheme == "https" and u.netloc not in hosts):
                continue
            require(u.scheme == "https" and u.netloc in hosts, "Protocolo inesperado: " + ref)
            if preview:
                require(u.path.startswith(prefix), "Referencia fuera del montaje: " + ref)
                path = u.path[len(prefix):]
            else:
                path = u.netloc + u.path
            if u.path.endswith("/"):
                path += "index.html"
            require(path in files, f"{key}: falta el destino {ref} ({path})")
            if path in docs and u.fragment:
                require(u.fragment in docs[path].ids, f"{key}: ancla inexistente {ref}")


def build(sha, settings):
    source = read_source(sha)
    if settings["mode"] == "preview":
        files = configure_preview(source, settings["mount"])
    else:
        require(settings["mode"] == "produccion" and settings.get("indexingApproved") is True, "Falta autorización de indexación")
        plan = seo(settings["approvedUrls"])
        require(plan == settings["plan"], "Plan SEO incompatible con las URL aprobadas")
        files = configure_production(source, plan)
    check_links(files, settings)
    return files


def inventory(files):
    return [{"path":p,"bytes":len(b),"sha256":digest(b)} for p,b in sorted(files.items())]


def verify(directory):
    manifest = json.loads((directory / "manifiesto.json").read_text(encoding="utf8"))
    sha = revision(manifest["commit"])
    require(sha == manifest["commit"], "El manifiesto debe identificar el SHA completo")
    files = build(sha, manifest["settings"])
    require(manifest["files"] == inventory(files), "El inventario difiere de la revisión o del entorno")
    for name in (ZIP, "manifiesto.json"):
        expected = digest((directory / name).read_bytes()) + "  " + name
        require(expected in (directory / "SHA256SUMS.txt").read_text().splitlines(), "SHA-256 incorrecto: " + name)
    with zipfile.ZipFile(directory / ZIP) as archive:
        require(sorted(archive.namelist()) == sorted(files), "Entradas ZIP faltantes, duplicadas o ajenas al inventario")
        for name,b in files.items():
            require(archive.getinfo(name).file_size == len(b) and archive.read(name) == b, "Contenido distinto: " + name)
    print(f"Verificados {len(files)} archivos de {sha}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="mode", required=True)
    verify_cmd = commands.add_parser("verificar")
    verify_cmd.add_argument("directory", type=Path)
    for mode in ("preview","produccion"):
        cmd = commands.add_parser(mode)
        cmd.add_argument("--ref", required=True)
        cmd.add_argument("--salida", type=Path, required=True)
        if mode == "preview":
            cmd.add_argument("--montaje", default="/starpulse-web/")
        else:
            cmd.add_argument("--config-aprobada", type=Path, required=True)
            cmd.add_argument("--autorizar-indexacion", action="store_true", required=True)
    args = parser.parse_args()
    if args.mode == "verificar":
        verify(args.directory)
        return
    sha = revision(args.ref)
    require(not str(args.salida).startswith(("\\\\", "//")), "La salida debe ser local")
    out = args.salida.resolve()
    require(not out.is_relative_to(REPO.resolve()), "Elegí una carpeta externa al repositorio")
    settings = {"mode":args.mode}
    if args.mode == "preview":
        settings["mount"] = mount_path(args.montaje)
    else:
        config = json.loads(args.config_aprobada.read_text(encoding="utf-8-sig"))
        settings.update(approvedUrls=config, plan=seo(config), indexingApproved=args.autorizar_indexacion)
    files = build(sha,settings)
    out.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(dir=out) as temporary:
        staging = Path(temporary) / "paquete"
        staging.mkdir()
        with zipfile.ZipFile(staging / ZIP,"w",zipfile.ZIP_DEFLATED) as archive:
            for name,b in sorted(files.items()):
                archive.writestr(name,b)
        manifest = {"commit":sha,"settings":settings,"files":inventory(files)}
        (staging / "manifiesto.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
        sums = [digest((staging / name).read_bytes()) + "  " + name for name in (ZIP,"manifiesto.json")]
        (staging / "SHA256SUMS.txt").write_text("\n".join(sums)+"\n",encoding="ascii")
        verify(staging)
        # Reserva exclusiva y nombre único, incluso con dos invocaciones concurrentes.
        slot = Path(tempfile.mkdtemp(prefix=f"{args.mode}-{sha[:12]}-",dir=out))
        destination = slot / "entrega"
        staging.rename(destination)
        print(destination)


if __name__ == "__main__":
    try:
        main()
    except (OSError,ValueError,KeyError,subprocess.CalledProcessError,zipfile.BadZipFile) as exc:
        sys.exit(str(exc))

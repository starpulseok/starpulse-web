const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const engines = require("playwright-core");

const root = path.resolve(__dirname, "..");
const prefix = "/starpulse-web/";
const mime = { html: "text/html; charset=utf-8", css: "text/css", js: "text/javascript", png: "image/png", jpg: "image/jpeg", webp: "image/webp" };
const engine = process.env.BROWSER || "chromium";

test("Navegación de las dos marcas bajo el prefijo del repositorio", async t => {
  const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, "http://localhost").pathname;
    const relative = pathname.slice(prefix.length).replace(/(^|\/)$/, "$1index.html");
    const file = path.resolve(root, relative);
    const type = mime[path.extname(file).slice(1)];
    if (!pathname.startsWith(prefix) || !file.startsWith(root + path.sep) || !type || !fs.existsSync(file)) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { "Content-Type": type });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  t.after(() => server.close());
  const base = "http://127.0.0.1:" + server.address().port + prefix;
  const browser = await engines[engine].launch({channel: process.env.BROWSER_CHANNEL || undefined});
  t.after(() => browser.close());

  for (const width of [320, 768, 1440]) {
    for (const javaScriptEnabled of [false, true]) {
      await t.test(width + " px, JavaScript " + javaScriptEnabled, async t => {
        const page = await browser.newPage({ viewport: { width, height: 800 }, javaScriptEnabled, reducedMotion: "reduce" });
        t.after(() => page.close());
        const errors = [];
        page.on("pageerror", error => errors.push(error.message));
        page.on("response", response => { if (response.status() >= 400) errors.push(response.url()); });
        await page.goto(base);
        for (const brand of ["Star Pulse", "Kolossus"]) {
          assert((await page.title()).toLowerCase().startsWith(brand.toLowerCase()));
          const selector = page.getByRole("group", { name: "Seleccionar marca" });
          const links = selector.getByRole("link");
          assert.equal(await links.count(), 2);
          assert.equal(await selector.locator('[aria-current="page"]').count(), 1);
          assert.equal(await links.nth(brand === "Star Pulse" ? 0 : 1).getAttribute("aria-current"), "page");
          assert(await links.first().getByAltText("Star Pulse").isVisible());
          assert.equal(await links.last().innerText(), "Kolossus");
          assert.equal(await page.locator('script[src*="/gsap/"]').count(), 0);
          await page.keyboard.press("Tab");
          assert.match(await page.locator(":focus").innerText(), /Saltar al contenido/);
          assert(await page.evaluate(() =>
            document.documentElement.scrollWidth <= innerWidth &&
            [...document.images].every(img => img.complete && img.naturalWidth > 0) &&
            [...document.querySelectorAll('a[href^="#"]')].every(a => document.getElementById(a.hash.slice(1)))
          ));
          const first = page.locator('nav a[href^="#"]').first();
          await first.click();
          if (javaScriptEnabled) {
            await page.waitForFunction(() => document.querySelector('nav a[aria-current="location"]')?.hash === location.hash);
            assert.equal(await page.locator('nav [aria-current]').count(), 1);
          }
          if (brand === "Star Pulse") {
            const messages = new Set();
            for (const id of ["waPC", "waAsesor", "waProducto", "waBottom"]) {
              const url = new URL(await page.locator("#" + id).getAttribute("href"));
              assert.equal(url.origin + url.pathname, "https://wa.me/5493564661474");
              assert(url.searchParams.get("text")?.trim());
              messages.add(url.searchParams.get("text"));
            }
            assert.equal(messages.size, 4);
            assert.equal(await page.getByText("Consultar por un armado").getAttribute("href"), await page.locator("#waPC").getAttribute("href"));
            const icon = await page.request.get(new URL(await page.locator('link[rel="icon"]').getAttribute("href"), page.url()).href);
            assert.equal((await icon.body()).subarray(1,4).toString(), "PNG");
            await page.locator('a[href="kolossus/index.html"]').click();
            assert.equal(page.url(), base + "kolossus/index.html");
          } else {
            assert.equal(await page.locator('a[href*="linktr.ee"]').getAttribute("href"), "https://linktr.ee/kolossusti");
            assert.equal(await page.locator("details.service").count(), 6);
            assert.equal(await page.locator('a[href^="mailto:"]').count(), 2);
            for (const number of ["5493564661474", "5493564663933"]) {
              const href = await page.locator('a[href^="https://wa.me/' + number + '"]').getAttribute("href");
              assert(new URL(href).searchParams.get("text").includes("empresa"));
            }
            assert(await page.getByText("Línea en desarrollo").isVisible());
            await page.locator("summary").first().focus();
            await page.keyboard.press("Enter");
            assert.equal(await page.locator("details[open]").count(), 1);
            await page.getByText("Volver a Star Pulse").click();
            assert.equal(page.url(), base + "index.html");
          }
        }
        assert.deepEqual(errors, []);
      });
    }
  }
});

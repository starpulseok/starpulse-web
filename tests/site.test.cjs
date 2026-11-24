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
          assert(await links.last().getByAltText("Kolossus").isVisible());
          assert.equal(await page.locator('script[src*="/gsap/"]').count(), 0);
          await page.keyboard.press("Tab");
          assert.match(await page.locator(":focus").innerText(), /Saltar al contenido/);
          for (const image of await page.locator("img[loading=lazy]:visible").all()) {
            await image.scrollIntoViewIfNeeded({ timeout: 5000 });
            const handle = await image.elementHandle();
            await page.waitForFunction(img => img.complete && img.naturalWidth > 0, handle, { timeout: 8000 });
            await handle.dispose();
          }
          await page.waitForFunction(() => [...document.images].filter(img => img.getClientRects().length)
            .every(img => img.complete && img.naturalWidth > 0), null, { timeout: 8000 });
          assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), await page.evaluate(() => JSON.stringify({width: innerWidth, scroll:document.documentElement.scrollWidth, elements:[...document.querySelectorAll("body *")].filter(el => el.getBoundingClientRect().right > innerWidth).map(el => [el.tagName,el.className,Math.round(el.getBoundingClientRect().right)]).slice(0,15)})));
          assert(await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')]
            .every(a => document.getElementById(a.hash.slice(1)))), brand + ": destino de anclas");
          if (brand === "Star Pulse") {
            assert.equal(await page.locator(".profile-card").count(), 2);
            assert.equal(await page.locator(".activity-card").count(), 10);
            for (const profile of await page.locator(".profile-card").all()) {
              await profile.focus();
              await page.keyboard.press("Enter");
              const group = page.locator(await profile.getAttribute("href"));
              for (const activity of await group.locator(".activity-card").all()) {
                await activity.click();
                const result = page.locator(await activity.getAttribute("href"));
                assert(await result.isVisible());
                assert.equal(await result.locator(".alternatives h5").count(), 2);
              }
            }
            await page.locator(".consult summary").click();
            if (javaScriptEnabled) {
              await page.getByRole("button", {name:"Cotización",exact:true}).click();
              const draft = page.locator(".consult textarea");
              assert.match(await draft.inputValue(), /cotización.*Creación de contenido/);
              await draft.fill("Mi consulta & programas");
              assert.equal(new URL(await page.locator("#explore-wa").getAttribute("href")).searchParams.get("text"),await draft.inputValue());
              assert.equal(new URL(await page.locator("#explore-email").getAttribute("href")).searchParams.get("body"),await draft.inputValue());
            }
            assert(await page.locator("#explore-email").isVisible());
          } else if (javaScriptEnabled) {
            const modes = ["Necesidad puntual", "Acompañamiento tecnológico continuo"];
            for (const mode of modes) {
              await page.locator("#mode").selectOption(mode);
              await page.locator("#need").selectOption({ index: 1 });
              await page.locator("#meeting").check();
              await page.locator("#review").click();
              const draft = page.locator("#draft");
              const text = await draft.inputValue();
              assert.match(text, /coordinar una reunión/);
              assert(text.includes(mode));
              await draft.fill("");
              assert.equal(await page.locator("#whatsapp").getAttribute("href"), null);
              await draft.fill("Consulta editada & revisada");
              const mail = new URL(await page.locator("#email").getAttribute("href"));
              assert.equal(mail.pathname, "martinjoberto@kolossus.com.ar");
              assert.equal(mail.searchParams.get("body"), await draft.inputValue());
              const chat = new URL(await page.locator("#whatsapp").getAttribute("href"));
              assert.equal(chat.searchParams.get("text"), await draft.inputValue());
              await page.locator("#back").click();
            }
          } else {
            assert(await page.locator(".guide-card").isHidden());
            assert(await page.locator(".guide noscript a").first().isVisible());
          }
          const first = page.locator('nav a[href^="#"]').first();
          await first.click();
          if (javaScriptEnabled) {
            await page.waitForFunction(() => document.querySelector('nav a[aria-current="location"]')?.hash === location.hash);
            assert.equal(await page.locator('nav [aria-current]').count(), 1);
          }
          if (brand === "Star Pulse") {
            const categories = page.locator("#productos details");
            assert.equal(await categories.count(), 3);
            for (const category of await categories.all()) {
              await category.locator("summary").focus();
              await page.keyboard.press("Enter");
              assert(await category.locator("li").first().isVisible());
            }
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
            assert.equal(await page.locator("details.service").count(), 4);
            assert.equal(await page.locator('.people a[href^="mailto:"]').count(), 2);
            for (const number of ["5493564661474", "5493564663933"]) {
              const href = await page.locator('.people a[href^="https://wa.me/' + number + '"]').getAttribute("href");
              assert(new URL(href).searchParams.get("text").includes("empresa"));
            }
            assert.doesNotMatch(await page.locator("main").innerText(), /inteligencia artificial|automatización|transformación digital/i);
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

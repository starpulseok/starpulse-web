const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const engines = require("playwright-core");

const root = path.resolve(process.env.SITE_TEST_ROOT || path.join(__dirname, ".."));
const prefix = process.env.SITE_TEST_PREFIX || "/starpulse-web/";
const mime = { html: "text/html; charset=utf-8", css: "text/css", js: "text/javascript", png: "image/png", jpg: "image/jpeg", webp: "image/webp" };
const engine = process.env.BROWSER || "chromium";

test("Navegación de las dos marcas bajo el prefijo del repositorio", async t => {
  const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, "http://localhost").pathname;
    const relative = pathname.slice(prefix.length).replace(/(^|\/)$/, "$1index.html");
    const file = path.resolve(root, relative);
    const type = mime[path.extname(file).slice(1)];
    if (!pathname.startsWith(prefix) || !file.startsWith(root + path.sep) || !type || !fs.existsSync(file)) {
      const errorPage = fs.readFileSync(path.join(root,"404.html"),"utf8");
      res.writeHead(404,{"Content-Type":mime.html}).end(process.env.SITE_TEST_ROOT ? errorPage : errorPage.replace('<base href="/starpulse-web/">', '<base href="' + prefix + '">'));
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

  // El alojamiento sirve el documento de error en la URL solicitada.
  for (const enabled of [false,true]) {
    const audit = await browser.newPage({javaScriptEnabled:enabled, reducedMotion:"reduce"});
    try {
      for (const [route,type] of [["","WebPage"],["kolossus/","Brand"],["starpulse/","Brand"]]) {
        const response = await audit.goto(base + route);
        assert.equal(response.status(),200);
        assert.equal(await audit.locator("html").getAttribute("lang"),"es-AR");
        assert.equal(await audit.locator('meta[name="robots"]').getAttribute("content"),"noindex, follow");
        assert.equal(await audit.locator('link[rel="canonical"]').count(),0);
        const schema = JSON.parse(await audit.locator('script[type="application/ld+json"]').textContent());
        assert.equal((schema.mainEntity || schema)["@type"],type);
        assert.equal(await audit.locator("h1").count(),1);
        for(const meta of ['meta[name="description"]','meta[property="og:title"]','meta[property="og:description"]','meta[name="twitter:card"]']) {
          assert((await audit.locator(meta).getAttribute("content")).trim());
        }
        assert((await audit.request.get(new URL(await audit.locator('link[rel="icon"]').getAttribute("href"),audit.url()).href)).ok());
      }
      const missing = await audit.goto(base+"anterior/enlace-inexistente");
      assert.equal(missing.status(),404);
      assert.equal(await audit.locator("h1").innerText(),"Página no encontrada");
      for (const [label,target] of [["KOLOSSUS","kolossus/index.html"],["Star Pulse","starpulse/index.html"],["Volver al inicio conjunto","index.html"]]) {
        const link=audit.getByRole("link",{name:new RegExp(label)});
        assert.equal(await link.evaluate(a=>a.href),base+target);
        assert((await audit.request.get(base+target)).ok());
      }
    } finally { await audit.close(); }
  }
  for (const width of [320, 360, 390, 430, 768, 1024, 1440, 1920]) {
    for (const javaScriptEnabled of [false, true]) {
      await t.test(width + " px, JavaScript " + javaScriptEnabled, async t => {
        const page = await browser.newPage({ viewport: { width, height: 800 }, javaScriptEnabled, reducedMotion: "reduce" });
        t.after(() => page.close());
        const errors = [];
        page.on("pageerror", error => errors.push(error.message));
        page.on("response", response => { if (response.status() >= 400) errors.push(response.url()); });
        await page.goto(base);
        assert.equal(await page.locator(".portal").count(), 2);
        assert.equal(await page.locator(".portal").first().getAttribute("href"), "kolossus/index.html");
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await page.locator(".portal").first().click();
        await page.locator(".joint-link").click();
        await page.waitForURL(base + "index.html");
        await page.goto(base + "#productos");
        if (javaScriptEnabled) await page.waitForURL(base + "starpulse/index.html#productos");
        else await page.locator("#productos.legacy").click();
        assert.equal(page.url(),base + "starpulse/index.html#productos");
        await page.goto(base);
        await page.locator(".portal.star").click();
        for (const brand of ["Star Pulse", "Kolossus"]) {
          assert((await page.title()).toLowerCase().startsWith(brand.toLowerCase()));
          const navLinks = page.locator(".header nav a");
          assert(await navLinks.evaluateAll(links => links.every(a => a.getBoundingClientRect().height >= 44)));
          assert(await navLinks.evaluateAll(links => links.every((a,i) => i === 0 ||
            (document.getElementById(links[i-1].hash.slice(1)).compareDocumentPosition(document.getElementById(a.hash.slice(1))) & Node.DOCUMENT_POSITION_FOLLOWING))));
          assert(await page.evaluate(() => [...document.images].every(i => i.hasAttribute("alt") && i.hasAttribute("width") && i.hasAttribute("height"))));
          const selector = page.getByRole("group", { name: "Seleccionar marca" });
          const links = selector.getByRole("link");
          assert.equal(await links.count(), 2);
          assert.equal(await selector.locator('[aria-current="page"]').count(), 1);
          assert.equal(await links.nth(brand === "Star Pulse" ? 1 : 0).getAttribute("aria-current"), "page");
          assert(await links.last().getByAltText("Star Pulse").isVisible());
          assert(await links.first().getByAltText("Kolossus").isVisible());
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
          } else {
            await page.getByRole("navigation").getByRole("link", {name:"Trayectoria"}).click();
            await page.getByRole("navigation").getByRole("link", { name:"Experiencia", exact:true }).click();
            const sectors = page.locator("#experiencia h3");
            assert.deepEqual(await sectors.allTextContents(), ["Industria","Comercio","Agroindustria","Servicios profesionales","Salud","Educación","Instituciones"]);
            const applications = page.locator("#soluciones-practicas details");
            assert.equal(await applications.count(), 7);
            for (const item of await applications.all()) {
              await item.locator("summary").focus();
              await page.keyboard.press("Enter");
              assert(await item.locator("p").isVisible());
              await page.keyboard.press("Space");
              assert(await item.locator("p").isHidden());
            }
            const tech = page.locator("#tecnologias");
            assert.equal(await tech.locator("dt").count(), 5);
            for (const term of ["Microsoft Windows","GNU/Linux","TP-Link Omada","Tailscale","Google Workspace","Dropbox","ChatGPT (OpenAI) en proyectos piloto"]) {
              assert((await tech.innerText()).includes(term));
            }
            assert.equal(await tech.getByRole("link").getAttribute("href"), "#contacto");
            const history = page.locator("#historia");
            assert.equal(await history.locator(".history-line > li").count(), 3);
            for (const detail of await history.locator("details").all()) {
              const trigger = detail.locator("summary");
              await trigger.focus();
              await page.keyboard.press("Enter");
              assert(await detail.locator("p").isVisible());
              await page.keyboard.press("Space");
              assert(await detail.locator("p").isHidden());
            }
            assert.equal(await history.getByText(/IS2ME/i).count(), 0);
            await page.getByRole("navigation").getByRole("link", {name:"Equipo", exact:true}).click();
            const profiles = page.locator("#equipo article");
            assert.deepEqual(await profiles.locator("h3").allTextContents(), ["Esp. Ing. Darío J. Oberto","Martín J. Oberto"]);
            for (const profile of await profiles.all()) {
              const summary = profile.locator("summary");
              await summary.press("Enter");
              assert(await profile.locator("details p").isVisible());
              await summary.press("Space");
              assert(await profile.locator("details p").isHidden());
            }
            assert.equal(await history.locator("#cluster a").getAttribute("href"), "https://clustersanfrancisco.com.ar/");
            assert.equal(await history.locator('a[href^="https://www.iso.org/"]').count(), 2);
            const cycle = page.locator("#ciclo");
            const nodes = cycle.locator(".cycle-links a");
            assert.equal(await nodes.count(), 6);
            assert.equal(await cycle.locator(".phase:visible").count(), javaScriptEnabled ? 1 : 6);
            for (const i of [5, 0, 3, 1, 4, 2]) {
              const link = nodes.nth(i);
              await link.focus();
              await page.keyboard.press("Enter");
              const panel = page.locator(await link.getAttribute("href"));
              assert(await panel.isVisible());
              if (javaScriptEnabled) {
                assert.equal(await link.getAttribute("aria-current"), "step");
                assert.equal(await cycle.locator(".phase:visible").count(), 1);
              }
              const related = panel.locator('a[href^="#servicio-"]');
              const target = page.locator(await related.getAttribute("href"));
              assert.equal(await target.count(), 1);
              if (javaScriptEnabled) {
                await related.click();
                assert(await target.evaluate(el => el.open));
                await target.locator("summary").click();
              }
            }
            assert.equal(await cycle.locator(".cycle-contact a").getAttribute("href"), "#contacto");
            const services = page.locator("details.service");
            assert.equal(await services.count(), 5);
            for (const card of await services.all()) {
              const summary = card.locator("summary");
              await summary.focus();
              await page.keyboard.press("Enter");
              assert(await card.locator(".answer").isVisible());
              const draft = card.locator("textarea");
              if (javaScriptEnabled) await draft.fill("Consulta sobre TI & coordinación");
              const chat = new URL(await card.locator(".chat").getAttribute("href"));
              const mail = new URL(await card.locator(".mail").getAttribute("href"));
              const meeting = new URL(await card.locator(".meet-link").getAttribute("href"));
              assert.equal(chat.pathname, "/5493564661474");
              assert.equal(mail.pathname, "martinjoberto@kolossus.com.ar");
              assert.equal(chat.searchParams.get("text"), mail.searchParams.get("body"));
              assert(meeting.searchParams.get("body").includes("coordinar una reunión"));
              if (javaScriptEnabled) assert.equal(mail.searchParams.get("body"),await draft.inputValue());
              await summary.click();
            }
          }
          const editor = page.locator(".contact-editor");
          if (!javaScriptEnabled) {
            assert(await editor.isHidden());
            const contextual = page.locator(brand === "Star Pulse" ? ".solution [data-compose]" : ".phase [data-compose]").first();
            const fallback = new URL(await contextual.getAttribute("href"));
            assert.equal(fallback.protocol,"mailto:");
            assert(fallback.searchParams.get("body").includes(brand === "Star Pulse" ? "Empresa · Administración" : "Necesidad"));
            assert(await page.locator('#contacto a[href^="mailto:"]').first().isVisible());
            assert(await page.locator('#contacto a[href^="https://wa.me/"]').first().isVisible());
          } else {
            if (brand === "Kolossus") {
              const service = page.locator(".service").first();
              await service.locator("summary").click();
              await service.locator("[data-compose]").click();
              assert.match(await editor.locator("[data-draft]").inputValue(), /Servicio: Consultoría e ingeniería TI/);
              await service.locator("summary").click();
            } else {
              for (const [profile, intent] of [["empresa","Cotización"],["persona","Asesoramiento"]]) {
                await page.locator('.profile-card[href="#perfil-' + profile + '"]').click();
                await page.locator(".solution:visible [data-compose]").click();
                await editor.locator("[data-type]").selectOption(intent);
                const text = await editor.locator("[data-draft]").inputValue();
                assert(text.includes(intent) && text.toLowerCase().includes("perfil: " + profile));
              }
            }
            if (brand === "Star Pulse") await page.locator('.profile-card[href="#perfil-empresa"]').click();
            else await page.locator('.cycle-links a[href="#fase-01"]').click();
            const entry = brand === "Star Pulse" ? page.locator(".solution:visible [data-compose]").first()
              : page.locator(".phase:visible [data-compose]");
            await entry.click();
            const draft = editor.locator("[data-draft]");
            assert.match(await draft.inputValue(), brand === "Star Pulse" ? /Perfil: Empresa.*\nActividad:/ : /Etapa: Necesidad/);
            await editor.locator("summary").click();
            await editor.locator('[data-field^="Nombre"]').fill("Sol & Río");
            if (brand === "Kolossus") {
              await editor.locator("[data-recipient]").selectOption({label:"Esp. Ing. Darío Julián Oberto · Dirección e Ingeniería TI"});
              await editor.locator("[data-type]").selectOption("Reunión");
              assert.match(await draft.inputValue(), /coordinar una reunión/);
              assert.equal(new URL(await editor.locator("[data-chat]").getAttribute("href")).pathname, "/5493564663933");
            } else {
              await editor.locator('[data-field="Cantidad de equipos o puestos"]').fill("3");
              await editor.locator('[data-field="Alternativas"]').selectOption("Notebook");
              assert.match(await draft.inputValue(), /Alternativas: Notebook/);
            }
            const generated = await draft.inputValue();
            assert(generated.includes("Sol & Río"));
            const custom = generated + "\nPrueba & + # %";
            await draft.fill(custom);
            assert.equal(new URL(await editor.locator("[data-mail]").getAttribute("href")).searchParams.get("body"),custom);
            assert.equal(new URL(await editor.locator("[data-chat]").getAttribute("href")).searchParams.get("text"),custom);
            await page.evaluate(() => Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async s => {window.copiedDraft=s;}}}));
            await editor.locator("[data-copy]").click();
            assert.equal(await page.evaluate(()=>window.copiedDraft),custom);
            await draft.fill("");
            assert.equal(await editor.locator("[data-chat]").getAttribute("href"), null);
            await editor.locator("[data-rebuild]").click();
            assert.equal(await draft.inputValue(), generated);
            await editor.locator("summary").click();
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
            await page.locator('a[href="../kolossus/index.html"]').click();
            assert.equal(page.url(), base + "kolossus/index.html");
          } else {
            assert.equal(await page.locator('a[href*="linktr.ee"]').getAttribute("href"), "https://linktr.ee/kolossusti");
            assert.equal(await page.locator("details.service").count(), 5);
            assert.equal(await page.locator('.people a[href^="mailto:"]').count(), 2);
            for (const number of ["5493564661474", "5493564663933"]) {
              const href = await page.locator('.people a[href^="https://wa.me/' + number + '"]').getAttribute("href");
              assert(new URL(href).searchParams.get("text").includes("empresa"));
            }
            assert(await page.getByText("Evolución tecnológica y transformación digital", { exact:true }).isVisible());
            await page.locator("summary").first().focus();
            await page.keyboard.press("Enter");
            assert.equal(await page.locator("details[open]").count(), 1);
            await page.getByText("Volver a Star Pulse").click();
            assert.equal(page.url(), base + "starpulse/index.html");
            await page.locator("footer").getByRole("link", {name:"Inicio",exact:true}).click();
            assert.equal(page.url(),base + "index.html");
          }
        }
        await page.locator(".portal.star").click();
        const story = page.locator("#quienes");
        assert.equal(await story.locator(".storyline li").count(), 3);
        assert.match(await story.locator("li").first().innerText(), /KOLOSSUS, desde 2004/);
        const companyLink = page.getByRole("link", { name: "Conocer las soluciones de KOLOSSUS" });
        if (javaScriptEnabled) {
          await page.locator('.profile-card[href="#perfil-persona"]').click();
          assert(await companyLink.isHidden());
          await page.locator('.profile-card[href="#perfil-empresa"]').click();
        }
        assert(await companyLink.isVisible());
        await companyLink.focus();
        await page.keyboard.press("Enter");
        await page.waitForURL(base + "kolossus/index.html#servicios");
        const equipment = page.locator("#servicio-equipamiento");
        // La navegación al fragmento puede terminar de posicionar el foco después de la carga.
        const equipmentSummary = equipment.locator("summary");
        await equipmentSummary.scrollIntoViewIfNeeded();
        await equipmentSummary.press("Enter");
        const equipmentLink = equipment.getByRole("link", { name: "Explorar equipamiento en Star Pulse" });
        assert(await equipmentLink.isVisible());
        await equipmentLink.focus();
        await page.keyboard.press("Enter");
        await page.waitForURL(base + "starpulse/index.html#orientador");
        assert(await page.locator("#perfil-empresa").isVisible());
        assert.deepEqual(errors, []);
      });
    }
  }
});


test("Plan SEO con un origen ficticio y subdirectorio", () => {
  const { productionPlan } = require("../tools/plan-seo.cjs");
  const plan = productionPlan("https://ejemplo.invalid/ensayo/");
  assert.equal(plan.pages.length,3);
  assert.equal(plan.pages[1].canonical,"https://ejemplo.invalid/ensayo/kolossus/");
  assert.equal(plan.errorBase,"/ensayo/");
  assert.equal((plan.sitemap.match(/<loc>/g)||[]).length,3);
  assert(plan.robots.includes("https://ejemplo.invalid/ensayo/sitemap.xml"));
  assert.throws(()=>productionPlan("http://ejemplo.invalid/"));
});

test("El plan SEO rechaza rutas ambiguas y destinos incompletos", () => {
  const { productionPlan } = require("../tools/plan-seo.cjs");
  for (const url of ["https://ejemplo.invalid/a/../b/", "https://ejemplo.invalid/%2e%2e/",
                     "https://ejemplo.invalid/.git/", "http://ejemplo.invalid/"]) {
    assert.throws(() => productionPlan(url));
  }
  const config = { entrada: "https://ejemplo.invalid/", kolossus: "https://ejemplo.invalid/k/",
                   starpulse: "https://ejemplo.invalid/s/" };
  assert.throws(() => productionPlan(config));
  assert.throws(() => productionPlan({ ...config, imagenConjunta: config.entrada }));
});

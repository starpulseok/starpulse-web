# Star Pulse y Kolossus

Star Pulse ofrece hardware y armado de PCs a medida. Kolossus es su unidad empresarial. Las dos páginas se sirven como archivos estáticos, incluso bajo el prefijo de un repositorio en GitHub Pages.

## Estructura

- index.html y styles.css componen Star Pulse. assets/ conserva los logos originales, la imagen WebP de portada y el favicon derivado del logo oficial.
- kolossus/index.html y kolossus/styles.css componen el sitio institucional.
- app.js sincroniza la navegación activa de ambas páginas. En Star Pulse también actualiza el año y el encabezado.
- tests/site.test.cjs prueba ambas marcas con un servidor local temporal. .github/workflows/checks.yml ejecuta comprobaciones con permisos de lectura.

## Desarrollo local

Abrí index.html o kolossus/index.html. Para servir el proyecto por HTTP, ejecutá python -m http.server 8000 --bind 127.0.0.1 desde la raíz y visitá http://127.0.0.1:8000/. No hay compilación.

## Sincronizar dos computadoras

Cloná el repositorio una vez en cada equipo con git clone https://github.com/starpulseok/starpulse-web.git y entrá en starpulse-web. Seleccioná la rama con git switch desarrollo (si falta el seguimiento local, usá git switch --track origin/desarrollo).

Antes de empezar en cualquiera de las dos computadoras, revisá git status y ejecutá git pull --ff-only origin desarrollo con el árbol limpio. Al terminar, revisá git diff y corré las pruebas. Con aprobación, agregá los archivos previstos, hacé el commit y ejecutá git push origin desarrollo. En la otra computadora, repetí el pull antes de editar. Los cambios sin commit quedan en el primer equipo. Si las ramas divergen, revisá git log --oneline --left-right desarrollo...origin/desarrollo y acordá la integración antes de continuar. Evitá sincronizar la carpeta .git con servicios de archivos.

## Pruebas

Usá Node.js 22 y npm. El siguiente ejemplo en PowerShell instala herramientas de prueba fuera del repositorio.

```powershell
$toolsDir = Join-Path $env:TEMP 'starpulse-test-tools'
npm install --prefix $toolsDir --no-save --ignore-scripts playwright-core@1.56.1
$env:NODE_PATH = Join-Path $toolsDir 'node_modules'
node "$env:NODE_PATH/playwright-core/cli.js" install chromium firefox webkit
node --check app.js
foreach ($browserName in 'chromium','firefox','webkit') {
  $env:BROWSER = $browserName
  node --test tests/site.test.cjs
  if ($LASTEXITCODE) { throw "Fallaron las pruebas en $browserName" }
}
```

Para usar Edge instalado en Windows, configurá BROWSER=chromium y BROWSER_CHANNEL=msedge. Quitá BROWSER_CHANNEL antes de probar otros motores. El flujo de Actions ejecuta la matriz en Linux, sin despliegue.

## Alojamiento y metadatos

Ambas marcas tienen título, descripción y metadatos sociales propios. Cuando se confirme el alojamiento, definir dominios, URL canónicas, og:url, sitemap y URL absolutas de imágenes sociales aprobadas. Verificar las previsualizaciones públicas entonces. La promoción a main y los cambios de publicación requieren autorización.

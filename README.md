# Star Pulse y Kolossus

Star Pulse ofrece hardware y armado de PCs a medida. KOLOSSUS Consultoría en TI es una marca independiente. Las dos páginas se sirven como archivos estáticos, incluso bajo el prefijo de un repositorio en GitHub Pages.

## Estructura

- index.html, entrada.css y entrada.js forman la entrada compartida. Los marcadores de la antigua portada comercial se derivan a starpulse/index.html con el mismo fragmento. Sin JavaScript se ofrece un enlace de continuación.
- starpulse/index.html y styles.css componen Star Pulse. assets/ conserva los logos originales, la imagen WebP de portada y el favicon derivado del logo oficial.
- kolossus/index.html y kolossus/styles.css componen el sitio institucional.
- app.js sincroniza la navegación activa de ambas páginas. En Star Pulse también actualiza el año y el encabezado.
- tests/site.test.cjs prueba ambas marcas con un servidor local temporal. .github/workflows/checks.yml ejecuta comprobaciones con permisos de lectura.

## Desarrollo local

Abrí index.html para elegir una marca, o entrá directamente a kolossus/index.html o starpulse/index.html. Para servir el proyecto por HTTP, ejecutá python -m http.server 8000 --bind 127.0.0.1 desde la raíz y visitá http://127.0.0.1:8000/. No hay compilación.

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

## Experiencia visual y licencias

experience.css comparte el selector de marcas, el encabezado y las microinteracciones. motion.js carga las copias locales de GSAP y ScrollTrigger 3.13.0 cuando se admite movimiento. Los archivos provienen de la distribución npm oficial de gsap y conservan sus avisos de licencia. Se utilizan para coordinar entradas y parallax. Licencia estándar de GSAP: https://gsap.com/standard-license/ . Mantener ambos archivos en la misma versión al actualizarlos.

El selector y las tarjetas son implementaciones propias en HTML y CSS. Se evaluaron las tarjetas de Cult UI y los componentes React de Watermelon UI como referencias de profundidad e interacción. No se redistribuyen componentes, imágenes ni código de esas bibliotecas. Las transiciones entre documentos usan la API nativa cuando está disponible.

## KOLOSSUS

La página institucional utiliza el azul #0866FF, blanco y tonos pizarra. kolossus/logo.webp y kolossus/favicon.png derivan de assets/2024_LOGO_v1.01.png. Los servicios se amplían con details y summary nativos. Los datos de contacto públicos están en el HTML.

## Imágenes de hardware de Star Pulse

Los cuatro WebP de assets/hardware/ provienen de una composición original generada con ImageGen para esta página. El encargo visual fue una estación de alto rendimiento sobre azul nocturno, un procesador sobre su placa, teclado con mouse y cables con hub. Se exportó cada cuadrante por separado. Son ilustraciones de categorías y servicios, sin relación con inventario ni instalaciones. El selector conserva el logo original de Star Pulse y usa el nombre recortado del archivo oficial de KOLOSSUS en assets/kolossus-selector.webp. La sección #armado es el punto de integración para un futuro configurador.

## Explorador de Star Pulse

Cada actividad tiene su propia comparación de escritorio y notebook en starpulse/index.html. explore.js muestra el perfil seleccionado y prepara el mensaje editable en memoria. Sin JavaScript, los enlaces del explorador llevan a las alternativas del mismo documento. Las doce escenas WebP de assets/perfiles fueron generadas con ImageGen para ilustrar actividades cotidianas; no identifican instalaciones ni clientes. Las tarjetas de hardware y los recursos oficiales conservan sus procedencias anteriores.

La portada institucional presenta cinco áreas de ingeniería y gestión. Cada tarjeta de KOLOSSUS relaciona una situación empresarial con su alcance y permite preparar una consulta o solicitar una reunión. Los enlaces funcionan sin JavaScript; guide.js permite editar el borrador en la tarjeta sin guardar datos.

## Ciclo de infraestructura de KOLOSSUS

Después de los cinco servicios, #ciclo relaciona seis etapas con sus tarjetas de servicio. kolossus/ciclo.css organiza un anillo SVG en escritorio y una secuencia conectada en pantallas pequeñas. kolossus/ciclo.js permite seleccionar por teclado o puntero y anima la señal con la copia local de GSAP cuando está disponible. Sin JavaScript, los enlaces llevan a seis descripciones visibles en el HTML. Las etapas tienen enlaces directos desde #fase-01 hasta #fase-06.

## Historia y vínculos entre marcas

starpulse/index.html#quienes presenta la trayectoria de KOLOSSUS desde 2004 y el origen de la identidad STAR PULSE. Dentro del perfil Empresa se puede pasar a kolossus/index.html#servicios. El panel del servicio de provisión de equipamiento devuelve al explorador en starpulse/index.html#orientador. Ambos enlaces son HTML nativo y vinculos.css comparte sus estilos.

## Trayectoria institucional de KOLOSSUS

La sección `kolossus/index.html#historia` reúne el origen de la consultora, sus aportes profesionales y la vinculación regional. Los detalles se abren con HTML nativo. `kolossus/trayectoria.js` agrega una transición opcional con GSAP que respeta la preferencia de movimiento reducido.

- Las fichas de ISO distinguen los requisitos del sistema de gestión de las orientaciones sobre controles. Se enlazan como bibliografía. [ISO/IEC 27001:2022](https://www.iso.org/standard/27001) · [ISO/IEC 27002:2022](https://www.iso.org/standard/75652.html)
- La membresía de KOLOSSUS se puede verificar en el listado de empresas del [Cluster Tecnológico San Francisco](https://clustersanfrancisco.com.ar/).

En `#equipo`, las dos tarjetas presentan función y responsabilidades; los desplegables reúnen la formación pública aprobada. Al recibir retratos profesionales autorizados, podrán incorporarse en el encabezado de cada tarjeta con dimensiones explícitas y su recurso en el inventario. Conservar la misma jerarquía visual entre los dos perfiles.

## Experiencia empresarial de KOLOSSUS

En `kolossus/index.html`, `#experiencia` reúne los sectores confirmados por KOLOSSUS. Las tarjetas describen necesidades de cada actividad. En `#soluciones-practicas`, cada elemento `details` contiene el nombre de la solución en `summary` y un párrafo con su alcance. Esta estructura admite proyectos reales cuando exista autorización sobre el contenido público. Mantener las propuestas de trabajo diferenciadas de los proyectos realizados.

La sección `#tecnologias` organiza por categoría las herramientas y capacidades confirmadas. Identifica el alcance piloto cuando corresponde. Para ampliarla, verificar el uso efectivo antes de agregar una denominación. Mantener las evidencias privadas fuera del repositorio.

## Consultas y reuniones

Ambas páginas comparten `contacto.js` y `contacto.css`. Los enlaces con `data-compose` llevan el contexto de la actividad, el servicio, la etapa o la solución al editor de contacto. Las páginas conservan enlaces HTML directos a WhatsApp y correo. Sin JavaScript el visitante puede completar el mensaje en la aplicación elegida.

Los campos opcionales y los borradores se procesan en memoria. Las acciones de canal codifican el mensaje como parámetro del enlace. Abrir el enlace prepara la conversación en el destino y el visitante decide el envío. Las ediciones manuales se conservan al modificar otros campos hasta elegir expresamente reemplazarlas.

El tipo de consulta «Reunión» prepara un pedido de coordinación por los mismos canales. Una futura integración con Google Calendar requiere acordar responsables, disponibilidad, tratamiento de datos y autorización de acceso. El sitio actual funciona sin cuentas conectadas ni servicios de formularios.

## Revisión visual y responsive

La suite recorre las tres páginas a 320, 360, 390, 430, 768, 1024, 1440 y 1920 px con JavaScript activado y desactivado. Comprueba el orden de los enlaces según las secciones reales, los destinos entre marcas, los borradores de contacto y la navegación por teclado. Los enlaces de navegación ofrecen 44 px de altura y el encabezado deja de fijarse cuando queda poca altura visible. Para revisar los estilos, verificá también el zoom al 200 %, el foco y la preferencia de movimiento reducido.

## SEO y paso de preview a producción

Las tres páginas contienen noindex, follow en HTML inicial y datos JSON-LD de WebPage y Brand. El preview conserva acceso de rastreo y evita enviar un sitemap a buscadores. La directiva solo surte efecto después de servir la versión nueva y de que el buscador vuelva a rastrear. Para un preview privado, habilitar autenticación en el servidor.

El [manual de mantenimiento](MANTENIMIENTO.md) documenta el inventario de publicación, el plan SEO para uno o varios orígenes, los comandos de empaquetado y verificación, la restauración y las pruebas pendientes en el alojamiento. El [historial de cambios](CHANGELOG.md) reúne los hitos de la candidata.

El logo compacto assets/starpulse-selector.webp deriva del original assets/logo.jpg. La entrada dibuja el fondo de partículas con Canvas 2D nativo y adapta la densidad al tamaño de pantalla. El botón de pausa, la preferencia de movimiento reducido y la visibilidad de la pestaña controlan el bucle de dibujo. Sin JavaScript se muestra el fondo estático en CSS. En ambas marcas, el enlace Inicio del encabezado y del pie vuelve a la entrada compartida. Las páginas internas conservan GSAP y ScrollTrigger locales. El planificador y las pruebas son archivos de mantenimiento que deben excluirse del paquete.

## Organización visual de ambas marcas

La entrada conserva las dos tarjetas de marca. En Star Pulse, los accesos al explorador y al catálogo comparten un grupo y el armado por WhatsApp tiene un enlace directo. En KOLOSSUS, el ciclo explica la vida de la infraestructura y las dos modalidades de trabajo preceden a la metodología completa, disponible por teclado y sin JavaScript.

Las plantillas HTML `plantilla-organizaciones` y `plantilla-proyectos` son inertes. La primera reserva una lista común para organizaciones históricas y actuales; la segunda corresponde a proyectos destacados. Incorporar únicamente material autorizado por Martín y Darío y mantener fuera del repositorio los permisos privados. Una plantilla vacía debe permanecer sin renderizar.

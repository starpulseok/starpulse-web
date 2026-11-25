# Mantenimiento del sitio conjunto

## Desarrollo desde dos equipos

Usá Git, Node.js 22 y Python 3.9 o posterior. El sitio es estático. Cloná el repositorio en cada equipo y seleccioná `desarrollo`. Antes de editar, ejecutá `git status -sb`, `git fetch origin` y, con el árbol limpio, `git pull --ff-only origin desarrollo`. Revisá diferencias antes de integrar ramas divergentes. Los archivos sin commit solo están disponibles en el equipo donde se editaron. Después de las pruebas y la aprobación, subí el commit a `desarrollo` y sincronizá el segundo equipo. La integración a `main`, el etiquetado y la publicación requieren autorización independiente. Un push a desarrollo puede actualizar el preview de Pages.

## Dónde editar

| Contenido | Archivos y comprobación |
|---|---|
| Entrada y enlaces históricos | `index.html`, `entrada.css`, `entrada.js`. Conservá los fragmentos y el enlace alternativo sin JavaScript. |
| Servicios de KOLOSSUS | Editá las tarjetas HTML en `kolossus/index.html`. Conservá los identificadores usados por navegación, ciclo y orientador. Revisá la correspondencia con `guide.js` y los enlaces de consulta. |
| Categorías y actividades de Star Pulse | Editá `starpulse/index.html` y las interacciones en `explore.js`. Comprobá el catálogo, ambos perfiles, los anclajes, la comparación y el resumen del mensaje. |
| Textos y contacto | Actualizá el HTML visible y, si corresponde, títulos, metadatos y JSON-LD. Buscá el correo o número anterior en todo el proyecto. Actualizá enlaces directos, borradores y pruebas. Revisá `contacto.js`, `guide.js` y `explore.js`. Usá solo canales aprobados. |
| Imágenes | Conservá los originales y su procedencia. Ajustá dimensiones, texto alternativo, `srcset` y `sizes` según su uso. Registrá cada nuevo recurso público en `tools/publicacion.txt`. |
| Presentación compartida | `experience.css`, `motion.js`, `vendor/gsap/`. Conservá versiones compatibles, avisos de licencia y soporte de movimiento reducido. |

Serví desde la raíz con `python -m http.server 8000 --bind 127.0.0.1`. Para una revisión funcional, seguí la instalación de Playwright y la matriz de navegadores del [README](README.md#pruebas). Revisá teclado, foco, zoom, anchos móviles y alternativas sin JavaScript. Los mensajes comerciales se prueban hasta la preparación del borrador.

## Empaquetar un preview

Desde la raíz, elegí una revisión existente y una carpeta de salida privada, fuera del repositorio y de cualquier raíz servida por HTTP. El generador utiliza Git para leer los archivos de esa revisión. El inventario, el planificador y el verificador son los de la copia local de herramientas. Conservá también su revisión cuando se aprueben.

```powershell
$revision = '1318edfaf4c85b3d6480c816376fd2ad8fb664b0'
$salida = Join-Path $env:USERPROFILE 'Downloads/Paquetes-web'
python tools/publicar.py preview --ref $revision --salida $salida --montaje /starpulse-web/
```

Para ensayar en la raíz, repetí con `--montaje /`. Cada ejecución reserva un directorio independiente y muestra la ruta de `entrega`. Guardá juntos `sitio.zip`, `manifiesto.json` y `SHA256SUMS.txt`. El manifiesto registra revisión, modalidad, montaje, rutas, tamaños y SHA-256 de cada archivo. Los avisos de licencia de GSAP y ScrollTrigger viajan dentro de las bibliotecas locales. Solo se admiten los archivos públicos enumerados. Una revisión anterior que carezca de un recurso requerido necesita el inventario y las herramientas compatibles con esa revisión.

```powershell
$entrega = Read-Host 'Ruta de entrega impresa por el generador'
python tools/publicar.py verificar $entrega
if ($LASTEXITCODE) { throw 'Falló la verificación' }
Get-FileHash (Join-Path $entrega 'sitio.zip') -Algorithm SHA256
```

El verificador reconstruye la carga esperada desde Git, compara los bytes, revisa el listado ZIP, los destinos y fragmentos internos del HTML, los recursos referidos y las sumas externas. Custodiá una copia confiable del manifiesto y las sumas. Para probar el ZIP con navegador, extraelo en una carpeta vacía fuera del repositorio. Seleccioná esa carpeta en `SITE_TEST_ROOT`, configurá `SITE_TEST_PREFIX` con el montaje usado y ejecutá `node --test tests/site.test.cjs` con el entorno de Playwright del README. Quitá ambas variables al volver a probar fuentes.

## Preparar producción después de la aprobación

Acordá las tres URLs HTTPS terminadas en barra, la ubicación de la imagen social conjunta y el permiso de indexación. Prepará un JSON fuera de la raíz pública con las claves `entrada`, `kolossus`, `starpulse` e `imagenConjunta`. Las primeras tres son URLs completas diferentes, que pueden compartir origen. La cuarta debe apuntar al archivo gráfico aprobado y accesible públicamente. El generador referencia esa imagen por URL. Comprobá su respuesta y contenido antes del lanzamiento.

```powershell
$config = Read-Host 'Ruta del JSON con URLs aprobadas'
node tools/plan-seo.cjs --config $config
python tools/publicar.py produccion --ref $revision --salida $salida --config-aprobada $config --autorizar-indexacion
```

Verificá la entrega con el mismo comando del preview. La copia de producción agrupa archivos por host, genera sitemap por montaje, robots en la raíz del origen y canónicas e imágenes sociales absolutas. El error 404 conserva noindex. La entrada y las dos páginas comerciales pueden indexarse. Revisá los enlaces entre dominios, las imágenes y sus permisos. Con otros sitios en el mismo origen, conciliá el robots.txt y el manejador 404 con el administrador antes de instalar archivos.

## Versionado y restauración

Registrá el cambio en [CHANGELOG.md](CHANGELOG.md). Reservá `v1.0.0` para el primer lanzamiento aprobado, `v1.0.1` para correcciones compatibles, `v1.1.0` para funciones compatibles y `v2.0.0` para cambios mayores de arquitectura o incompatibilidades. Para cada entrega, registrá la revisión completa del sitio y de las herramientas, el montaje, los resultados de pruebas y las sumas. Tras aprobar una versión, el tag anotado debe señalar exactamente el SHA probado.

Para restaurar, recuperá el paquete archivado con sus sumas y verificálo con su revisión de herramientas. Probalo en un entorno aislado con el mismo montaje. Conservá una copia de lo que se va a reemplazar y restaurá solo los archivos públicos propios de esa entrega con autorización del responsable. Volvé a comprobar rutas, 404, imágenes, contacto e indexación. Para recuperar código sin reescribir historial, usá una rama de revisión desde el SHA conocido o revertí el commit correspondiente en desarrollo y ejecutá las pruebas.

## Cierre de la auditoría 20A

Mediciones finales existentes de Lighthouse 13.5.0 sobre HTTP local. Cada celda de rendimiento y LCP presenta móvil / escritorio.

| Página | Rendimiento | LCP (s) |
|---|---|---|
| Entrada | 100 / 100 | 1,06 / 0,29 |
| KOLOSSUS | 99 / 100 | 2,16 / 0,56 |
| Star Pulse | 99 / 100 | 1,89 / 0,47 |

En las seis mediciones finales, accesibilidad y buenas prácticas obtuvieron 100, SEO 63, CLS 0 y se registraron cero errores de consola. La única comprobación SEO fallida fue la de indexabilidad, esperada por el noindex del preview. Son mediciones de laboratorio, una por combinación en cada estado. La variación de red y equipo afecta los tiempos. La cobertura automática de accesibilidad y seguridad es parcial.

En Maximus quedan pendientes el ensayo en un montaje aislado, restauración, TLS, cabeceras, caché, compresión, MIME, 404 HTTP real, rutas históricas, coexistencia con XOOPS, disponibilidad de la imagen conjunta y rendimiento con la red y configuración efectivas. Revisá canónicas, robots, sitemap y directivas del servidor antes de autorizar la indexación.

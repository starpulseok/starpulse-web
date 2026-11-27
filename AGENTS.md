# Astra Pulse

Página comercial de equipamiento tecnológico, componentes, periféricos y accesorios. Su objetivo es orientar consultas por WhatsApp y facilitar el acceso a KOLOSSUS, marca independiente. El eslogan es «Hardware pensado para vos».

## Estructura

- index.html es la entrada conjunta de KOLOSSUS y ASTRA PULSE. entrada.css y entrada.js implementan su presentación y la compatibilidad con marcadores históricos.
- astrapulse/index.html contiene la portada, los servicios de hardware, el contacto y los enlaces comerciales.
- styles.css define la paleta de la interfaz y el diseño adaptable. El logo oficial de Astra Pulse conserva el negro y el dorado originales.
- app.js administra aria-current en ambas páginas y, en Astra Pulse, la sombra del encabezado y el año del pie. experience.css y motion.js comparten el selector y los efectos de ambas marcas. Respetar movimiento reducido y conservar los avisos de licencia en vendor/gsap.
- assets/ conserva los logos. README.md presenta el proyecto.

- kolossus/index.html y kolossus/styles.css contienen la página institucional y su diseño institucional. Su navegación y sus tarjetas de servicios usan HTML nativo.

## Mantenimiento

- Con cada hito importante, actualizar el estado al inicio del README, la fecha, el último commit respaldado, la hoja de ruta y el estado del lanzamiento. Registrar el alcance en CHANGELOG.md y distinguir el trabajo local pendiente de los hitos aprobados y respaldados. Verificar los enlaces de preview y los indicadores automáticos al cambiar las rutas o los flujos.

- Trabajar en desarrollo. Modificar main, hacer merge o push requiere autorización. Conservar historial, logos, contenidos y funcionalidades.
- Escribir en español de Argentina y mantener una estética moderna, tecnológica y profesional. Mantener Kolossus como página empresarial independiente.
- Usar HTML, CSS y JavaScript estáticos compatibles con GitHub Pages, con rutas relativas y sin dependencias innecesarias.
- Mantener los destinos de WhatsApp en el HTML con el número existente y mensajes codificados por acción. El contenido y los enlaces deben funcionar con JavaScript desactivado.
- Al agregar secciones, hacer coincidir el href del menú con el id de destino.
- Abrir index.html en el navegador. Revisar navegación, contacto y legibilidad en computadora, tablet y celular, con y sin JavaScript. Validar app.js con node --check app.js y revisar git diff antes de entregar.

- Vincular las marcas en la misma pestaña con rutas relativas. Probar ambos index.html desde archivos locales y bajo el prefijo de un repositorio en GitHub Pages.
- Usar únicamente información institucional verificada. Conservar los recursos existentes y excluir información confidencial de empresas. Conservar WhatsApp, correo y Linktree institucionales. No publicar clientes, domicilio ni horarios sin autorización.

- Seguir el flujo de dos computadoras documentado en README.md. Revisar status y actualizar desarrollo con pull --ff-only antes de editar. Compartir trabajo aprobado mediante commits y push a desarrollo.
- Correr tests/site.test.cjs según README.md. La matriz de .github/workflows/checks.yml solo comprueba el sitio. Mantener las rutas relativas, los cuatro mensajes de WhatsApp y el acceso directo desde Servicios.
- Revisar foco, contraste, zoom al 200 % y navegación sin JavaScript al cambiar el encabezado. Conservar las URL canónicas, imágenes sociales absolutas y sitemap como pendientes hasta confirmar el alojamiento.

- Conservar el original assets/astrapulse-logo.png y derivar sus variantes sin redibujarlo. Mantener el correo operativo, el remoto y la ruta histórica /starpulse/ hasta que se apruebe su migración.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es este proyecto

Reproductor de música web con un tocadiscos animado (disco que gira, aguja que se mueve al reproducir/pausar/terminar). App estática sin backend ni build step: HTML + CSS + JS vanilla, sin dependencias ni `package.json`.

## Ejecutar / probar

No hay build ni test suite.

- Abrir `index.html` con doble clic (funciona directo por `file://`, sin servidor).
- O servir con `npx serve .` para probarlo como sitio real. Este equipo no tiene Python instalado (el alias `python`/`python3` de Windows solo abre la Microsoft Store) — usar Node/npx, no `python -m http.server`.

No hay linter configurado.

## Arquitectura

- `index.html` — estructura del tocadiscos y controles. Todos los elementos interactivos tienen `id` fijos que `js/app.js` referencia directamente (sin frameworks ni data-binding).
- `css/style.css` — estilos y **toda la animación del tocadiscos**. La rotación de la aguja (`.tonearm`) está calculada en píxeles absolutos contra el tamaño fijo de `.turntable-body` (280×280px): `transform-origin` marca el pivote real (el círculo `.tonearm-pivot`), y los ángulos de reposo (`rotate(-10deg)`, apoyada sobre `.rest-peg`) y de reproducción (`rotate(22deg)`, apoyada sobre el borde exterior del `.vinyl`) están ajustados a mano por geometría, no son valores arbitrarios. Si se cambia el tamaño de `.turntable-body`, la posición de `.vinyl` o el pivote de la aguja, hay que recalcular esos ángulos o la aguja queda flotando fuera de sitio.
- `js/app.js` — estado de reproducción en variables simples (`playlist`, `currentIndex`, `isSeeking`), sin librerías. Las canciones se cargan con `<input type="file">` + `URL.createObjectURL`; no hay backend ni almacenamiento persistente, así que la playlist se pierde al recargar la página.
  - El estado visual (disco girando, aguja arriba/abajo, luz encendida) se controla únicamente a través de los eventos nativos `play`/`pause` del `<audio>` (clases `.spinning` / `.playing` / `.on`), no con banderas propias — mantener esa fuente única de verdad al tocar esta lógica.
  - Detalle no obvio: el evento `ended` del `<audio>` dispara primero `pause` (por spec HTML) y luego `ended`. Por eso el avance automático de pista al terminar una canción vive en su propio listener de `ended` que siempre llama a `playAudio()`, en vez de reusar el patrón "recordar si estaba sonando" (`wasPlaying = !audio.paused`) que usan los botones ⏮/⏭ — en el momento en que corre `ended`, `audio.paused` ya es `true`, así que ese patrón ahí nunca reanudaría la reproducción.

## Configuración de otros agentes detectada

Hay un `~/.codex/config.toml` (Codex CLI) a nivel de usuario, no importado a Claude Code. Para traer sus servidores MCP, comandos o instrucciones, responder `/import`.

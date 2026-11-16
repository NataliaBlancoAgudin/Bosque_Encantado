# Documento de Arquitectura y Diseño de Software

**Proyecto**: El Bosque Secreto de Sara  
**Versión**: 1.0 (Producción / PWA)  
**Destinataria**: Sara (Regalo de Amigo Invisible)  
**Stack**: HTML5, Canvas 2D API, Web Audio API, JavaScript ECMAScript 6+, Service Workers (PWA)

---

## 1. Visión General del Sistema

El juego está diseñado como una aplicación web autocontenida y de alto rendimiento que no depende de motores pesados de terceros (como Phaser, Unity WebGL o PixiJS), ni de librerías externas o transpiladores. 

Todo el motor 2D ha sido desarrollado desde cero utilizando la **Canvas 2D API nativa** de HTML5, lo que garantiza tiempos de carga casi instantáneos (< 200 ms) y consumo mínimo de batería y memoria RAM en dispositivos móviles Android.

```
┌─────────────────────────────────────────────────────────────┐
│                       CAPA DE USUARIO                       │
│  - Pantalla de Inicio (Title Banner)                        │
│  - Sistema de Diálogos RPG (Retratos Pixel Art + Avance)    │
│  - HUD Dinámico (Setas, Nivel, Control de Audio, Fullscreen)│
│  - Controles Virtuales Touch (D-Pad + Botón Salto)          │
│  - Modal de Transición y Pergamino Final                    │
└──────────────────────────────┬──────────────────────────────┘
                               │ Eventos DOM / Touch / Teclado
┌──────────────────────────────▼──────────────────────────────┐
│                    MOTOR DE JUEGO (GAME)                    │
│  - Bucle Principal con Acumulador Fijo a 60 Hz              │
│  - Máquina de Estados (TITLE, DIALOGUE, PLAYING, CUTSCENE)  │
│  - Motor de Física (Gravedad, Coyote Time, Jump Buffering)  │
│  - Frustum Culling y Gestión de Cámara 2D                   │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
┌──────────────▼─────────────┐   ┌─────────────▼──────────────┐
│     SUBSISTEMA GRÁFICO     │   │     SINTETIZADOR DE AUDIO  │
│ - Renderizador de Sprites  │   │ - Web Audio API (Oscilators)│
│ - Fondos Parallax          │   │ - Arpegios Procedurales     │
│ - Caché Offscreen Tiles    │   │ - Efectos SFX Procedurales │
│ - Pre-escalado GPU         │   │ - Cero latencia de archivos│
└────────────────────────────┘   └────────────────────────────┘
```

---

## 2. Decisiones de Ingeniería y Rendimiento

### 2.1. Bucle de Simulación con Paso Fijo (Fixed Timestep Accumulator)
Uno de los problemas más comunes en juegos web en móviles con pantallas de alta tasa de refresco (90 Hz, 120 Hz) es que los personajes se mueven a velocidad anormal si la física se calcula por fotograma. 

Para garantizar que el juego funcione exactamente a la misma velocidad en cualquier pantalla (desde un móvil de 60 Hz hasta una pantalla gaming de 144 Hz), se implementó un bucle con paso de tiempo fijo:

$$\Delta t_{\text{fijo}} = \frac{1}{60} \approx 0.01667 \text{ s}$$

```javascript
// Bucle con acumulador de tiempo
let lastTime = performance.now();
let accumulator = 0;
const FIXED_STEP = 1 / 60;

function loop(currentTime) {
  let dt = (currentTime - lastTime) / 1000;
  lastTime = currentTime;
  if (dt > 0.1) dt = 0.1; // Clamp contra caídas bruscas
  
  accumulator += dt;
  while (accumulator >= FIXED_STEP) {
    updatePhysics(FIXED_STEP);
    accumulator -= FIXED_STEP;
  }
  render();
  requestAnimationFrame(loop);
}
```

### 2.2. Optimización del Pipeline Gráfico en Canvas 2D
Durante el desarrollo se detectaron cuellos de botella de rendimiento en Chrome y se aplicaron las siguientes soluciones arquitectónicas:

1. **Eliminación de `ctx.filter` en tiempo de render**:  
   Aplicar `ctx.filter = 'hue-rotate(...) saturate(...)'` en cada bloque dentro del bucle provocaba una degradación masiva de FPS (caída a software rendering en CPU).  
   *Solución*: Se creó la función `prepareCachedAssets()` que pre-renderiza los bloques de cristal (zafiro) y oro una sola vez al cargar el juego en lienzos ocultos en memoria (*Offscreen Canvas*), reutilizándolos con llamadas directas a `ctx.drawImage`.

2. **Pre-escalado de texturas de alta resolución**:  
   La imagen del Nivel 2 (`cavernas.jpg`) tenía una resolución original de 3840×1080 px. Redimensionarla en tiempo real cada fotograma saturaba el ancho de banda del fill-rate de la GPU.  
   *Solución*: En el arranque se pre-escala a un canvas en memoria de 1280×360 px, reduciendo la carga de píxeles procesados en más de un 89%.

3. **Frustum Culling de Bloques**:  
   Los niveles tienen un ancho de hasta 2400 píxeles, pero la pantalla solo muestra 640 píxeles a la vez. El motor descarta instantáneamente cualquier bloque fuera de la vista de la cámara antes de intentar dibujarlo:
   ```javascript
   if (b.x + b.w < GAME.cameraX - 60 || b.x > GAME.cameraX + GAME.width + 60) return;
   ```

4. **Eliminación de `ctx.shadowBlur` en bucles de partículas**:  
   El cálculo de desenfoque gaussiano en partículas individuales causaba micro-tirones. Se reemplazó por halos concéntricos dibujados con gradientes radiales optimizados o elipses de bajo coste.

---

## 3. Mecánicas de Plataformas y Game Feel

Para que el control de la brujita se sienta responsivo y cómodo (especialmente en pantallas táctiles), se implementaron dos técnicas fundamentales de diseño de videojuegos profesionales:

1. **Coyote Time (Tiempo Coyote)**:  
   Si el jugador sale corriendo del borde de una plataforma, dispone de una ventana de gracia de 6 fotogramas (~100 ms) para poder saltar aunque ya no esté tocando el suelo.
2. **Jump Buffering (Buffer de Salto)**:  
   Si el jugador pulsa el botón de salto unos instantes antes de tocar tierra (hasta 8 fotogramas antes), la pulsación se almacena en memoria y el salto se ejecuta automáticamente tan pronto como sus pies toquen el suelo.

---

## 4. Síntesis Procedural de Audio (Web Audio API)

Para no depender de archivos MP3/OGG que pudiesen fallar en conexiones lentas o requerir peticiones de red adicionales, todo el sonido se sintetiza matemáticamente en tiempo real:

* **Acordes ambientales**: Creados mediante bancos de osciladores senoidales (`sine`) pasados por un filtro paso bajo (`BiquadFilterNode`) a 600 Hz con envolventes exponenciales suaves (`linearRampToValueAtTime`).
* **Arpegios mágicos**: Secuencias melódicas procedurales calculadas según el nivel activo.
* **Sonido de Diálogo («Blip»)**: Onda cuadrada (`square`) a 440 Hz modulada a 580 Hz durante 35 ms para emular el sonido de textos de RPGs de 16 bits.
* **Efectos especiales**:
  * Recogida de setita: Arpegio ascendente pentatónico.
  * Desbloqueo de portal: Barrido ascendente con brillo armónico.
  * Burbujeo de caldero: Ruido filtrado y modulaciones de frecuencia periódicas.
  * Fanfarria final: Acordes de quinta brillante con decaimiento natural.

---

## 5. Arquitectura PWA (Offline First)

* **`manifest.json`**: Define el comportamiento standalone, la orientación fija horizontal (`"orientation": "landscape"`), los colores de tema y los iconos para la pantalla de inicio de Android.
* **`sw.js` (Service Worker)**:
  * Utiliza una estrategia **Cache-First**: intercepta las peticiones y devuelve instantáneamente los recursos almacenados en caché.
  * Permite que Sara juegue sin cobertura o en modo avión una vez cargado por primera vez.

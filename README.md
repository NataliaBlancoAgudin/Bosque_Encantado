val# El Bosque Secreto de Sara 🍄✨

Un videojuego de plataformas y aventuras en 2D en pixel art desarrollado como regalo personalizado de **Amigo Invisible** para **Sara**.

---

## 📖 Historia del Juego

Sara despierta en los confines de un bosque ancestral donde la naturaleza rebosa de magia. Allí se encuentra con la **Bruja del Bosque**, una anciana hechicera que le encomienda una misión trascendental: alguien muy especial ha encargado un sortilegio para ella, pero para completarlo en el gran caldero sagrado, Sara debe adentrarse en el bosque y reunir **15 setitas mágicas** repartidas a través de 3 reinos:

1. **Nivel 1: Los Arrabales del Bosque**: 5 Setitas de Rubí sobre senderos de tierra y ramas vivas.
2. **Nivel 2: Las Cavernas de Cristal**: 5 Setitas de Zafiro en las profundidades de unas grutas brillantes con plataformas de cristal lapislázuli.
3. **Nivel 3: El Santuario del Árbol Ancestral**: 5 Setitas de Oro custodiadas junto al Caldero Mágico.

Al completar la pócima, el caldero revela un misterioso pergamino con la dedicatoria final de su Amigo Invisible.

---

## 🎮 Controles

### En PC / Ordenador
* **Movimiento lateral**: Flechas de dirección `◄` / `►` o teclas `A` / `D`.
* **Salto**: Flecha hacia arriba `▲`, barra espaciadora `[Espacio]` o tecla `W`.
* **Avanzar diálogos**: `[Espacio]` o `[Enter]`.

### En Móvil / Tablet (Android / iOS)
* **Controles táctiles virtuales**: Cruceta en el lateral izquierdo (`◄` `►`) y botón dedicado de salto en el lateral derecho.
* **Tocar la pantalla**: Avanza los diálogos tipo RPG.
* **Pantalla Completa**: Botón dedicado en la barra superior para ocultar los marcos del navegador.

---

## 🚀 Cómo Jugar en Local (Tu PC)

1. Haz doble clic en el archivo **`jugar.bat`**.
2. Se iniciará un servidor local ligero y se abrirá automáticamente tu navegador en `http://localhost:3000`.

---

## 📱 Cómo Instalarlo en el Móvil de Sara (Modo App / PWA)

El juego está desarrollado bajo el estándar **Progressive Web App (PWA)**, lo que permite instalarlo como si fuera una aplicación nativa:

1. **Abre el juego** en el navegador **Google Chrome** en el móvil Android.
2. Toca el menú de opciones de Chrome (los **tres puntos verticales `⋮`** arriba a la derecha).
3. Selecciona **"Añadir a pantalla de inicio"** o **"Instalar aplicación"**.
4. ¡Listo! Se creará un acceso directo en el escritorio del móvil con su propio icono de brujita y se abrirá a pantalla completa en formato horizontal sin barras de navegación. Además, funciona **sin conexión a internet (offline)** gracias a su *Service Worker*.

---

## 🌐 Cómo Subirlo a Internet Gratis (En 2 minutos)

Para que Sara pueda jugarlo desde su propio móvil mediante un enlace web público:

### Opción A: Vercel (La más rápida y sencilla)
1. Entra en [vercel.com](https://vercel.com) e inicia sesión (con tu cuenta de GitHub o Google).
2. Arrastra la carpeta de este proyecto (`Videojuego`) directamente a la ventana de Vercel.
3. Te dará un enlace instantáneo tipo `https://el-bosque-de-sara.vercel.app`.

### Opción B: GitHub Pages
1. Sube estos archivos a un repositorio en GitHub.
2. Entra en **Settings** > **Pages**.
3. En la sección **Branch**, selecciona `main` (o `master`) y guarda.
4. En un minuto estará disponible en `https://tu-usuario.github.io/tu-repositorio/`.

---

## 🎨 Créditos y Recursos Utilizados
Todos los elementos visuales utilizados son recursos libres con licencia para proyectos independientes:
* **Brujita Jugadora**: Spritesheets de animación (*idle*, *run*, *jump*) por *Bowsy* en OpenGameArt / itch.io.
* **Bruja Anciana (NPC)**: *Witch Pack* (animación *blink*) en itch.io.
* **Setitas mágicas**: *Animated Mushroom Pack* (versiones Rubí, Zafiro y Rosa/Oro).
* **Fondos**: Fondos multicapa parallax de bosque y caverna de cristal (*cavernas.jpg*).
* **Efectos y Música**: Sistema de síntesis procedural en tiempo real mediante **Web Audio API** (sin dependencias ni archivos de audio externos).

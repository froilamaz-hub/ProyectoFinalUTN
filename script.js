;(function (window, document) {
  "use strict";

  // Objeto principal del sitio //
  const SITE = (window.SITE = window.SITE || {});

  // Utilidades para selección de elementos y manejo de eventos
  const utils = {
    qs: (sel, ctx = document) => ctx.querySelector(sel),
    qsa: (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel)),
    on: (el, evt, fn, opts) =>
      el && el.addEventListener(evt, fn, opts || false),
    once: (el, evt, fn, opts) =>
      el && el.addEventListener(evt, fn, Object.assign({ once: true }, opts)),
    off: (el, evt, fn, opts) =>
      el && el.removeEventListener(evt, fn, opts || false),
  };
  SITE.utils = SITE.utils || utils;

  // SISTEMA DE TEMAS DÍA/NOCHE //

  const ThemeManager = {
    STORAGE_KEY: "body-night",
    DARK_CLASS: "body-night",
    LIGHT_CLASS: "body-day",

    switchBtn: document.getElementById("switch-tema"),

    init() {
      this.applyStoredTheme();
      this.attachListeners();
    },

    applyStoredTheme() {
      const isDarkMode = localStorage.getItem(this.STORAGE_KEY) === "active";

      if (isDarkMode) {
        this.enableDarkMode(false); // false = no guardar en localStorage de nuevo
      } else {
        this.enableLightMode(false);
      }
    },

    enableDarkMode(save = true) {
      document.body.classList.add(this.DARK_CLASS);
      document.body.classList.remove(this.LIGHT_CLASS);

      if (save) {
        localStorage.setItem(this.STORAGE_KEY, "active");
      }

      this.updateButtonTitle();
    },

    enableLightMode(save = true) {
      document.body.classList.remove(this.DARK_CLASS);
      document.body.classList.add(this.LIGHT_CLASS);

      if (save) {
        localStorage.removeItem(this.STORAGE_KEY);
      }

      this.updateButtonTitle();
    },

    toggleTheme() {
      const isDarkMode = document.body.classList.contains(this.DARK_CLASS);

      if (isDarkMode) {
        this.enableLightMode();
      } else {
        this.enableDarkMode();
      }
    },

    updateButtonTitle() {
      if (!this.switchBtn) return;

      const isDarkMode = document.body.classList.contains(this.DARK_CLASS);
      this.switchBtn.title = isDarkMode
        ? this.switchBtn.dataset.titleNight
        : this.switchBtn.dataset.titleDay;
    },

    attachListeners() {
      if (this.switchBtn) {
        this.switchBtn.addEventListener("click", () => this.toggleTheme());
      }
    },
  };

  // Inicializar el sistema de temas
  ThemeManager.init();

  /* FUNCIONES PARA LA PÁGINA HOME (INDEX) */

  function initHome() {
    const tarjeta1 = utils.qs("#tarjeta1");
    const tarjeta2 = utils.qs("#tarjeta2");
    const nav = utils.qs("nav");

    if (!nav) return;

    // Cambio de fondo del nav al hacer scroll
    const navChangeHome = () => {
      if (window.innerHeight * 0.1 < window.scrollY) {
        nav.classList.add("fondoNav");
        // Animación de aparición de tarjetas
        if (tarjeta1) tarjeta1.style = "animation:aparecerIzq 3s 1s forwards;";
        if (tarjeta2) tarjeta2.style = "animation:aparecerDerecha 3s forwards;";
      } else {
        nav.classList.remove("fondoNav");
      }
    };

    // Evento de scroll
    window.addEventListener("scroll", navChangeHome);
    navChangeHome();
  }

  /* FUNCIONES PARA LA PÁGINA DEL JUEGO */

  function initPrueba() {
    const nav = utils.qs("nav");
    const cajasContainer = utils.qs(".cajas");
    const soltar = utils.qs("#cajasoltar");
    const soltar2 = utils.qs("#cajasoltar2");
    const soltar3 = utils.qs("#cajasoltar3");
    const imagenes = utils.qsa(".imagenes");
    const btnReiniciar = utils.qs("#btnReiniciar");

    // Función para mostrar mensajes en el título, reutilizable
    function mostrarMensaje(mensaje, estilos = "") {
      const titulo = utils.qs(".espacio-titulo");
      if (titulo) {
        titulo.innerHTML = mensaje;
        if (estilos) titulo.style = estilos;
      }
    }

    // Manejo del nav con scroll
    if (nav) {
      const navChangePrueba = () => {
        if (window.innerHeight * 0.1 < window.scrollY) {
          nav.classList.add("fondoNav");
        } else {
          nav.classList.remove("fondoNav");
        }
      };
      window.addEventListener("scroll", navChangePrueba);
      navChangePrueba();
    }

    // Si no es la página del puzzle, salimos
    if (!soltar || !soltar2 || !soltar3) return;

    // Event listener para el botón de reiniciar
    if (btnReiniciar) {
      utils.on(btnReiniciar, "click", () => {
        window.location.reload();
      });
    }

    let contador = 0;

    // Función que se ejecuta cuando se arrastra una imagen
    function arrastrado(e) {
      const elemento = e.target;
      e.dataTransfer.setData("Text", elemento.getAttribute("id"));
    }

    // Función que se ejecuta cuando se suelta una imagen
    function soltado(e) {
      e.preventDefault();
      const id = e.dataTransfer.getData("Text");
      const imagen = document.getElementById(id);

      if (!imagen) return;

      // Ocultar la imagen original
      imagen.style.display = "none";

      // Determinar el contenedor donde se soltó (más limpio con operador ternario)
      const contenedor = e.target.tagName === "P" ? e.target.parentNode : e.target;

      // Insertar la imagen en el contenedor (con template literal y atributo alt)
      contenedor.innerHTML = `<img src="${imagen.src}" height="100%" width="100%" alt="Pieza del puzzle">`;
      contador++;

      // Verificar si se completaron las 3 piezas
      if (contador === 3) {
        const img1Ok = utils
          .qs("#cajasoltar>img")
          ?.getAttribute("src")
          ?.split("/")
          ?.includes("rompe1.png");
        const img2Ok = utils
          .qs("#cajasoltar2>img")
          ?.getAttribute("src")
          ?.split("/")
          ?.includes("rompe2.png");
        const img3Ok = utils
          .qs("#cajasoltar3>img")
          ?.getAttribute("src")
          ?.split("/")
          ?.includes("rompe3.png");

        if (cajasContainer) {
          cajasContainer.style = "transform:scale(1.5);gap:0;border:0";
          const cajitas = utils.qsa(".caja");
          cajitas.forEach((c) => (c.style.border = "0"));
        }

        // Si el puzzle está correcto
        if (img1Ok && img2Ok && img3Ok) {
          setTimeout(() => {
            if (cajasContainer) cajasContainer.style = "transform:scale(1);gap:0";
          }, 3000);

          setTimeout(() => {
            mostrarMensaje(
              "<span>¡Felicitaciones!<br>Puzzle correctamente resuelto</span>",
              "animation:feliz 3s forwards;position:relative"
            );

            if (cajasContainer) cajasContainer.style = "opacity:0;gap:0";
          }, 6000);
        }

        // Si el puzzle está incorrecto
        else {
          const cajitas = utils.qsa(".caja");
          cajitas.forEach((c) => {
            c.style.border = 0;
            c.classList?.remove("cajaHover");
          });

          setTimeout(() => {
            cajitas.forEach((c) => {
              c.style.opacity = "0.7";
              c.style.pointerEvents = "none";
            });

            mostrarMensaje(
              'Lo sentimos, Puzzle no resuelto.<br/>Prueba otra vez <img width="50px" src="./assets/icons/icons8-double-down-80.png" alt="Flecha abajo"/>',
              "animation:feliz 3s forwards; z-index:3; position:relative; color:white; text-shadow: 2px 2px #808080, 6px 6px black;"
            );

            if (cajasContainer) {
              cajasContainer.style =
                "background-color:#000000;transform:scale(1);gap:0;pointer-events:none";
            }
          }, 5000);
        }
      }
    }

    // Inicializar el juego de arrastrar y soltar
    function iniciar() {
      // Agregar evento dragstart a las imágenes
      imagenes.forEach((img) => {
        utils.on(img, "dragstart", arrastrado);
      });

      // Agregar eventos a las zonas de soltar
      const zonas = [soltar, soltar2, soltar3];
      zonas.forEach((zone) => {
        utils.on(zone, "dragenter", (e) => e.preventDefault());
        utils.on(zone, "dragover", (e) => e.preventDefault());
        utils.on(zone, "drop", soltado);
      });
    }

    iniciar();
  }

  /* FUNCIONES PARA LA PÁGINA HISTORIA */

  function initHistoria() {
    const nav = utils.qs("nav");
    const tarjeta1 = utils.qs("#tarjetaHist1");
    const tarjeta2 = utils.qs("#tarjetaHist2");
    const tarjeta3 = utils.qs("#tarjetaHist3");

    // Si no hay tarjetas ni video, no es esta página
    if (!tarjeta1 && !tarjeta2 && !tarjeta3 && !utils.qs("video")) return;

    // Calcular distancia para animación de primera tarjeta
    const distanciaHis1 = () =>
      window.innerHeight * 0.35 + (tarjeta1?.offsetHeight || 0);

    // Manejo del scroll para animaciones
    const navChangeHistoria = () => {
      if (window.innerHeight * 0.1 < window.scrollY) {
        nav?.classList.add("fondoNav");
      } else {
        nav?.classList.remove("fondoNav");
      }

      const d1 = distanciaHis1();
      const t2h = tarjeta2?.offsetHeight || 0;

      // Animación de la primera tarjeta
      if (window.innerHeight * 0.1 < window.scrollY && d1 > window.scrollY) {
        utils
          .qs("#tarjetaHist1 >img")
          ?.setAttribute("style", "animation: aparecer1 1.5s ease-out forwards;");
        utils
          .qs("#tarjetaHist1 >div")
          ?.setAttribute("style", "animation: opacity1 2s ease-out forwards");
        return;
      }

      // Animación de la segunda tarjeta
      if (d1 < window.scrollY && d1 + t2h > window.scrollY) {
        utils
          .qs("#tarjetaHist2 >img")
          ?.setAttribute("style", "animation: aparecer2 1.5s ease-out forwards;");
        utils
          .qs("#tarjetaHist2 >div")
          ?.setAttribute("style", "animation: opacity2 2s ease-out forwards");
        return;
      }

      // Animación de la tercera tarjeta
      if (d1 + t2h < window.scrollY) {
        utils
          .qs("#tarjetaHist3 >img")
          ?.setAttribute("style", "animation: aparecer1 1.5s ease-out forwards;");
        utils
          .qs("#tarjetaHist3 >div")
          ?.setAttribute("style", "animation: opacity1 2s ease-out forwards");
      }
    };

    window.addEventListener("scroll", navChangeHistoria);
    window.addEventListener("resize", () => navChangeHistoria());
    navChangeHistoria();

    // Controles del video
    const video = utils.qs("video");
    const playBoton = utils.qs("#play");
    const pauseBoton = utils.qs("#pause");
    const showTime = utils.qs("#showTime");

    // Función para formatear el tiempo del video
    function transformarTiempoActual(tiempo) {
      if (tiempo < 60) {
        return tiempo.toFixed(0) < 10
          ? `00:0${tiempo.toFixed(0)}`
          : `00:${tiempo.toFixed(0)}`;
      } else {
        const minutos = parseInt(tiempo / 60, 10);
        const segundos = (tiempo / 60 - minutos) * 60;
        return segundos < 10
          ? `${minutos}:0${segundos.toFixed(0)}`
          : `${minutos}:${segundos.toFixed(0)}`;
      }
    }

    let timeProgression;

    // Obtener y mostrar la duración del video al cargar los metadatos
    if (video && showTime) {
      video.addEventListener("loadedmetadata", () => {
        const duracion = transformarTiempoActual(video.duration);
        showTime.innerHTML = `<b>Duración del video:</b> ${duracion}`;
      });
    }

    // Botón Play
    if (playBoton) {
      utils.on(playBoton, "click", () => {
        if (!video) return;
        video.play();
        clearInterval(timeProgression);

        // Actualizar tiempo cada segundo
        timeProgression = setInterval(() => {
          if (showTime) {
            showTime.innerHTML = `${transformarTiempoActual(video.currentTime)}`;
          }

          // Detener cuando termina el video
          if (video.ended) {
            clearInterval(timeProgression);
          }
        }, 1000);
      });
    }

    // Botón Pause
    if (pauseBoton) {
      utils.on(pauseBoton, "click", () => {
        if (!video) return;
        video.pause();
        clearInterval(timeProgression);
      });
    }
  }

  /* DETECCIÓN AUTOMÁTICA DE PÁGINA */

  function boot() {
    // Detectar qué página es según elementos únicos
    const isHome = !!(utils.qs("#tarjeta1") || utils.qs("#tarjeta2"));
    const isPrueba = !!(
      utils.qs("#cajasoltar") ||
      utils.qs("#cajasoltar2") ||
      utils.qs("#cajasoltar3")
    );
    const isHistoria = !!(
      utils.qs("#tarjetaHist1") ||
      utils.qs("#tarjetaHist2") ||
      utils.qs("#tarjetaHist3") ||
      utils.qs("video")
    );

    // Inicializar funciones según la página
    if (isHome) initHome();
    if (isPrueba) initPrueba();
    if (isHistoria) initHistoria();
  }

  // Ejecutar cuando el DOM esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})(window, document);
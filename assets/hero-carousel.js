/*
 * Carrusel principal (sections/hero-carousel.liquid).
 * - Cambio con fundido; deslizar con el dedo o el mouse cambia de diapositiva.
 * - Puntos, flechas (escritorio) y botón de pausa.
 * - Cambio automático que se detiene al pasar el mouse, con foco de teclado, al tocar,
 *   cuando la pestaña no está visible o el carrusel sale de la pantalla.
 * - Respeta "reducir movimiento": en ese caso arranca en pausa.
 */
(function () {
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var SWIPE_MIN = 40;

  function init(root) {
    if (!root || root.__heroCarouselReady) return;
    root.__heroCarouselReady = true;

    var viewport = root.querySelector('.hero-carousel__viewport');
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-carousel__slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-carousel__dot'));
    var toggle = root.querySelector('.hero-carousel__toggle');
    var prev = root.querySelector('.hero-carousel__arrow--prev');
    var next = root.querySelector('.hero-carousel__arrow--next');
    if (!viewport || slides.length < 2) return;

    var interval = parseInt(root.getAttribute('data-interval'), 10) || 6000;
    var wantsAutoplay = root.getAttribute('data-autoplay') === 'true' && !reducedMotion.matches;
    var userPaused = !wantsAutoplay;
    var hoverPaused = false;
    var offscreen = false;
    var current = 0;
    var timer = null;

    function show(index) {
      var count = slides.length;
      var target = ((index % count) + count) % count;
      slides.forEach(function (slide, i) {
        var active = i === target;
        slide.classList.toggle('is-active', active);
        if (active) {
          slide.removeAttribute('aria-hidden');
          if (slide.tagName === 'A') slide.removeAttribute('tabindex');
        } else {
          slide.setAttribute('aria-hidden', 'true');
          if (slide.tagName === 'A') slide.setAttribute('tabindex', '-1');
        }
      });
      dots.forEach(function (dot, i) {
        if (i === target) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      current = target;
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      stop();
      if (userPaused || hoverPaused || offscreen || document.hidden) return;
      timer = setInterval(function () {
        show(current + 1);
      }, interval);
    }

    function updateToggle() {
      if (!toggle) return;
      toggle.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
      toggle.setAttribute(
        'aria-label',
        userPaused ? toggle.getAttribute('data-label-play') : toggle.getAttribute('data-label-pause')
      );
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    if (prev) prev.addEventListener('click', function () { show(current - 1); start(); });
    if (next) next.addEventListener('click', function () { show(current + 1); start(); });

    if (toggle) {
      toggle.addEventListener('click', function () {
        userPaused = !userPaused;
        updateToggle();
        start();
      });
      updateToggle();
    }

    // Deslizar (dedo, lápiz o mouse). Si hubo deslizamiento, se cancela el clic del enlace.
    var startX = 0;
    var startY = 0;
    var tracking = false;
    var swiped = false;

    viewport.addEventListener('pointerdown', function (event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      tracking = true;
      swiped = false;
      startX = event.clientX;
      startY = event.clientY;
    });

    viewport.addEventListener('pointerup', function (event) {
      if (!tracking) return;
      tracking = false;
      var dx = event.clientX - startX;
      var dy = event.clientY - startY;
      if (Math.abs(dx) > SWIPE_MIN && Math.abs(dx) > Math.abs(dy)) {
        swiped = true;
        show(dx < 0 ? current + 1 : current - 1);
        start();
      }
    });

    viewport.addEventListener('pointercancel', function () {
      tracking = false;
    });

    viewport.addEventListener(
      'click',
      function (event) {
        if (swiped) {
          event.preventDefault();
          event.stopPropagation();
          swiped = false;
        }
      },
      true
    );

    viewport.addEventListener('dragstart', function (event) {
      event.preventDefault();
    });

    root.addEventListener('mouseenter', function () { hoverPaused = true; stop(); });
    root.addEventListener('mouseleave', function () { hoverPaused = false; start(); });

    // Solo el foco de teclado pausa; un clic o toque en los controles no debe dejarlo detenido.
    root.addEventListener('focusin', function (event) {
      var keyboardFocus = true;
      try {
        keyboardFocus = event.target.matches(':focus-visible');
      } catch (e) {}
      if (!keyboardFocus) return;
      hoverPaused = true;
      stop();
    });
    root.addEventListener('focusout', function () { hoverPaused = false; start(); });

    root.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight') { show(current + 1); start(); }
      if (event.key === 'ArrowLeft') { show(current - 1); start(); }
    });

    document.addEventListener('visibilitychange', start);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        offscreen = !entries[entries.length - 1].isIntersecting;
        start();
      }, { threshold: 0.3 }).observe(root);
    }

    show(0);
    start();
  }

  function initAll() {
    Array.prototype.forEach.call(document.querySelectorAll('.hero-carousel'), init);
  }

  initAll();
  // Editor de temas: la sección se vuelve a dibujar sin recargar la página.
  document.addEventListener('shopify:section:load', initAll);
})();

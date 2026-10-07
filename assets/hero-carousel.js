/*
 * Carrusel principal (sections/hero-carousel.liquid).
 * - Deslizar con el dedo / trackpad: scroll-snap nativo.
 * - Puntos, flechas (escritorio) y botón de pausa.
 * - Cambio automático que se detiene al pasar el mouse, al enfocar, al tocar,
 *   cuando la pestaña no está visible o el carrusel sale de la pantalla.
 * - Respeta "reducir movimiento": en ese caso arranca en pausa.
 */
(function () {
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function init(root) {
    if (!root || root.__heroCarouselReady) return;
    root.__heroCarouselReady = true;

    var track = root.querySelector('.hero-carousel__track');
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-carousel__slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-carousel__dot'));
    var toggle = root.querySelector('.hero-carousel__toggle');
    var prev = root.querySelector('.hero-carousel__arrow--prev');
    var next = root.querySelector('.hero-carousel__arrow--next');
    if (!track || slides.length < 2) return;

    var interval = parseInt(root.getAttribute('data-interval'), 10) || 5000;
    var wantsAutoplay = root.getAttribute('data-autoplay') === 'true' && !reducedMotion.matches;
    var userPaused = !wantsAutoplay;
    var hoverPaused = false;
    var offscreen = false;
    var current = 0;
    var timer = null;
    var ticking = false;

    function behavior() {
      return reducedMotion.matches ? 'auto' : 'smooth';
    }

    function setCurrent(index) {
      current = index;
      dots.forEach(function (dot, i) {
        if (i === index) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    }

    function goTo(index) {
      var count = slides.length;
      var target = ((index % count) + count) % count;
      track.scrollTo({ left: target * track.clientWidth, behavior: behavior() });
      setCurrent(target);
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        var width = track.clientWidth || 1;
        var index = Math.round(track.scrollLeft / width);
        if (index !== current) setCurrent(index);
      });
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
        goTo(current + 1);
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

    track.addEventListener('scroll', onScroll, { passive: true });

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        goTo(i);
        start();
      });
    });
    if (prev) prev.addEventListener('click', function () { goTo(current - 1); start(); });
    if (next) next.addEventListener('click', function () { goTo(current + 1); start(); });

    if (toggle) {
      toggle.addEventListener('click', function () {
        userPaused = !userPaused;
        updateToggle();
        start();
      });
      updateToggle();
    }

    root.addEventListener('mouseenter', function () { hoverPaused = true; stop(); });
    root.addEventListener('mouseleave', function () { hoverPaused = false; start(); });
    // Solo el foco de teclado pausa; un clic o toque en los puntos no debe dejarlo detenido.
    root.addEventListener('focusin', function (event) {
      var target = event.target;
      var keyboardFocus = true;
      try {
        keyboardFocus = target.matches(':focus-visible');
      } catch (e) {}
      if (!keyboardFocus) return;
      hoverPaused = true;
      stop();
    });
    root.addEventListener('focusout', function () { hoverPaused = false; start(); });
    root.addEventListener('touchstart', function () { hoverPaused = true; stop(); }, { passive: true });
    root.addEventListener('touchend', function () {
      setTimeout(function () { hoverPaused = false; start(); }, 2500);
    }, { passive: true });

    document.addEventListener('visibilitychange', start);

    window.addEventListener('resize', function () {
      track.scrollTo({ left: current * track.clientWidth, behavior: 'auto' });
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        offscreen = !entries[0].isIntersecting;
        start();
      }, { threshold: 0.35 }).observe(root);
    }

    start();
  }

  function initAll() {
    Array.prototype.forEach.call(document.querySelectorAll('.hero-carousel'), init);
  }

  initAll();
  // Editor de temas: se vuelve a dibujar la sección sin recargar la página.
  document.addEventListener('shopify:section:load', initAll);
})();

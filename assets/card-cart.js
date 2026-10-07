/*
 * Botón de carrito de las tarjetas de producto (.card-cart-btn).
 * Agrega 1 unidad del producto y abre el carrito:
 *   1) carrito de Opus (window.opusOpen), si está instalado;
 *   2) si no, el carrito lateral del tema (<cart-drawer>);
 *   3) si no, la página /cart.
 * Los productos con varias variantes usan un enlace a la ficha (no pasan por aquí).
 */
(function () {
  if (window.__bfCardCart) return;
  window.__bfCardCart = true;

  var RESET_MS = 1800;

  function openCart(cartResponse) {
    if (typeof window.opusOpen === 'function') {
      window.opusOpen();
      return;
    }
    var drawer = document.querySelector('cart-drawer');
    if (drawer && typeof drawer.renderContents === 'function' && cartResponse && cartResponse.sections) {
      drawer.renderContents(cartResponse);
      return;
    }
    window.location.href = (window.routes && window.routes.cart_url) || '/cart';
  }

  function sectionsToRender() {
    var drawer = document.querySelector('cart-drawer');
    if (drawer && typeof drawer.getSectionsToRender === 'function') {
      return drawer.getSectionsToRender().map(function (s) {
        return s.id;
      });
    }
    return [];
  }

  function setState(button, state) {
    button.classList.remove('is-loading', 'is-added', 'is-error');
    if (state) button.classList.add(state);
    button.setAttribute('aria-busy', state === 'is-loading' ? 'true' : 'false');
  }

  function add(button) {
    if (button.classList.contains('is-loading')) return;
    var variantId = button.getAttribute('data-variant-id');
    if (!variantId) return;

    setState(button, 'is-loading');

    var body = { items: [{ id: Number(variantId), quantity: 1 }] };
    var sections = sectionsToRender();
    if (sections.length) {
      body.sections = sections.join(',');
      body.sections_url = window.location.pathname;
    }

    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    })
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok || data.status) throw new Error(data.description || data.message || 'No se pudo agregar');
          return data;
        });
      })
      .then(function (data) {
        setState(button, 'is-added');
        openCart(data);
      })
      .catch(function (error) {
        console.error('Error al añadir el producto:', error);
        setState(button, 'is-error');
        button.setAttribute('title', 'No se pudo agregar. Intenta de nuevo.');
      })
      .then(function () {
        setTimeout(function () {
          setState(button, null);
          button.removeAttribute('title');
        }, RESET_MS);
      });
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest && event.target.closest('button.card-cart-btn[data-variant-id]');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    add(button);
  });
})();

/*
 * Pestañas de colecciones con filtros (sections/collection-tabs.liquid).
 * - La primera pestaña viene dibujada desde el servidor; las demás se cargan al tocarlas.
 * - Filtros de marca y orden usan los filtros nativos de Shopify:
 *     /collections/<handle>?view=bf-cards&filter.p.vendor=Natura&sort_by=best-selling
 * - "Ver todo" lleva a la colección con el mismo filtro y orden.
 */
(function () {
  function init(root) {
    if (!root || root.__collectionTabsReady) return;
    root.__collectionTabsReady = true;

    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('[role="tabpanel"]'));
    var viewAll = root.querySelector('[data-view-all]');
    var vendorGroup = root.querySelector('[data-filter="vendor"]');
    var sortGroup = root.querySelector('[data-filter="sort"]');
    var limit = parseInt(root.getAttribute('data-limit'), 10) || 8;
    var cache = {};
    var state = { tab: 0, vendor: '', sort: root.getAttribute('data-default-sort') || '' };
    var lazy = root.getAttribute('data-lazy') === 'true';

    tabs.forEach(function (tab, i) {
      if (tab.getAttribute('aria-selected') === 'true') state.tab = i;
    });

    function key() {
      return state.vendor + '|' + state.sort;
    }

    function params(forView) {
      var p = [];
      if (forView) p.push('view=bf-cards');
      if (state.vendor) p.push('filter.p.vendor=' + encodeURIComponent(state.vendor));
      if (state.sort) p.push('sort_by=' + encodeURIComponent(state.sort));
      return p.length ? '?' + p.join('&') : '';
    }

    function setPressed(group, value) {
      if (!group) return;
      Array.prototype.forEach.call(group.querySelectorAll('.collection-tabs__chip'), function (chip) {
        chip.setAttribute('aria-pressed', chip.getAttribute('data-value') === value ? 'true' : 'false');
      });
    }

    // Solo se muestran las marcas que existen en la pestaña activa.
    function updateVendorChips() {
      if (!vendorGroup) return;
      var vendors = (tabs[state.tab].getAttribute('data-vendors') || '').split(',').map(function (v) {
        return v.trim().toLowerCase();
      });
      var shown = 0;
      Array.prototype.forEach.call(vendorGroup.querySelectorAll('.collection-tabs__chip'), function (chip) {
        var value = chip.getAttribute('data-value');
        if (!value) return;
        var available = vendors.indexOf(value.toLowerCase()) !== -1;
        chip.hidden = !available;
        if (available) shown += 1;
      });
      // Con una sola marca no tiene sentido filtrar.
      vendorGroup.hidden = shown < 2;
      if (state.vendor && vendors.indexOf(state.vendor.toLowerCase()) === -1) {
        state.vendor = '';
        setPressed(vendorGroup, '');
      }
    }

    function updateViewAll() {
      if (viewAll) viewAll.setAttribute('href', tabs[state.tab].getAttribute('data-url') + params(false));
    }

    function render(panel, html) {
      var list = panel.querySelector('.product-grid');
      var empty = panel.querySelector('.collection-tabs__empty');
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var items = Array.prototype.slice.call(doc.querySelectorAll('[data-bf-cards] > .grid__item'), 0, limit);
      list.innerHTML = '';
      items.forEach(function (item) {
        list.appendChild(document.importNode(item, true));
      });
      list.setAttribute('data-key', key());
      if (empty) empty.hidden = items.length > 0;
    }

    function load(index) {
      var panel = panels[index];
      var list = panel.querySelector('.product-grid');
      var k = key();
      if (list.getAttribute('data-key') === k) return;

      var url = tabs[index].getAttribute('data-url') + params(true);
      var cacheKey = url;
      if (cache[cacheKey]) {
        render(panel, cache[cacheKey]);
        return;
      }

      panel.classList.add('is-loading');
      panel.setAttribute('aria-busy', 'true');
      fetch(url, { headers: { Accept: 'text/html' } })
        .then(function (response) {
          if (!response.ok) throw new Error(response.status);
          return response.text();
        })
        .then(function (html) {
          cache[cacheKey] = html;
          // Si el usuario cambió de filtro mientras cargaba, se ignora esta respuesta.
          if (key() === k && state.tab === index) render(panel, html);
        })
        .catch(function () {
          // Si falla la carga, se lleva a la colección completa.
          window.location.href = tabs[index].getAttribute('data-url') + params(false);
        })
        .then(function () {
          panel.classList.remove('is-loading');
          panel.removeAttribute('aria-busy');
        });
    }

    function selectTab(index, focus) {
      state.tab = index;
      tabs.forEach(function (tab, i) {
        var on = i === index;
        tab.setAttribute('aria-selected', on ? 'true' : 'false');
        tab.setAttribute('tabindex', on ? '0' : '-1');
        if (panels[i]) panels[i].hidden = !on;
        if (on && focus) tab.focus();
      });
      updateVendorChips();
      updateViewAll();
      load(index);
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        selectTab(i, false);
      });
      tab.addEventListener('keydown', function (event) {
        var next = null;
        if (event.key === 'ArrowRight') next = (i + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
        if (next !== null) {
          event.preventDefault();
          selectTab(next, true);
        }
      });
    });

    [vendorGroup, sortGroup].forEach(function (group) {
      if (!group) return;
      group.addEventListener('click', function (event) {
        var chip = event.target.closest('.collection-tabs__chip');
        if (!chip) return;
        var value = chip.getAttribute('data-value');
        if (group === vendorGroup) state.vendor = value;
        else state.sort = value;
        setPressed(group, value);
        updateViewAll();
        load(state.tab);
      });
    });

    root.addEventListener('click', function (event) {
      if (!event.target.closest('[data-clear-filters]')) return;
      state.vendor = '';
      state.sort = '';
      setPressed(vendorGroup, '');
      setPressed(sortGroup, '');
      updateViewAll();
      load(state.tab);
    });

    // El orden inicial también se refleja en los chips de orden.
    setPressed(sortGroup, state.sort);

    // Flechas del carrusel
    Array.prototype.forEach.call(root.querySelectorAll('[data-arrow]'), function (arrow) {
      arrow.addEventListener('click', function () {
        var list = panels[state.tab].querySelector('.product-grid');
        list.scrollBy({ left: list.clientWidth * 0.8 * Number(arrow.getAttribute('data-arrow')), behavior: 'smooth' });
      });
    });

    updateVendorChips();
    updateViewAll();
    if (lazy) load(state.tab);
  }

  function initAll() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-collection-tabs]'), init);
  }

  initAll();
  document.addEventListener('shopify:section:load', initAll);
})();

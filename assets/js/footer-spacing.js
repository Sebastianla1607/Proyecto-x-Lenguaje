/* footer-spacing.js
   Calcula la altura del footer inyectado y aplica padding-bottom
   al <body> para evitar que el contenido quede oculto detrás del footer fijo.
*/
(function () {
  'use strict';

  function updateFooterSpacing() {
    try {
      const siteFooter = document.getElementById('site-footer');
      if (!siteFooter) return;

      // El footer inyectado suele ser el primer hijo (un contenedor con position:fixed)
      const footerEl = siteFooter.firstElementChild || siteFooter.querySelector('div');
      if (!footerEl) {
        // si no hay footer, quitar padding
        document.body.style.paddingBottom = '';
        return;
      }

      const r = footerEl.getBoundingClientRect();
      const height = Math.ceil(r.height || 0);

      // Aplica un pequeño margen extra para evitar solapamientos visuales
      const extra = 12; // px (ajustado)
      if (height > 0) {
        document.body.style.paddingBottom = (height + extra) + 'px';
      } else {
        document.body.style.paddingBottom = '';
      }
    } catch (e) {
      // No bloquee la página por un fallo de medición
      console.debug('updateFooterSpacing error:', e);
    }
  }

  // Marca el enlace activo en el footer según la URL actual
  function markActiveFooter() {
    try {
      const siteFooter = document.getElementById('site-footer');
      if (!siteFooter) return;
      const anchors = siteFooter.querySelectorAll('a[data-page]');
      if (!anchors || anchors.length === 0) return;

      const file = (window.location.pathname || '').split('/').pop().toLowerCase() || '';
      let pageKey = '';
      if (file.includes('index') || file === '') pageKey = 'index';
      else if (file.includes('candid')) pageKey = 'candidatos';
      else if (file.includes('calend')) pageKey = 'calendario';
      else if (file.includes('partid')) pageKey = 'partidos';
      else if (file.includes('noti')) pageKey = 'index'; // fallback

      anchors.forEach(a => {
        const p = (a.getAttribute('data-page') || '').toLowerCase();
        if (p === pageKey) {
          a.classList.add('footer-active');
          a.setAttribute('aria-current', 'page');
        } else {
          a.classList.remove('footer-active');
          a.removeAttribute('aria-current');
        }
      });
    } catch (e) {
      console.debug('markActiveFooter error:', e);
    }
  }

  // Observador para detectar cuando el footer es inyectado vía innerHTML
  function init() {
    const siteFooter = document.getElementById('site-footer');
    if (!siteFooter) return;

    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'childList' && m.addedNodes.length) {
          // pequeño delay para que el layout se estabilice
          setTimeout(() => {
            updateFooterSpacing();
            markActiveFooter();
          }, 50);
          return;
        }
      }
    });

    mo.observe(siteFooter, { childList: true, subtree: true });

    // recalcula en resize/orientationchange
    window.addEventListener('resize', () => requestAnimationFrame(updateFooterSpacing));
    window.addEventListener('orientationchange', () => setTimeout(updateFooterSpacing, 120));

    // Intento inicial por si el footer ya estaba presente
    if (siteFooter.children.length) setTimeout(() => { updateFooterSpacing(); markActiveFooter(); }, 50);

    // Exponer para pruebas/manual invocation
    window.updateFooterSpacing = updateFooterSpacing;
    window.markActiveFooter = markActiveFooter;
  }

  // Ejecutar init tan pronto como el DOM esté disponible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

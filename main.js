/* ============================================
   IBIZADAY.COM — main.js
   Unificado desde inline scripts individuales.
   Correcciones aplicadas:
   - Bug #1: aria-label del menú toggle faltaba en páginas internas
   - Bug #2: Lightbox añadido (solo activo en galería)
   ============================================ */

/* --- Scroll Reveal (Intersection Observer) --- */
(function () {
  var reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
  reveals.forEach(function (el) { observer.observe(el); });
}());

/* --- Header: ocultar al bajar, mostrar al subir --- */
(function () {
  var header = document.querySelector('.site-header');
  if (!header) return;
  var lastScrollY = 0;
  var ticking = false;
  function updateHeader() {
    var currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY && currentScrollY > 120) {
      header.classList.add('is-hidden');
    } else {
      header.classList.remove('is-hidden');
    }
    lastScrollY = currentScrollY;
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(updateHeader); ticking = true; }
  }, { passive: true });
}());

/* --- Menú móvil ---
   FIX: aria-label dinámico (Abrir/Cerrar) estaba ausente en páginas internas.
   Se centraliza aquí para todas las páginas. */
(function () {
  var toggle = document.querySelector('.menu-toggle');
  var navWrapper = document.querySelector('.nav-wrapper');
  if (!toggle || !navWrapper) return;

  toggle.addEventListener('click', function () {
    var isOpen = navWrapper.classList.toggle('is-open');
    toggle.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', isOpen);
    toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navWrapper.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      navWrapper.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
      document.body.style.overflow = '';
    });
  });
}());

/* --- Lightbox (activo solo si hay .gallery-item en la página) ---
   NUEVO: Galería sin lightbox era un hueco de UX notable. */
(function () {
  var galleryItems = document.querySelectorAll('.gallery-item');
  if (!galleryItems.length) return;

  /* Construir overlay */
  var lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Vista ampliada de imagen');
  lb.innerHTML = [
    '<div class="lightbox-backdrop"></div>',
    '<button class="lightbox-btn lightbox-close" aria-label="Cerrar">&#x2715;</button>',
    '<button class="lightbox-btn lightbox-prev" aria-label="Imagen anterior">&#8592;</button>',
    '<img class="lightbox-img" src="" alt="">',
    '<button class="lightbox-btn lightbox-next" aria-label="Imagen siguiente">&#8594;</button>',
    '<p class="lightbox-counter" aria-live="polite"></p>'
  ].join('');
  document.body.appendChild(lb);

  var lbImg     = lb.querySelector('.lightbox-img');
  var lbClose   = lb.querySelector('.lightbox-close');
  var lbPrev    = lb.querySelector('.lightbox-prev');
  var lbNext    = lb.querySelector('.lightbox-next');
  var lbCounter = lb.querySelector('.lightbox-counter');
  var lbBackdrop = lb.querySelector('.lightbox-backdrop');
  var imgs      = Array.from(document.querySelectorAll('.gallery-item img'));
  var current   = 0;
  var lastFocused;

  function setImage(index) {
    current = (index + imgs.length) % imgs.length;
    var src = imgs[current].getAttribute('src').replace(/w=\d+(&|%26)h=\d+/, 'w=1400$1h=1000');
    lbImg.src = src;
    lbImg.alt = imgs[current].alt;
    lbCounter.textContent = (current + 1) + ' / ' + imgs.length;
  }

  function open(index) {
    lastFocused = document.activeElement;
    setImage(index);
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function close() {
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  /* Hacer cada item enfocable y clicable */
  galleryItems.forEach(function (item, i) {
    var img = item.querySelector('img');
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    if (img) item.setAttribute('aria-label', 'Ampliar: ' + img.alt);
    item.addEventListener('click', function () { open(i); });
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });

  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click', function () { setImage(current - 1); });
  lbNext.addEventListener('click', function () { setImage(current + 1); });
  lbBackdrop.addEventListener('click', close);

  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft')   setImage(current - 1);
    if (e.key === 'ArrowRight')  setImage(current + 1);
  });
}());

/* --- Catalog Tabs (activo solo si hay .catalog-tab en la página) --- */
(function () {
  var tabs = document.querySelectorAll('.catalog-tab');
  var panels = document.querySelectorAll('.catalog-panel');
  if (!tabs.length || !panels.length) return;

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.getAttribute('data-tab');

      /* Desactivar todos */
      tabs.forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach(function (p) {
        p.classList.remove('is-active');
      });

      /* Activar el seleccionado */
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      var panel = document.getElementById('panel-' + target);
      if (panel) {
        panel.classList.add('is-active');
        /* Re-trigger reveal animations en el panel nuevo */
        panel.querySelectorAll('.reveal:not(.is-visible)').forEach(function (el) {
          el.classList.add('is-visible');
        });
      }

      /* Scroll suave al inicio del contenido */
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  /* Activar reveals del panel inicial */
  var activePanel = document.querySelector('.catalog-panel.is-active');
  if (activePanel) {
    setTimeout(function () {
      activePanel.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('is-visible');
      });
    }, 100);
  }
}());

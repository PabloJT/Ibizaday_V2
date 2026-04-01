/* ============================================
   IBIZADAY.COM — main.js
   Unificado desde inline scripts individuales.
   Correcciones aplicadas:
   - Bug #1: aria-label del menu toggle faltaba en paginas internas
   - Bug #2: Lightbox anadido (solo activo en galeria)
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

/* --- Menu movil ---
   FIX: aria-label dinamico (Abrir/Cerrar) estaba ausente en paginas internas.
   Se centraliza aqui para todas las paginas. */
(function () {
  var toggle = document.querySelector('.menu-toggle');
  var navWrapper = document.querySelector('.nav-wrapper');
  if (!toggle || !navWrapper) return;

  toggle.addEventListener('click', function () {
    var isOpen = navWrapper.classList.toggle('is-open');
    toggle.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', isOpen);
    toggle.setAttribute('aria-label', isOpen ? 'Cerrar menu' : 'Abrir menu');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navWrapper.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      navWrapper.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu');
      document.body.style.overflow = '';
    });
  });
}());

/* --- Lightbox (activo solo si hay .gallery-item en la pagina) ---
   NUEVO: Galeria sin lightbox era un hueco de UX notable. */
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

/* --- Space Card Carousel --- */
(function () {
  var cards = document.querySelectorAll('.space-card');
  if (!cards.length) return;

  cards.forEach(function (card) {
    var wrap = card.querySelector('.space-card-image-wrap');
    var gallery = card.querySelector('.space-card-gallery');
    if (!gallery) return;

    var images = Array.from(gallery.querySelectorAll('.space-card-image'));
    if (images.length < 2) return;

    var current = 0;

    /* Hide all except first */
    images.forEach(function (img, i) {
      img.style.display = i === 0 ? 'block' : 'none';
    });

    /* Create prev/next buttons */
    var prev = document.createElement('button');
    prev.className = 'space-card-prev';
    prev.setAttribute('aria-label', 'Imagen anterior');
    prev.innerHTML = '&#8592;';

    var next = document.createElement('button');
    next.className = 'space-card-next';
    next.setAttribute('aria-label', 'Imagen siguiente');
    next.innerHTML = '&#8594;';

    /* Create dots */
    var dotsWrap = document.createElement('div');
    dotsWrap.className = 'space-card-dots';
    images.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'space-card-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', 'Ir a imagen ' + (i + 1));
      dot.addEventListener('click', function (e) {
        e.stopPropagation();
        goTo(i);
      });
      dotsWrap.appendChild(dot);
    });

    wrap.appendChild(prev);
    wrap.appendChild(next);
    wrap.appendChild(dotsWrap);

    function goTo(index) {
      images[current].style.display = 'none';
      current = (index + images.length) % images.length;
      images[current].style.display = 'block';
      dotsWrap.querySelectorAll('.space-card-dot').forEach(function (d, i) {
        d.classList.toggle('is-active', i === current);
      });
    }

    prev.addEventListener('click', function (e) { e.stopPropagation(); goTo(current - 1); });
    next.addEventListener('click', function (e) { e.stopPropagation(); goTo(current + 1); });

    /* Touch/swipe support */
    var startX = 0;
    wrap.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    wrap.addEventListener('touchend', function (e) {
      var diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
    });
  });
}());

/* --- Pack Builder (activo solo en catalogo.html) --- */
(function () {
  var STORAGE_KEY = 'ibizaday_pack';

  /* ---- Persistence ---- */
  function loadPack() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { items: [] };
    } catch (e) {
      return { items: [] };
    }
  }

  function savePack(pack) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pack));
    } catch (e) { /* quota exceeded — silently ignore */ }
  }

  /* ---- Calculations ---- */
  function calculateTotal(pack) {
    return pack.items.reduce(function (sum, item) { return sum + item.price; }, 0);
  }

  function formatPrice(number) {
    return number.toLocaleString('es-ES');
  }

  /* ---- Pack mutations ---- */
  function addItem(itemData) {
    var pack = loadPack();
    var exists = pack.items.some(function (i) { return i.id === itemData.id; });
    if (exists) return;
    pack.items.push(itemData);
    savePack(pack);
    updateAll(pack);
  }

  function removeItem(itemId) {
    var pack = loadPack();
    pack.items = pack.items.filter(function (i) { return i.id !== itemId; });
    savePack(pack);
    updateAll(pack);
  }

  function toggleItem(itemData) {
    var pack = loadPack();
    var exists = pack.items.some(function (i) { return i.id === itemData.id; });
    if (exists) {
      removeItem(itemData.id);
    } else {
      addItem(itemData);
    }
  }

  /* ---- UI updates ---- */
  function updateBar(pack) {
    var bar = document.getElementById('pack-bar');
    var countEl = document.getElementById('pack-bar-count');
    var totalEl = document.getElementById('pack-bar-total');
    if (!bar) return;

    var count = pack.items.length;
    var total = calculateTotal(pack);

    countEl.textContent = count;
    totalEl.textContent = formatPrice(total) + ' €';

    if (count > 0) {
      bar.classList.add('is-visible');
    } else {
      bar.classList.remove('is-visible');
      closeDrawer();
    }
  }

  function updateDrawer(pack) {
    var list = document.getElementById('pack-drawer-list');
    var drawerTotal = document.getElementById('pack-drawer-total');
    if (!list) return;

    list.innerHTML = '';

    if (pack.items.length === 0) {
      var empty = document.createElement('li');
      empty.className = 'pack-drawer-empty';
      empty.textContent = 'Tu pack esta vacio. Añade espacios, servicios o amenities desde el catalogo.';
      list.appendChild(empty);
    } else {
      pack.items.forEach(function (item) {
        var li = document.createElement('li');
        li.className = 'pack-drawer-item';
        li.innerHTML = [
          '<div class="pack-drawer-item-info">',
            '<p class="pack-drawer-item-name">' + escapeHtml(item.name) + '</p>',
            '<p class="pack-drawer-item-category">' + escapeHtml(item.category) + '</p>',
          '</div>',
          '<span class="pack-drawer-item-price">' + formatPrice(item.price) + ' €</span>',
          '<button class="pack-drawer-item-remove" data-id="' + escapeHtml(item.id) + '" aria-label="Eliminar ' + escapeHtml(item.name) + ' del pack">✕</button>'
        ].join('');
        list.appendChild(li);
      });

      list.querySelectorAll('.pack-drawer-item-remove').forEach(function (btn) {
        btn.addEventListener('click', function () {
          removeItem(btn.getAttribute('data-id'));
        });
      });
    }

    if (drawerTotal) {
      drawerTotal.textContent = formatPrice(calculateTotal(pack)) + ' €';
    }
  }

  function updateCardButtons(pack) {
    var buttons = document.querySelectorAll('.btn-add-pack');
    buttons.forEach(function (btn) {
      var card = btn.closest('[data-id]');
      if (!card) return;
      var id = card.getAttribute('data-id');
      var inPack = pack.items.some(function (i) { return i.id === id; });
      if (inPack) {
        btn.classList.add('is-added');
        btn.textContent = '✓ En el pack';
      } else {
        btn.classList.remove('is-added');
        btn.textContent = '+ Añadir al pack';
      }
    });
  }

  function updateAll(pack) {
    updateBar(pack);
    updateDrawer(pack);
    updateCardButtons(pack);
  }

  /* ---- Drawer open/close ---- */
  var lastFocusedBeforeDrawer;

  function openDrawer() {
    var drawer = document.getElementById('pack-drawer');
    var overlay = document.getElementById('pack-drawer-overlay');
    var toggle = document.getElementById('pack-bar-toggle');
    if (!drawer) return;
    lastFocusedBeforeDrawer = document.activeElement;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    if (overlay) {
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
    }
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    var closeBtn = document.getElementById('pack-drawer-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeDrawer() {
    var drawer = document.getElementById('pack-drawer');
    var overlay = document.getElementById('pack-drawer-overlay');
    var toggle = document.getElementById('pack-bar-toggle');
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    if (overlay) {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
    }
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (lastFocusedBeforeDrawer) lastFocusedBeforeDrawer.focus();
  }

  /* ---- Success toast popup ---- */
  function showSuccessToast() {
    var existing = document.getElementById('pack-success-toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.id = 'pack-success-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.style.cssText = [
      'position:fixed',
      'top:50%',
      'left:50%',
      'transform:translate(-50%,-50%) scale(0.92)',
      'z-index:9000',
      'background-color:#1A1A1A',
      'color:#FAF7F3',
      'padding:2.5rem 2rem',
      'max-width:min(90vw,420px)',
      'width:100%',
      'text-align:center',
      'box-shadow:0 20px 60px rgba(0,0,0,0.35)',
      'opacity:0',
      'transition:opacity 0.3s ease, transform 0.3s ease',
      'border-top:3px solid #8B7355'
    ].join(';');

    toast.innerHTML = [
      '<p style="font-family:\'DM Sans\',sans-serif;font-size:2rem;margin-bottom:0.5rem;">✓</p>',
      '<p style="font-family:\'DM Sans\',sans-serif;font-size:1.125rem;font-weight:600;letter-spacing:0.04em;margin-bottom:0.75rem;">¡Solicitud enviada!</p>',
      '<p style="font-family:\'DM Mono\',monospace;font-size:0.8125rem;line-height:1.6;color:rgba(250,247,243,0.75);">En breve te confirmamos tu experiencia personalizada. Nuestro equipo se pondrá en contacto contigo.</p>'
    ].join('');

    document.body.appendChild(toast);

    /* Animate in */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        toast.style.opacity = '1';
        toast.style.transform = 'translate(-50%,-50%) scale(1)';
      });
    });

    /* Auto-dismiss after 3.5s */
    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%,-50%) scale(0.92)';
      setTimeout(function () { toast.remove(); }, 350);
    }, 3500);

    /* Click to dismiss */
    toast.addEventListener('click', function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%,-50%) scale(0.92)';
      setTimeout(function () { toast.remove(); }, 350);
    });
  }

  /* ---- Navigate to contact ---- */
  function goToContact() {
    showSuccessToast();
    /* Navigate after toast is visible */
    setTimeout(function () {
      window.location.href = 'contacto.html';
    }, 1200);
  }

  /* ---- Helpers ---- */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ---- Init ---- */
  function initPackBuilder() {
    var cards = document.querySelectorAll('[data-id][data-price]');
    if (!cards.length) return;

    /* Attach add-to-pack buttons */
    cards.forEach(function (card) {
      var btn = card.querySelector('.btn-add-pack');
      if (!btn) return;

      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var itemData = {
          id: card.getAttribute('data-id'),
          category: card.getAttribute('data-category') || '',
          name: card.getAttribute('data-name') || '',
          price: parseFloat(card.getAttribute('data-price')) || 0,
          priceLabel: card.getAttribute('data-price-label') || '',
          unit: card.getAttribute('data-unit') || ''
        };
        toggleItem(itemData);
      });
    });

    /* Bar toggle */
    var barToggle = document.getElementById('pack-bar-toggle');
    if (barToggle) {
      barToggle.addEventListener('click', function () {
        var drawer = document.getElementById('pack-drawer');
        if (drawer && drawer.classList.contains('is-open')) {
          closeDrawer();
        } else {
          openDrawer();
        }
      });
    }

    /* Bar CTA */
    var barCta = document.getElementById('pack-bar-cta');
    if (barCta) barCta.addEventListener('click', goToContact);

    /* Drawer close */
    var drawerClose = document.getElementById('pack-drawer-close');
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);

    /* Drawer overlay */
    var overlay = document.getElementById('pack-drawer-overlay');
    if (overlay) overlay.addEventListener('click', closeDrawer);

    /* Drawer CTA */
    var drawerCta = document.getElementById('pack-drawer-cta');
    if (drawerCta) drawerCta.addEventListener('click', goToContact);

    /* Keyboard: Escape closes drawer */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        var drawer = document.getElementById('pack-drawer');
        if (drawer && drawer.classList.contains('is-open')) closeDrawer();
      }
    });

    /* Initial render from sessionStorage */
    var pack = loadPack();
    updateAll(pack);
  }

  initPackBuilder();
}());

/* --- Catalog Tabs (activo solo si hay .catalog-tab en la pagina) --- */
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

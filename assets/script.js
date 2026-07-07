// TODO: reemplazar por link real de WhatsApp cuando esté disponible
const WHATSAPP_URL = "#";
const CALENDAR_URL = "https://calendar.app.google/iLWW6MV4nTWBHchHA";

function _getAuthUser() {
  try {
    const raw = localStorage.getItem('adsveris_user');
    if (!raw) return null;
    const hasSession = Object.keys(localStorage).some(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
    return hasSession ? JSON.parse(raw) : null;
  } catch { return null; }
}

window._adsLogout = function() {
  localStorage.removeItem('adsveris_user');
  Object.keys(localStorage).filter(k => k.startsWith('sb-')).forEach(k => localStorage.removeItem(k));
  const inSubfolder = window.location.pathname.includes('/soluciones/');
  window.location.href = inSubfolder ? '../index.html' : 'index.html';
};

function getProducts() {
  return window.ADS_VERIS_PRODUCTS || [];
}

function getProductBySlug(slug) {
  return getProducts().find((product) => product.slug === slug);
}

function renderChrome() {
  const page = document.body.dataset.page || "";
  const inSubfolder = window.location.pathname.includes('/soluciones/');
  const base = inSubfolder ? '../' : '';
  const solActive = ['soluciones', 'paginas-web', 'procesos', 'tienda', 'producto'].includes(page);
  const headerHost = document.querySelector("[data-header]");
  const footerHost = document.querySelector("[data-footer]");

  if (headerHost) {
    headerHost.innerHTML = `
      <header class="site-header">
        <div class="container header-inner">
          <a class="brand" href="${base}index.html" aria-label="Ir a inicio">
            <span class="brand-mark">
              <img src="${base}assets/images/logo-ads-veris.png" alt="Logo ADS Veris">
            </span>
            <span class="brand-name">ADS <span>Veris</span></span>
          </a>
          <nav class="main-nav" aria-label="Principal">
            <a href="${base}index.html" class="${page === "home" ? "active" : ""}">Inicio</a>
            <a href="${base}soluciones/index.html" class="${solActive ? "active" : ""}">Soluciones</a>
            <a href="${base}plataforma.html" class="${page === "plataforma" ? "active" : ""}">Plataforma</a>
            <a href="${base}nosotros.html" class="${page === "nosotros" ? "active" : ""}">Nosotros</a>
            <a href="${base}ayuda.html" class="${page === "ayuda" ? "active" : ""}">Ayuda</a>
          </nav>
          <div class="header-actions">
            ${(function() {
              const u = _getAuthUser();
              if (u) return `
                <button class="header-logout" onclick="_adsLogout()">Cerrar sesión</button>
                <a href="/profile" class="header-avatar" title="${u.name}">${u.initial}</a>
              `;
              return `
                <a href="/login" class="header-login">Iniciar sesión</a>
                <a href="/register" class="btn btn-primary btn-sm">Crear cuenta</a>
              `;
            })()}
          </div>
        </div>
      </header>
    `;
  }

  if (footerHost) {
    footerHost.innerHTML = `
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div>
              <div class="brand">
                <span class="brand-mark">
                  <img src="${base}assets/images/logo-ads-veris.png" alt="Logo ADS Veris">
                </span>
                <span class="brand-name">ADS <span>Veris</span></span>
              </div>
              <p class="small footer-copy">ADS Veris crea herramientas empresariales para que una PyME pueda ordenar, visualizar y comprender mejor su negocio.</p>
            </div>
            <div>
              <h3>Explorar</h3>
              <div class="footer-links">
                <a href="${base}index.html">Inicio</a>
                <a href="${base}soluciones/index.html">Soluciones</a>
                <a href="${base}nosotros.html">Nosotros</a>
                <a href="${base}ayuda.html">Ayuda</a>
              </div>
            </div>
            <div>
              <h3>Empresa</h3>
              <div class="footer-links">
                <a href="${base}contacto.html">Contacto</a>
                <a href="${base}plataforma.html">Plataforma de análisis</a>
                <a href="${base}tienda.html">Tienda de plantillas</a>
              </div>
            </div>
            <div>
              <h3>Información</h3>
              <div class="footer-links">
                <a href="${base}legal.html">Términos y condiciones</a>
                <a href="${base}privacidad.html">Privacidad</a>
                <a href="${base}reembolsos.html">Reembolsos</a>
              </div>
            </div>
          </div>
          <div class="footer-bottom">
            <span>© <span data-current-year></span> ADS Veris. Del dato al criterio.</span>
            <span>Soporte, documentos e información disponibles dentro del mismo proyecto.</span>
          </div>
        </div>
      </footer>
    `;
  }
}

function productCard(product) {
  return `
    <article class="card product-card" data-category="${product.category}">
      <a class="thumb" href="producto.html?id=${product.slug}" aria-label="Ver ${product.title}">
        <img src="${product.thumb}" alt="${product.title}">
        <div class="thumb-overlay">
          <div class="thumb-title">${product.shortTitle}</div>
          <span class="badge ${product.badgeClass}">${product.badge}</span>
        </div>
      </a>
      <div class="product-body">
        <div class="product-meta">${product.categoryLabel}</div>
        <h3>${product.title}</h3>
        <p class="small">${product.summary}</p>
        <div class="product-footer">
          <div>
            <div class="price">${product.price}</div>
            <small class="small">${product.priceNote}</small>
          </div>
          <div class="product-actions">
            <a class="btn btn-primary btn-sm" href="producto.html?id=${product.slug}">Ver detalle</a>
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderFeaturedProducts() {
  const host = document.querySelector("[data-featured-products]");
  if (!host) return;
  host.innerHTML = getProducts().filter((product) => product.featured).map(productCard).join("");
  if (document.body.dataset.page === "home") {
    host.querySelectorAll(".product-card").forEach((card, index) => {
      card.classList.add("reveal", "reveal-up");
      card.classList.add(`stagger-${Math.min(index + 1, 6)}`);
    });
  }
}

function updateStoreCounter(host) {
  const counter = document.querySelector("[data-store-count]");
  if (!counter) return;
  const visible = [...host.querySelectorAll(".product-card")].filter((card) => !card.classList.contains("hidden")).length;
  counter.textContent = `${visible} producto${visible === 1 ? "" : "s"} disponible${visible === 1 ? "" : "s"}`;
}

function renderStoreProducts() {
  const host = document.querySelector("[data-store-products]");
  if (!host) return;

  host.innerHTML = getProducts().map(productCard).join("");
  updateStoreCounter(host);

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-filter]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      const selected = button.dataset.filter;

      host.querySelectorAll(".product-card").forEach((card) => {
        const matches = selected === "all" || card.dataset.category === selected;
        card.classList.toggle("hidden", !matches);
      });

      updateStoreCounter(host);
    });
  });
}

function renderProductDetail() {
  const host = document.querySelector("[data-product-detail]");
  if (!host) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("id") || "balance-general";
  const product = getProductBySlug(slug) || getProducts()[0];
  document.title = `${product.shortTitle} | ADS Veris`;
  const images = product.images && product.images.length ? product.images : [product.thumb];

  const thumbs = images.map((image, index) => `
    <button type="button" class="${index === 0 ? "active" : ""}" data-gallery-thumb="${index}" aria-label="Ver imagen ${index + 1}">
      <img src="${image}" alt="${product.title} vista ${index + 1}">
    </button>
  `).join("");

  host.innerHTML = `
    <section class="section section-tight product-detail-section">
      <div class="container product-detail">
        <div class="card gallery">
          <div class="gallery-main" data-gallery-main>
            <button class="gallery-arrow gallery-arrow-prev" type="button" data-gallery-prev aria-label="Imagen anterior">&#8249;</button>
            <img src="${images[0]}" alt="${product.title}">
            <button class="gallery-arrow gallery-arrow-next" type="button" data-gallery-next aria-label="Imagen siguiente">&#8250;</button>
          </div>
          <div class="gallery-thumbs-wrap">
            <button class="gallery-strip-btn" type="button" data-gallery-strip-prev aria-label="Miniaturas anteriores">&#8249;</button>
            <div class="gallery-thumbs" data-gallery-thumbs>${thumbs}</div>
            <button class="gallery-strip-btn" type="button" data-gallery-strip-next aria-label="Miniaturas siguientes">&#8250;</button>
          </div>
        </div>
        <aside class="card detail-panel">
          <div class="pill">${product.categoryLabel}</div>
          <h2>${product.subtitle}</h2>
          <div class="detail-price">${product.price}</div>
          <p class="small">${product.priceNote}</p>
          <p>${product.description}</p>
          <div class="actions">
            <!-- Conecta aquí el checkout real o enlace de pago cuando definas el flujo comercial. -->
            <a class="btn btn-primary" href="${CALENDAR_URL}" target="_blank" rel="noreferrer">Coordinar compra</a>
            <a class="btn btn-secondary" href="tienda.html">Volver al catálogo</a>
          </div>
          <div class="detail-block">
            <h3>Problema que resuelve</h3>
            <p>${product.problem}</p>
          </div>
          <div class="detail-block">
            <h3>Qué incluye</h3>
            <ul class="info-list">${product.includes.map((item) => `<li>${item}</li>`).join("")}</ul>
          </div>
        </aside>
      </div>
    </section>
  `;

  const mainImage = host.querySelector("[data-gallery-main] img");
  const thumbButtons = [...host.querySelectorAll("[data-gallery-thumb]")];
  const thumbsTrack = host.querySelector("[data-gallery-thumbs]");
  let currentImage = 0;

  function setImage(index) {
    currentImage = (index + images.length) % images.length;
    mainImage.src = images[currentImage];
    mainImage.alt = `${product.title} vista ${currentImage + 1}`;
    thumbButtons.forEach((button, thumbIndex) => {
      button.classList.toggle("active", thumbIndex === currentImage);
    });
    thumbButtons[currentImage]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  thumbButtons.forEach((button, index) => {
    button.addEventListener("click", () => setImage(index));
  });

  host.querySelector("[data-gallery-prev]")?.addEventListener("click", () => setImage(currentImage - 1));
  host.querySelector("[data-gallery-next]")?.addEventListener("click", () => setImage(currentImage + 1));
  host.querySelector("[data-gallery-strip-prev]")?.addEventListener("click", () => {
    thumbsTrack?.scrollBy({ left: -260, behavior: "smooth" });
  });
  host.querySelector("[data-gallery-strip-next]")?.addEventListener("click", () => {
    thumbsTrack?.scrollBy({ left: 260, behavior: "smooth" });
  });
}

function handleWaitlistSubmit(form) {
  const email = form.querySelector('input[name="email"]');
  const message = form.parentElement.querySelector("[data-form-ok]") || form.querySelector("[data-form-ok]");
  if (!email || !email.value.trim()) {
    email?.focus();
    return;
  }
  if (message) {
    message.style.display = "block";
  }
  // Reemplaza este bloque por un fetch real cuando conectes Supabase, Resend, Formspree o tu propio backend.
  form.reset();
}

function bindWaitlistForms() {
  document.querySelectorAll("[data-waitlist-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      handleWaitlistSubmit(form);
    });
  });
}

function renderYear() {
  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
}

function initHomeMotion() {
  if (document.body.dataset.page !== "home") return;

  const revealNodes = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.14,
    rootMargin: "0px 0px -8% 0px"
  });

  revealNodes.forEach((node) => observer.observe(node));
}

function initHeroCarousel() {
  const carousel = document.getElementById("heroCarousel");
  if (!carousel) return;

  const slides = carousel.querySelectorAll(".carousel-slide");
  const dots = document.querySelectorAll("#heroDots .carousel-dot");
  const prevBtn = document.getElementById("heroPrev");
  const nextBtn = document.getElementById("heroNext");
  const counter = document.getElementById("heroCounter");

  let current = 0;
  let autoTimer = null;
  let paused = false;

  function updateCounter() {
    if (!counter) return;
    counter.textContent = `${String(current + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
  }

  function activate(index) {
    slides[current].classList.remove("is-active");
    dots[current].classList.remove("is-active");
    current = (index + slides.length) % slides.length;
    slides[current].classList.add("is-active");
    dots[current].classList.add("is-active");
    updateCounter();
  }

  function next() { activate(current + 1); }
  function prev() { activate(current - 1); }

  function startAuto() {
    if (paused) return;
    clearInterval(autoTimer);
    autoTimer = setInterval(next, 3000);
  }

  function stopAuto() {
    clearInterval(autoTimer);
    paused = true;
  }

  if (prevBtn) prevBtn.addEventListener("click", () => { stopAuto(); prev(); });
  if (nextBtn) nextBtn.addEventListener("click", () => { stopAuto(); next(); });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      stopAuto();
      activate(parseInt(dot.dataset.dot, 10));
    });
  });

  // Navegación por teclado (flechas ← →)
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft")  { stopAuto(); prev(); }
    if (e.key === "ArrowRight") { stopAuto(); next(); }
  });

  // Soporte touch/swipe
  let touchStartX = 0;
  carousel.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  carousel.addEventListener("touchend", (e) => {
    const delta = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) { stopAuto(); delta > 0 ? next() : prev(); }
  }, { passive: true });

  updateCounter();
  startAuto();
}

function bindWhatsappButtons() {
  document.querySelectorAll(".js-whatsapp-contact").forEach((btn) => {
    btn.href = WHATSAPP_URL;
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      openKommoModal(resolveKommoService(btn));
    });
  });
}

function resolveKommoService(button) {
  if (button.dataset.kommoService) return button.dataset.kommoService;

  const text = (button.textContent || "").toLowerCase();
  const page = document.body.dataset.page || "";
  const slide = button.closest(".carousel-slide");
  const slideLabel = (slide?.querySelector(".carousel-label")?.textContent || "").toLowerCase();

  if (text.includes("web") || text.includes("plan b") || text.includes("plan comercial") || text.includes("plan avanzado") || page === "paginas-web" || slideLabel.includes("web")) {
    return "Página Web";
  }

  if (text.includes("diagn") || text.includes("proceso") || page === "procesos" || slideLabel.includes("proceso")) {
    return "Optimización de Procesos";
  }

  if (text.includes("plataforma") || text.includes("análisis") || page === "plataforma") {
    return "Plataforma de Análisis";
  }

  return "Planilla Excel Personalizada";
}

function getKommoWidgetSrc() {
  const inSubfolder = window.location.pathname.includes('/soluciones/');
  return `${inSubfolder ? '../' : ''}app-assets/kommo-widget.js`;
}

function loadKommoWidget() {
  if (window.openKommoContactForm) return Promise.resolve();

  const existing = document.querySelector('script[data-kommo-widget]');
  if (existing) {
    return new Promise((resolve, reject) => {
      window.addEventListener('adsveris:kommo-widget-ready', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = getKommoWidgetSrc();
    script.dataset.kommoWidget = 'true';
    script.addEventListener('error', reject, { once: true });
    window.addEventListener('adsveris:kommo-widget-ready', resolve, { once: true });
    document.head.appendChild(script);
  });
}

async function openKommoModal(serviceType) {
  try {
    await loadKommoWidget();
    window.openKommoContactForm?.(serviceType);
  } catch (error) {
    console.error('No se pudo cargar el modal Kommo:', error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderChrome();
  renderFeaturedProducts();
  renderStoreProducts();
  renderProductDetail();
  bindWaitlistForms();
  renderYear();
  initHomeMotion();
  initHeroCarousel();
  bindWhatsappButtons();
});

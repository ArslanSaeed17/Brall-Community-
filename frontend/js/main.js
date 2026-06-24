// ─── PAGE LOADER ────────────────────────────────────────────────────────────
(function () {
  const loader = document.getElementById('pageLoader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('done'), 1200);
    });
  }
})();

// ─── NAV SCROLL ─────────────────────────────────────────────────────────────
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// ─── HAMBURGER ──────────────────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

// ─── HERO CANVAS (geometric pattern) ────────────────────────────────────────
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], frameId;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  // Floating particles
  function Particle() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.r  = Math.random() * 1.5 + 0.3;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.a  = Math.random() * 0.5 + 0.1;
  }

  function init() {
    particles = Array.from({ length: 120 }, () => new Particle());
  }

  function drawGeometric() {
    // subtle geometric grid
    ctx.strokeStyle = 'rgba(201,168,76,0.04)';
    ctx.lineWidth = 1;
    const size = 80;
    for (let x = 0; x < W; x += size) {
      for (let y = 0; y < H; y += size) {
        ctx.beginPath();
        ctx.moveTo(x + size/2, y);
        ctx.lineTo(x + size, y + size/2);
        ctx.lineTo(x + size/2, y + size);
        ctx.lineTo(x, y + size/2);
        ctx.closePath();
        ctx.stroke();
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawGeometric();

    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${p.a})`;
      ctx.fill();
    });

    // Connect nearby particles
    particles.forEach((a, i) => {
      particles.slice(i + 1).forEach(b => {
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(201,168,76,${0.06 * (1 - dist/120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });

    frameId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); init(); }, { passive: true });
  resize(); init(); draw();
})();

// ─── SCROLL REVEAL ──────────────────────────────────────────────────────────
(function initScrollReveal() {
  const els = document.querySelectorAll('.scroll-reveal');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
})();

// ─── COUNTER ANIMATION ──────────────────────────────────────────────────────
function animateCounter(el, target, duration = 1800) {
  if (!el || isNaN(target)) return;
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(ease * target);
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

// ─── HOME PAGE LOGIC ─────────────────────────────────────────────────────────
async function initHomePage() {
  // Stats
  try {
    const stats = await api.get('/api/stats');
    const hEl = document.getElementById('stat-history');
    const gEl = document.getElementById('stat-gallery');
    animateCounter(hEl, stats.history_count || 0);
    animateCounter(gEl, stats.gallery_count || 0);
  } catch (e) { /* stats unavailable */ }

  // Latest history posts
  const grid = document.getElementById('latestHistoryGrid');
  if (grid) {
    try {
      const posts = await api.get('/api/history');
      const latest = posts.slice(0, 3);
      grid.innerHTML = latest.length
        ? latest.map((p, i) => `
          <div class="post-card scroll-reveal delay-${i}00" onclick="location.href='history.html'">
            ${p.image_url
              ? `<img class="card-img" src="${p.image_url}" alt="${p.title}" loading="lazy">`
              : `<div class="card-img-placeholder">🏛️</div>`}
            <div class="card-body">
              ${p.era ? `<p class="card-era">${p.era}</p>` : ''}
              <h3 class="card-title">${p.title}</h3>
              <p class="card-excerpt">${excerpt(p.content)}</p>
            </div>
            <div class="card-footer-meta">${formatDate(p.created_at)}</div>
          </div>`).join('')
        : `<p style="color:var(--cream-dim);grid-column:span 3;text-align:center;padding:40px 0">No history posts yet.</p>`;
      // re-observe new elements
      setTimeout(initScrollReveal, 50);
    } catch (e) {
      grid.innerHTML = '<p style="color:var(--cream-dim);text-align:center;padding:40px 0">Could not load posts.</p>';
    }
  }

  // Gallery preview
  const gPrev = document.getElementById('galleryPreview');
  if (gPrev) {
    try {
      const items = await api.get('/api/gallery');
      const preview = items.slice(0, 3);
      gPrev.innerHTML = preview.length
        ? preview.map(item => `
          <div class="gallery-item">
            ${item.media_type === 'video'
              ? `<video src="${item.url}" muted loop autoplay playsinline></video>`
              : `<img src="${item.url}" alt="${item.caption}" loading="lazy">`}
            <div class="gallery-overlay">
              <p class="gallery-caption">${item.caption || ''}</p>
            </div>
          </div>`).join('')
        : '<p style="color:var(--cream-dim);text-align:center;grid-column:span 3;padding:40px 0">No gallery items yet.</p>';
    } catch (e) { /* gallery unavailable */ }
  }
}

// ─── HISTORY PAGE LOGIC ──────────────────────────────────────────────────────
async function initHistoryPage() {
  const container = document.getElementById('historyContainer');
  const eraFilter  = document.getElementById('eraFilter');
  if (!container) return;

  let allPosts = [];
  let activeEra = 'all';

  function renderPosts(posts) {
    container.innerHTML = posts.length
      ? posts.map(p => `
        <article class="history-article scroll-reveal">
          ${p.image_url ? `<img class="article-img" src="${p.image_url}" alt="${p.title}" loading="lazy">` : ''}
          <div class="article-body">
            ${p.era ? `<p class="article-era">${p.era}</p>` : ''}
            <h2 class="article-title">${p.title}</h2>
            <div class="article-content">${p.content}</div>
            <p class="article-date">${formatDate(p.created_at)}</p>
          </div>
        </article>`).join('')
      : '<p style="color:var(--cream-dim);text-align:center;padding:60px 0">No history posts yet. Check back soon.</p>';
    setTimeout(initScrollReveal, 50);
  }

  function buildEraButtons(posts) {
    if (!eraFilter) return;
    const eras = ['all', ...new Set(posts.map(p => p.era).filter(Boolean))];
    eraFilter.innerHTML = eras.map(e => `
      <button class="era-btn ${e === 'all' ? 'active' : ''}" data-era="${e}">
        ${e === 'all' ? 'All Eras' : e}
      </button>`).join('');
    eraFilter.addEventListener('click', e => {
      const btn = e.target.closest('.era-btn');
      if (!btn) return;
      document.querySelectorAll('.era-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeEra = btn.dataset.era;
      renderPosts(activeEra === 'all' ? allPosts : allPosts.filter(p => p.era === activeEra));
    });
  }

  container.innerHTML = '<div class="card-skeleton" style="height:200px;margin-bottom:20px"></div>'.repeat(3);
  try {
    allPosts = await api.get('/api/history');
    buildEraButtons(allPosts);
    renderPosts(allPosts);
  } catch {
    container.innerHTML = '<p style="color:var(--cream-dim);text-align:center;padding:40px 0">Failed to load history.</p>';
  }
}

// ─── GALLERY PAGE LOGIC ──────────────────────────────────────────────────────
async function initGalleryPage() {
  const grid     = document.getElementById('galleryGrid');
  const filters  = document.getElementById('galleryFilters');
  const lightbox = document.getElementById('lightbox');
  const lbMedia  = document.getElementById('lightboxMedia');
  const lbCap    = document.getElementById('lightboxCaption');
  if (!grid) return;

  let allItems = [], activeFilter = 'all';

  function renderGallery(items) {
    grid.innerHTML = items.length
      ? items.map(item => `
        <div class="gallery-grid-item" data-src="${item.url}" data-type="${item.media_type}" data-cap="${item.caption || ''}">
          ${item.media_type === 'video'
            ? `<video src="${item.url}" muted loop></video><div class="video-badge">▶ Video</div>`
            : `<img src="${item.url}" alt="${item.caption}" loading="lazy">`}
        </div>`).join('')
      : '<p style="color:var(--cream-dim);text-align:center;padding:60px 0;grid-column:1/-1">No items yet.</p>';
  }

  function buildFilters(items) {
    if (!filters) return;
    const cats = ['all', ...new Set(items.map(i => i.category).filter(Boolean))];
    filters.innerHTML = cats.map(c => `
      <button class="filter-btn ${c === 'all' ? 'active' : ''}" data-cat="${c}">
        ${c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
      </button>`).join('');
    filters.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.cat;
      renderGallery(activeFilter === 'all' ? allItems : allItems.filter(i => i.category === activeFilter));
    });
  }

  // Lightbox
  if (grid) {
    grid.addEventListener('click', e => {
      const item = e.target.closest('.gallery-grid-item');
      if (!item || !lightbox) return;
      const src = item.dataset.src, type = item.dataset.type, cap = item.dataset.cap;
      lbMedia.innerHTML = type === 'video'
        ? `<video src="${src}" controls autoplay style="max-width:90vw;max-height:80vh;border-radius:8px"></video>`
        : `<img src="${src}" alt="${cap}" style="max-width:90vw;max-height:80vh;border-radius:8px">`;
      lbCap.textContent = cap;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }
  if (lightbox) {
    lightbox.addEventListener('click', e => {
      if (e.target === lightbox || e.target.closest('.lightbox-close')) {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
        lbMedia.innerHTML = '';
      }
    });
  }

  grid.innerHTML = '<div class="card-skeleton" style="height:200px"></div>'.repeat(6);
  try {
    allItems = await api.get('/api/gallery');
    buildFilters(allItems);
    renderGallery(allItems);
  } catch {
    grid.innerHTML = '<p style="color:var(--cream-dim);text-align:center;padding:40px 0">Failed to load gallery.</p>';
  }
}

// ─── ROUTE INIT ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  if (path.endsWith('index.html') || path === '/' || path.endsWith('/')) initHomePage();
  if (path.includes('history.html')) initHistoryPage();
  if (path.includes('gallery.html')) initGalleryPage();

  // Scroll reveal init
  initScrollReveal();
});

function initScrollReveal() {
  const els = document.querySelectorAll('.scroll-reveal:not(.visible)');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  els.forEach(el => io.observe(el));
}

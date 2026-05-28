'use strict';

// ── Year ──────────────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

// ── Film grain (canvas) ───────────────────────────────────
const grainCanvas = document.getElementById('grain');
const grainCtx    = grainCanvas.getContext('2d');
let grainW = 0, grainH = 0;

function resizeGrain() {
  grainW = grainCanvas.width  = window.innerWidth;
  grainH = grainCanvas.height = window.innerHeight;
}
resizeGrain();
window.addEventListener('resize', resizeGrain, { passive: true });

function drawGrain() {
  const img  = grainCtx.createImageData(grainW, grainH);
  const data = img.data;
  for (let i = 0; i < data.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    data[i] = data[i+1] = data[i+2] = v;
    data[i+3] = 28;
  }
  grainCtx.putImageData(img, 0, 0);
  requestAnimationFrame(drawGrain);
}
drawGrain();

// ── Sticky nav ────────────────────────────────────────────
const topNav = document.querySelector('.top-nav');
const onScroll = () => topNav.classList.toggle('scrolled', window.scrollY > 10);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ── Mobile menu ───────────────────────────────────────────
const menuBtn = document.getElementById('menuBtn');
const mainNav = document.getElementById('mainNav');

menuBtn.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});
mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mainNav.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
}));

// ── Scroll progress ───────────────────────────────────────
const progressFill = document.getElementById('progressFill');
function updateProgress() {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const pct   = total > 0 ? (window.scrollY / total) * 100 : 0;
  progressFill.style.height = pct + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// ── Scene nav dots ────────────────────────────────────────
const scenes = document.querySelectorAll('.scene[data-scene]');
const dots   = document.querySelectorAll('.sn-dot');

const sceneIO = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const idx = entry.target.dataset.scene;
      dots.forEach((d, i) => d.classList.toggle('active', String(i) === idx));
    }
  });
}, { threshold: 0.35 });
scenes.forEach(s => sceneIO.observe(s));

dots.forEach(dot => {
  dot.addEventListener('click', () => {
    const idx = dot.dataset.scene;
    const target = document.querySelector(`.scene[data-scene="${idx}"]`);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ── Animation triggers ────────────────────────────────────
let lastY = window.scrollY, scrollDir = 'down';
window.addEventListener('scroll', () => {
  scrollDir = window.scrollY >= lastY ? 'down' : 'up';
  lastY = window.scrollY;
}, { passive: true });

const animIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
    } else if (scrollDir === 'up') {
      e.target.classList.remove('in');
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

requestAnimationFrame(() => {
  document.querySelectorAll('[class*="anim-"]').forEach(el => animIO.observe(el));
});

// ── Parallax hero grid ────────────────────────────────────
const heroGrid = document.getElementById('heroGrid');
if (heroGrid) {
  window.addEventListener('scroll', () => {
    heroGrid.style.transform = `translateY(${window.scrollY * 0.2}px)`;
  }, { passive: true });
}

// ── Typed animation ───────────────────────────────────────
const phrases = ['DevOps-Team.', 'SRE-Abteilung.', 'Security-Crew.', 'Vendor-Lock.'];
const typedEl = document.getElementById('typed');
if (typedEl) {
  let pi = 0, ci = 0, del = false;
  function tick() {
    const w = phrases[pi];
    if (!del) {
      typedEl.textContent = w.slice(0, ++ci);
      if (ci === w.length) { del = true; setTimeout(tick, 1600); return; }
      setTimeout(tick, 72);
    } else {
      typedEl.textContent = w.slice(0, --ci);
      if (ci === 0) { del = false; pi = (pi + 1) % phrases.length; }
      setTimeout(tick, 36);
    }
  }
  typedEl.textContent = '';
  setTimeout(tick, 900);
}

// ── Counter animations ────────────────────────────────────
const cntIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el  = e.target;
    const tgt = parseInt(el.dataset.target, 10);
    const cnt = el.querySelector('.cnt');
    if (cnt && tgt > 0) {
      const dur = 1400, t0 = performance.now();
      const step = t => {
        const p = Math.min(1, (t - t0) / dur);
        cnt.textContent = Math.round((1 - Math.pow(1 - p, 3)) * tgt);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    cntIO.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.nb[data-target]').forEach(el => cntIO.observe(el));

// ── Smooth scroll ─────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const el = document.querySelector(id);
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ── Contact form ──────────────────────────────────────────
document.getElementById('contactForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const btn  = this.querySelector('.btn-gold');
  const ok   = document.getElementById('formSuccess');
  const orig = btn.innerHTML;
  btn.innerHTML = 'Wird gesendet…';
  btn.disabled  = true;
  try {
    const res = await fetch('/api/contact', { method: 'POST', body: new FormData(this) });
    if (!res.ok) throw new Error(await res.text());
    ok.classList.add('show');
    this.reset();
    setTimeout(() => ok.classList.remove('show'), 4500);
    btn.innerHTML = orig;
    btn.disabled  = false;
  } catch {
    btn.innerHTML = 'Fehler — bitte direkt per E-Mail';
    btn.style.cssText = 'background:#7f1d1d;color:#fca5a5';
    setTimeout(() => { btn.innerHTML = orig; btn.style.cssText = ''; btn.disabled = false; }, 4000);
  }
});

// ── Tweaks panel ──────────────────────────────────────────
const tweaks = document.getElementById('tweaks');
document.getElementById('tweaksToggle').addEventListener('click', () => tweaks.classList.add('open'));
document.getElementById('tweaksClose').addEventListener('click',  () => tweaks.classList.remove('open'));

document.querySelectorAll('#brandPills .pill').forEach(p => {
  p.addEventListener('click', () => {
    document.querySelectorAll('#brandPills .pill').forEach(x => { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); });
    p.classList.add('active');
    p.setAttribute('aria-pressed', 'true');
    const { name, tag, dot } = p.dataset;
    document.querySelectorAll('.wm-name').forEach(el => el.textContent = name);
    document.querySelectorAll('.wm-tag').forEach(el => el.textContent = tag);
    document.querySelectorAll('.wm-dot').forEach(el => el.textContent = dot);
    document.title = `${name}${dot}${tag} — Sichere Infrastruktur ohne eigenes DevOps-Team`;
  });
});

document.querySelectorAll('#palettes .sw').forEach(s => {
  s.addEventListener('click', () => {
    document.querySelectorAll('#palettes .sw').forEach(x => { x.classList.remove('active'); x.setAttribute('aria-pressed', 'false'); });
    s.classList.add('active');
    s.setAttribute('aria-pressed', 'true');
    const [c1, c2] = [s.dataset.c1, s.dataset.c2];
    const r = parseInt(c1.slice(1,3), 16);
    const g = parseInt(c1.slice(3,5), 16);
    const b = parseInt(c1.slice(5,7), 16);
    const root = document.documentElement;
    root.style.setProperty('--gold',  c1);
    root.style.setProperty('--gold2', c2);
    root.style.setProperty('--gd', `rgba(${r},${g},${b},.10)`);
    root.style.setProperty('--gb', `rgba(${r},${g},${b},.18)`);
    root.style.setProperty('--gt', `rgba(${r},${g},${b},.85)`);
  });
});

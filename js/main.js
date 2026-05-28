'use strict';

// ── Year ──────────────────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

// ── Sticky nav ────────────────────────────────────────────────
const nav = document.querySelector('.nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ── Mobile menu ───────────────────────────────────────────────
const menuBtn = document.getElementById('menuBtn');
const navEl   = document.getElementById('nav');
menuBtn.addEventListener('click', () => {
  const open = navEl.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});
navEl.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navEl.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
}));

// ── Scroll direction ──────────────────────────────────────────
let scrollDir = 'down', lastY = window.scrollY;
window.addEventListener('scroll', () => {
  scrollDir = window.scrollY >= lastY ? 'down' : 'up';
  lastY = window.scrollY;
}, { passive: true });

// ── Reveal animations ─────────────────────────────────────────
const revealIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
    } else if (scrollDir === 'up') {
      e.target.classList.remove('in');
    }
  });
}, { threshold: 0.07 });

requestAnimationFrame(() => {
  document.querySelectorAll('.reveal').forEach(el => revealIO.observe(el));
});

// ── Typed hero ────────────────────────────────────────────────
const phrases = ['DevOps-Team.', 'SRE-Abteilung.', 'Security-Crew.', 'Vendor-Lock.'];
const typedEl = document.getElementById('typed');
if (typedEl) {
  let pi = 0, ci = 0, del = false;
  function tick() {
    const w = phrases[pi];
    if (!del) {
      typedEl.textContent = w.slice(0, ++ci);
      if (ci === w.length) { del = true; setTimeout(tick, 1600); return; }
      setTimeout(tick, 70);
    } else {
      typedEl.textContent = w.slice(0, --ci);
      if (ci === 0) { del = false; pi = (pi + 1) % phrases.length; }
      setTimeout(tick, 35);
    }
  }
  typedEl.textContent = '';
  setTimeout(tick, 800);
}

// ── Counter animations ────────────────────────────────────────
const cntIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el  = e.target;
    const tgt = parseInt(el.dataset.target, 10);
    const cnt = el.querySelector('.cnt');
    if (cnt && tgt > 0) {
      const dur = 1200, t0 = performance.now();
      const step = t => {
        const p = Math.min(1, (t - t0) / dur);
        cnt.textContent = Math.round((1 - Math.pow(1 - p, 3)) * tgt);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    cntIO.unobserve(el);
  });
}, { threshold: 0.4 });

// Hero mini-stats
document.querySelectorAll('.hs[data-target]').forEach(s => cntIO.observe(s));
// Numbers band
document.querySelectorAll('.nb-item[data-target]').forEach(s => cntIO.observe(s));

// ── Smooth scroll ─────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const el = document.querySelector(id);
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ── Contact form ──────────────────────────────────────────────
document.getElementById('contactForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const btn  = this.querySelector('.btn-primary');
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

// ── Tweaks ────────────────────────────────────────────────────
const tweaks = document.getElementById('tweaks');
document.getElementById('tweaksToggle').addEventListener('click', () => tweaks.classList.add('open'));
document.getElementById('tweaksClose').addEventListener('click',  () => tweaks.classList.remove('open'));

document.querySelectorAll('#brandPills .pill').forEach(p => {
  p.addEventListener('click', () => {
    document.querySelectorAll('#brandPills .pill').forEach(x => x.classList.remove('active'));
    p.classList.add('active');
    const { name, tag, dot } = p.dataset;
    document.querySelectorAll('.wm-name').forEach(el => el.textContent = name);
    document.querySelectorAll('.wm-tag').forEach(el => el.textContent = tag);
    document.querySelectorAll('.wm-dot').forEach(el => el.textContent = dot);
    document.title = `${name}${dot}${tag} — Sichere Infrastruktur ohne eigenes DevOps-Team`;
  });
});

document.querySelectorAll('#palettes .sw').forEach(s => {
  s.addEventListener('click', () => {
    document.querySelectorAll('#palettes .sw').forEach(x => x.classList.remove('active'));
    s.classList.add('active');
    const [c1, c2] = [s.dataset.c1, s.dataset.c2];
    const r = parseInt(c1.slice(1,3),16), g = parseInt(c1.slice(3,5),16), b = parseInt(c1.slice(5,7),16);
    const root = document.documentElement;
    root.style.setProperty('--gold',   c1);
    root.style.setProperty('--gold-2', c2);
    root.style.setProperty('--gd',  `rgba(${r},${g},${b},.12)`);
    root.style.setProperty('--gb',  `rgba(${r},${g},${b},.2)`);
    root.style.setProperty('--gt',  `rgba(${r},${g},${b},.85)`);
  });
});

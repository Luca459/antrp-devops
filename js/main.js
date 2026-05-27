'use strict';

// ── Year ──────────────────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

// ── Sticky header ─────────────────────────────────────────────
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ── Mobile menu ───────────────────────────────────────────────
const menuBtn = document.getElementById('menuBtn');
const nav     = document.getElementById('nav');
menuBtn.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
}));

// ── Cursor ambient light ──────────────────────────────────────
const cursorLight = document.getElementById('cursorLight');
if (cursorLight) {
  document.addEventListener('mousemove', e => {
    cursorLight.style.left = e.clientX + 'px';
    cursorLight.style.top  = e.clientY + 'px';
  }, { passive: true });
}

// ── Scroll direction tracking ─────────────────────────────────
let scrollDir = 'down', lastY = window.scrollY;
window.addEventListener('scroll', () => {
  scrollDir = window.scrollY >= lastY ? 'down' : 'up';
  lastY = window.scrollY;
}, { passive: true });

// ── Reveal animations (replay on scroll-up) ───────────────────
const revealIO = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
    } else if (scrollDir === 'up') {
      entry.target.classList.remove('in');
    }
  });
}, { threshold: 0.08 });

requestAnimationFrame(() => {
  document.querySelectorAll('.reveal').forEach(el => revealIO.observe(el));
});

// ── Typed hero animation ──────────────────────────────────────
const phrases = ['DevOps-Team.', 'SRE-Abteilung.', 'Security-Crew.', 'Vendor-Lock.'];
const typedEl = document.getElementById('typed');
if (typedEl) {
  let phraseIdx = 0, charIdx = 0, deleting = false;
  function tick() {
    const word = phrases[phraseIdx];
    if (!deleting) {
      charIdx++;
      typedEl.textContent = word.slice(0, charIdx);
      if (charIdx === word.length) { deleting = true; setTimeout(tick, 1600); return; }
      setTimeout(tick, 70);
    } else {
      charIdx--;
      typedEl.textContent = word.slice(0, charIdx);
      if (charIdx === 0) { deleting = false; phraseIdx = (phraseIdx + 1) % phrases.length; }
      setTimeout(tick, 35);
    }
  }
  typedEl.textContent = '';
  setTimeout(tick, 700);
}

// ── Counter animations ────────────────────────────────────────
const cntIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el     = e.target;
    const target = parseInt(el.dataset.target, 10);
    const cnt    = el.querySelector('.cnt');
    if (cnt && target > 0) {
      const dur = 1200, t0 = performance.now();
      const step = t => {
        const p = Math.min(1, (t - t0) / dur);
        cnt.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    cntIO.unobserve(el);
  });
}, { threshold: 0.4 });
document.querySelectorAll('#stats .hstat[data-target]').forEach(s => cntIO.observe(s));

// ── Card mouse spotlight ──────────────────────────────────────
document.querySelectorAll('.scard').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--cx', ((e.clientX - r.left) / r.width  * 100) + '%');
    el.style.setProperty('--cy', ((e.clientY - r.top)  / r.height * 100) + '%');
  });
});

// ── Smooth scroll ─────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ── Contact form → backend POST ───────────────────────────────
document.getElementById('contactForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const btn     = this.querySelector('.btn-gold');
  const success = document.getElementById('formSuccess');
  const orig    = btn.innerHTML;

  btn.innerHTML = 'Wird gesendet…';
  btn.disabled  = true;

  try {
    const res = await fetch('/api/contact', { method: 'POST', body: new FormData(this) });
    if (!res.ok) throw new Error(await res.text());
    success.classList.add('show');
    this.reset();
    setTimeout(() => success.classList.remove('show'), 4500);
    btn.innerHTML = orig;
    btn.disabled  = false;
  } catch {
    btn.innerHTML = 'Fehler – bitte direkt per E-Mail';
    btn.style.background = '#7f1d1d';
    btn.style.color = '#fca5a5';
    setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; btn.style.color = ''; btn.disabled = false; }, 4000);
  }
});

// ── Tweaks panel ──────────────────────────────────────────────
const tweaks = document.getElementById('tweaks');
document.getElementById('tweaksToggle').addEventListener('click', () => tweaks.classList.add('open'));
document.getElementById('tweaksClose').addEventListener('click', () => tweaks.classList.remove('open'));

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
    const c1 = s.dataset.c1, c2 = s.dataset.c2;
    document.documentElement.style.setProperty('--gold',   c1);
    document.documentElement.style.setProperty('--gold-2', c2);
    const r = parseInt(c1.slice(1,3), 16);
    const g = parseInt(c1.slice(3,5), 16);
    const b = parseInt(c1.slice(5,7), 16);
    document.documentElement.style.setProperty('--gold-dim', `rgba(${r},${g},${b},.1)`);
    document.documentElement.style.setProperty('--gold-bd',  `rgba(${r},${g},${b},.22)`);
    document.documentElement.style.setProperty('--gold-t',   `rgba(${r},${g},${b},.9)`);
  });
});

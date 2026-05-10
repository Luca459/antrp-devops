'use strict';

// ── Mobile nav ───────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
document.querySelectorAll('#navLinks a').forEach(a =>
  a.addEventListener('click', () => navLinks.classList.remove('open'))
);

// ── Active nav highlight ──────────────────────────────────────
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navAnchors.forEach(a => a.classList.remove('active'));
    const hit = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
    if (hit) hit.classList.add('active');
  });
}, { threshold: 0.35 });

document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

// ── Scroll direction tracking ─────────────────────────────────
let scrollDir = 'down';
let lastY = window.scrollY;
window.addEventListener('scroll', () => {
  scrollDir = window.scrollY >= lastY ? 'down' : 'up';
  lastY = window.scrollY;
}, { passive: true });

// ── Scroll animations (replay on scroll back up) ──────────────
const animObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    } else if (scrollDir === 'up') {
      // reset so animation replays next time user scrolls down again
      entry.target.classList.remove('visible');
    }
  });
}, { threshold: 0.08 });

requestAnimationFrame(() => {
  document.querySelectorAll('[data-animate]').forEach(el => animObserver.observe(el));
});

// ── Contact form → real backend POST ─────────────────────────
document.getElementById('contactForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const btn  = this.querySelector('.btn-submit');
  const orig = btn.textContent;

  btn.textContent = 'Wird gesendet…';
  btn.disabled = true;

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      body: new FormData(this),
    });
    if (!res.ok) throw new Error(await res.text());

    btn.textContent = 'Nachricht gesendet ✓';
    btn.style.background = 'linear-gradient(135deg,#10b981,#06b6d4)';
    this.reset();
    setTimeout(() => { btn.textContent = orig; btn.style.background = ''; btn.disabled = false; }, 3500);
  } catch {
    btn.textContent = 'Fehler – bitte direkt per E-Mail';
    btn.style.background = 'linear-gradient(135deg,#ef4444,#dc2626)';
    setTimeout(() => { btn.textContent = orig; btn.style.background = ''; btn.disabled = false; }, 4000);
  }
});

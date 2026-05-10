'use strict';

// ── Mobile nav ───────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
document.querySelectorAll('#navLinks a').forEach(a =>
  a.addEventListener('click', () => navLinks.classList.remove('open'))
);

// ── Active nav highlight on scroll ──────────────────────────
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navAnchors.forEach(a => a.classList.remove('active'));
    const hit = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
    if (hit) hit.classList.add('active');
  });
}, { threshold: 0.4 })
  .observe || void 0; // just define — observed below per-section

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navAnchors.forEach(a => a.classList.remove('active'));
    const hit = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
    if (hit) hit.classList.add('active');
  });
}, { threshold: 0.35 });

document.querySelectorAll('section[id]').forEach(s => sectionObserver.observe(s));

// ── Scroll-in animations ─────────────────────────────────────
// rootMargin fires the callback when element is 50px from entering viewport
const animObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    animObserver.unobserve(entry.target);
  });
}, {
  threshold:  0,
  rootMargin: '0px 0px -50px 0px'
});

// Set up after first paint so hero elements get immediate treatment
requestAnimationFrame(() => {
  document.querySelectorAll('[data-animate]').forEach(el => {
    animObserver.observe(el);
  });
});

// ── Contact form ─────────────────────────────────────────────
document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const btn = this.querySelector('.btn-submit');
  const orig = btn.textContent;
  btn.textContent = 'Nachricht gesendet ✓';
  btn.style.background = 'linear-gradient(135deg,#10b981,#06b6d4)';
  setTimeout(() => { btn.textContent = orig; btn.style.background = ''; this.reset(); }, 3000);
});

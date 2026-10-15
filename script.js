(() => {
  'use strict';
  const WA_NUMBER = '23481786364435'; // 234 + phone number without the leading 0
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  document.documentElement.classList.add('js');
  if (window.lucide) window.lucide.createIcons();
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  // Mobile menu
  const toggle = $('#menu-toggle');
  const menu = $('#mobile-menu');
  function setMenu(open) {
    if (!toggle || !menu) return;
    menu.classList.toggle('hidden', !open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (toggle && menu) {
    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    $$('.mobile-link').forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { setMenu(false); toggle.focus(); } });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', e => { if (e.matches) setMenu(false); });
  }

  // FAQ accordion
  const buttons = $$('.faq-btn');
  function setFaq(btn, open) {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.setAttribute('aria-expanded', String(open));
    if (panel) panel.hidden = !open;
    const icon = btn.querySelector('svg, i');
    if (icon) icon.style.transform = open ? 'rotate(45deg)' : '';
  }
  buttons.forEach(btn => {
    setFaq(btn, false);
    btn.addEventListener('click', () => setFaq(btn, btn.getAttribute('aria-expanded') !== 'true'));
    btn.addEventListener('keydown', e => {
      const i = buttons.indexOf(btn);
      const target = { ArrowDown: buttons[(i + 1) % buttons.length], ArrowUp: buttons[(i - 1 + buttons.length) % buttons.length], Home: buttons[0], End: buttons[buttons.length - 1] }[e.key];
      if (target) { e.preventDefault(); target.focus(); }
    });
  });

  // Scroll reveal
  const reveals = $$('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
    }), { threshold: 0.12 });
    reveals.forEach(el => io.observe(el));
  } else reveals.forEach(el => el.classList.add('is-visible'));

  // Image fallback: keep the layout tidy if an image fails
  $$('img').forEach(img => img.addEventListener('error', () => { img.style.visibility = 'hidden'; }));

  // Service links preselect the form
  const serviceSelect = $('#f-service');
  $$('.service-link').forEach(a => a.addEventListener('click', () => {
    if (serviceSelect) serviceSelect.value = a.dataset.service || '';
  }));

  // Contact form -> validated WhatsApp message (no backend)
  const form = $('#contact-form');
  const status = $('#form-status');
  const rules = {
    name: v => v.trim().length >= 2 || 'Enter your full name.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Enter a valid email address.',
    service: v => v !== '' || 'Choose the service you need.',
    details: v => v.trim().length >= 10 || 'Describe your project in at least 10 characters.'
  };
  function showError(field, msg) {
    const input = form.elements[field];
    const out = document.getElementById('e-' + field);
    out.textContent = msg || '';
    out.classList.toggle('hidden', !msg);
    input.setAttribute('aria-invalid', String(Boolean(msg)));
    input.classList.toggle('border-red-700', Boolean(msg));
  }
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      let firstBad = null;
      Object.keys(rules).forEach(field => {
        const res = rules[field](form.elements[field].value);
        showError(field, res === true ? '' : res);
        if (res !== true && !firstBad) firstBad = form.elements[field];
      });
      if (firstBad) {
        status.className = 'mt-4 text-sm text-red-700';
        status.textContent = 'Please fix the highlighted fields.';
        firstBad.focus();
        return;
      }
      const f = form.elements;
      const text = `Hello NexyTech, I would like to discuss a project.\nName: ${f.name.value.trim()}\nEmail: ${f.email.value.trim()}\nService: ${f.service.value}\nDetails: ${f.details.value.trim()}`;
      const win = window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
      status.className = 'mt-4 text-sm text-deep';
      status.textContent = win
        ? 'WhatsApp opened with your message. Press send there to deliver it.'
        : 'Your browser blocked the WhatsApp window. Allow pop-ups, or email contact@nexytech.com instead.';
    });
    form.addEventListener('input', e => { if (rules[e.target.name]) showError(e.target.name, ''); });
  }
})();

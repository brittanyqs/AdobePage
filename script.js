/* =====================================================
   Creative Cloud para Educación - Lógica de la página
   ===================================================== */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. Año del footer ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- 2. Navbar: estilo al hacer scroll + botón "arriba" ---------- */
  const navbar = document.getElementById('navbar');
  const toTop = document.getElementById('toTop');

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    toTop.classList.toggle('show', window.scrollY > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- 3. Menú hamburguesa (móvil) ---------- */
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('menu');

  function toggleMenu(open) {
    menu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
    hamburger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  hamburger.addEventListener('click', () => toggleMenu(!menu.classList.contains('open')));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') toggleMenu(false); });

  /* ---------- 4. Resaltar enlace activo según la sección visible ---------- */
  const links = [...menu.querySelectorAll('a[href^="#"]:not(.btn)')];
  const sections = links.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  /* ---------- 5. Animaciones al hacer scroll (IntersectionObserver) ---------- */
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('visible');
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ---------- 6. Contadores animados ---------- */
  function animateCount(el) {
    const target = +el.dataset.target;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();

    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);                // ease-out
      el.textContent = prefix + Math.round(target * eased).toLocaleString('es-MX') + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  const countObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (en.isIntersecting) { animateCount(en.target); obs.unobserve(en.target); }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.count').forEach(c => countObserver.observe(c));

  /* ---------- 7. Carrusel (autoplay, flechas, puntos y swipe) ---------- */
  const carousel = document.getElementById('carousel');
  const track = document.getElementById('track');
  const slides = track.children;
  const dotsBox = document.getElementById('dots');
  let index = 0, timer = null;

  // Crear indicadores
  [...slides].forEach((_, i) => {
    const b = document.createElement('button');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', 'Ir a la diapositiva ' + (i + 1));
    b.addEventListener('click', () => { goTo(i); restart(); });
    dotsBox.appendChild(b);
  });

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    [...dotsBox.children].forEach((d, n) => {
      d.classList.toggle('active', n === index);
      d.setAttribute('aria-selected', n === index);
    });
  }
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);
  function start() { timer = setInterval(next, 16000); }
  function stop() { clearInterval(timer); }
  function restart() { stop(); start(); }

  document.getElementById('next').addEventListener('click', () => { next(); restart(); });
  document.getElementById('prev').addEventListener('click', () => { prev(); restart(); });
  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);
  carousel.addEventListener('focusin', stop);
  carousel.addEventListener('focusout', start);

  // Deslizamiento táctil / arrastre con mouse
  let startX = 0, dragging = false;
  const down = x => { startX = x; dragging = true; stop(); };
  const up = x => {
    if (!dragging) return;
    dragging = false;
    const dx = x - startX;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
    start();
  };
  carousel.addEventListener('touchstart', e => down(e.touches[0].clientX), { passive: true });
  carousel.addEventListener('touchend', e => up(e.changedTouches[0].clientX));
  carousel.addEventListener('mousedown', e => down(e.clientX));
  window.addEventListener('mouseup', e => up(e.clientX));
  carousel.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { next(); restart(); }
    if (e.key === 'ArrowLeft') { prev(); restart(); }
  });

  goTo(0);
  start();

  /* ---------- 8. Pestañas (tabs) ---------- */
  const tabs = [...document.querySelectorAll('.tab')];
  function activateTab(tab) {
    tabs.forEach(t => {
      const on = t === tab;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.classList.toggle('active', on);
      panel.hidden = !on;
    });
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activateTab(tab));
    // Navegación con flechas del teclado
    tab.addEventListener('keydown', e => {
      let n = null;
      if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (n) { activateTab(n); n.focus(); }
    });
  });

  /* ---------- 9. Acordeón (FAQ) ---------- */
  const items = document.querySelectorAll('.acc-item');
  items.forEach(item => {
    const btn = item.querySelector('.acc-btn');
    const panel = item.querySelector('.acc-panel');
    btn.addEventListener('click', () => {
      const open = item.classList.contains('open');
      // Cierra los demás (solo uno abierto a la vez)
      items.forEach(o => {
        o.classList.remove('open');
        o.querySelector('.acc-btn').setAttribute('aria-expanded', 'false');
        o.querySelector('.acc-panel').style.maxHeight = null;
      });
      if (!open) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  /* ---------- 10. Formulario con validación ---------- */
  const form = document.getElementById('contactForm');
  const success = document.getElementById('success');
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const rules = {
    nombre: v => !v ? 'Por favor escribe tu nombre.' : v.length < 2 ? 'El nombre es demasiado corto.' : '',
    correo: v => !v ? 'Por favor escribe tu correo.' : !emailRx.test(v) ? 'Ingresa un correo válido (ej. nombre@escuela.edu).' : '',
    institucion: v => !v ? 'Por favor indica tu institución.' : ''
  };

  function validateField(id) {
    const input = document.getElementById(id);
    const msg = rules[id](input.value.trim());
    document.getElementById('err-' + id).textContent = msg;
    input.closest('.field').classList.toggle('invalid', !!msg);
    input.setAttribute('aria-invalid', !!msg);
    return !msg;
  }

  // Validación en vivo al salir del campo y al escribir (si ya tenía error)
  Object.keys(rules).forEach(id => {
    const input = document.getElementById(id);
    input.addEventListener('blur', () => validateField(id));
    input.addEventListener('input', () => {
      if (input.closest('.field').classList.contains('invalid')) validateField(id);
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();                                   // evita recargar la página
    const results = Object.keys(rules).map(validateField);
    if (results.includes(false)) {
      // Lleva el foco al primer campo con error
      form.querySelector('.invalid input').focus();
      return;
    }
    // Aquí iría el envío real (fetch a tu backend). Se simula éxito.
    document.getElementById('successName').textContent = document.getElementById('nombre').value.trim().split(' ')[0];
    form.hidden = true;
    success.hidden = false;
  });

  document.getElementById('again').addEventListener('click', () => {
    form.reset();
    form.querySelectorAll('.field').forEach(f => f.classList.remove('invalid'));
    form.querySelectorAll('.error').forEach(er => er.textContent = '');
    success.hidden = true;
    form.hidden = false;
  });

  /* ---------- 11. Respaldo si una imagen no carga ---------- */
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      img.style.background = 'linear-gradient(135deg,#FA0F00,#9999FF)';
      img.style.minHeight = '200px';
    }, { once: true });
  });
});
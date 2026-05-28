// ---------- Cursor follower ----------
const cursorDot = document.getElementById('cursorDot');
let mouseX = 0, mouseY = 0;
let dotX = 0, dotY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (cursorDot) cursorDot.style.opacity = '1';
});

function animateCursor() {
  dotX += (mouseX - dotX) * 0.18;
  dotY += (mouseY - dotY) * 0.18;
  if (cursorDot) {
    cursorDot.style.left = dotX + 'px';
    cursorDot.style.top = dotY + 'px';
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Cursor hover state on interactive elements
const hoverables = document.querySelectorAll('a, button, summary, .service-card, .case, .member');
hoverables.forEach(el => {
  el.addEventListener('mouseenter', () => cursorDot?.classList.add('active'));
  el.addEventListener('mouseleave', () => cursorDot?.classList.remove('active'));
});

// ---------- Reveal on scroll ----------
const revealEls = document.querySelectorAll(
  '.section-label, .section-title, .service-card, .step, .case, .member, .faq-item, .manifesto-text, .quote, .contact-title, .contact-sub, .contact-form'
);
revealEls.forEach(el => el.classList.add('reveal'));

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

revealEls.forEach(el => io.observe(el));

// ---------- Form handler ----------
async function handleSubmit(event) {
  event.preventDefault();
  const note = document.getElementById('formNote');
  const form = event.target;
  const button = form.querySelector('button[type="submit"]');
  const data = Object.fromEntries(new FormData(form).entries());

  note.style.color = '';
  note.textContent = 'Enviando…';
  if (button) button.disabled = true;

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Respuesta no válida');

    note.textContent = '✓ Mensaje recibido. Te respondemos en menos de 48h.';
    note.style.color = '#4ADE80';
    form.reset();

    setTimeout(() => {
      note.textContent = '';
      note.style.color = '';
    }, 6000);
  } catch (err) {
    note.textContent = 'No se pudo enviar. Escríbenos a comunicaciones@graf-studio.es';
    note.style.color = '#F87171';
  } finally {
    if (button) button.disabled = false;
  }
}

// ---------- Subtle parallax on hero visual ----------
const orbit = document.querySelector('.orbit');
if (orbit) {
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    orbit.style.transform = `translate(${x}px, ${y}px)`;
  });
}

// ---------- Nav background shift on scroll ----------
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    nav.style.background = 'rgba(245, 241, 234, 0.92)';
    nav.style.boxShadow = '0 1px 0 rgba(15,15,15,0.06)';
  } else {
    nav.style.background = 'rgba(245, 241, 234, 0.72)';
    nav.style.boxShadow = 'none';
  }
});

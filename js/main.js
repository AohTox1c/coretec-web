/* ============================================================
   CORETECH - Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const formNext = document.querySelector('input[name="_next"]');
  if (formNext) {
    formNext.value = `${window.location.origin}/gracias.html`;
  }

  /* ── Contact form submission ── */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const submitButton = contactForm.querySelector('.form-submit');
    const formStatus = document.getElementById('formStatus');
    const defaultButtonContent = submitButton?.innerHTML || 'Enviar solicitud';
    let isSubmitting = false;

    const setSubmitting = (submitting) => {
      isSubmitting = submitting;
      if (!submitButton) return;

      submitButton.disabled = submitting;
      submitButton.classList.toggle('loading', submitting);
      submitButton.setAttribute('aria-disabled', String(submitting));
      submitButton.innerHTML = submitting
        ? '<span class="form-spinner" aria-hidden="true"></span> Enviando...'
        : defaultButtonContent;
    };

    const showFormError = (message) => {
      if (!formStatus) return;
      formStatus.textContent = message;
      formStatus.hidden = false;
      formStatus.classList.add('visible');
      formStatus.focus();
    };

    const clearFormError = () => {
      if (!formStatus) return;
      formStatus.textContent = '';
      formStatus.hidden = true;
      formStatus.classList.remove('visible');
    };

    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (isSubmitting) return;
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      clearFormError();
      setSubmitting(true);

      try {
        const formData = new FormData(contactForm);
        const payload = Object.fromEntries(formData.entries());
        const endpoint = contactForm.action.replace(
          'https://formsubmit.co/',
          'https://formsubmit.co/ajax/',
        );

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        const result = await response.json().catch(() => null);
        const rejected = result?.success === false || result?.success === 'false';

        if (!response.ok || rejected) {
          throw new Error('FormSubmit rejected the request');
        }

        contactForm.reset();
        if (submitButton) {
          submitButton.classList.remove('loading');
          submitButton.innerHTML = '<i class="bi bi-check-lg"></i> Solicitud enviada';
        }

        window.location.assign(
          formNext?.value || `${window.location.origin}/gracias.html`,
        );
      } catch (error) {
        setSubmitting(false);
        showFormError(
          'No pudimos enviar la solicitud. Revisa tu conexión e inténtalo nuevamente. Tus datos siguen en el formulario.',
        );
      }
    });

    window.addEventListener('pageshow', () => {
      setSubmitting(false);
      clearFormError();
    });
  }

  /* ── Hamburger / Mobile Menu ── */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (hamburger && mobileMenu) {
    const setMenuOpen = (open) => {
      hamburger.classList.toggle('open', open);
      mobileMenu.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      hamburger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    };

    hamburger.addEventListener('click', () => {
      setMenuOpen(!mobileMenu.classList.contains('open'));
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setMenuOpen(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && mobileMenu.classList.contains('open')) {
        setMenuOpen(false);
        hamburger.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) setMenuOpen(false);
    });
  }

  /* ── Navbar scroll effect ── */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  /* ── Active nav link ── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ── Scroll Animate (Intersection Observer) ── */
  const animTargets = document.querySelectorAll('[data-animate]');
  if (animTargets.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, (entry.target.dataset.delay || 0) * 100);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    animTargets.forEach(el => observer.observe(el));
  }

  /* ── Counter Animation ── */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start = performance.now();
    const suffix = el.dataset.suffix || '';

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => counterObserver.observe(el));
  }

  /* ── Gallery Lightbox ── */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.querySelector('.lightbox-close');
  let lastLightboxTrigger = null;

  if (lightbox) {
    function openLightbox(item) {
      const src = item?.dataset.src;
      if (!src) return;

      lastLightboxTrigger = item;
      const itemImg = item.querySelector('img');
      lightboxImg.src = src;
      lightboxImg.alt = itemImg?.alt || item.title || 'Imagen ampliada';
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lightboxClose?.focus();
    }

    document.querySelectorAll('.gallery-item[data-src]').forEach(item => {
      item.addEventListener('click', () => openLightbox(item));
      item.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openLightbox(item);
        }
      });
    });

    function closeLightbox() {
      if (!lightbox.classList.contains('active')) return;
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      lightboxImg.src = '';
      lightboxImg.alt = 'Imagen ampliada';
      lastLightboxTrigger?.focus();
    }

    lightboxClose?.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });

    const selectedId = decodeURIComponent(window.location.hash.slice(1));
    const selectedItem = selectedId ? document.getElementById(selectedId) : null;
    if (selectedItem?.matches('.gallery-item[data-src]')) {
      selectedItem.scrollIntoView({ block: 'center' });
      window.setTimeout(() => openLightbox(selectedItem), 250);
    }
  }

  /* ── Gallery / Product Filters ── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');

        const filter = btn.dataset.filter;
        const items = document.querySelectorAll('[data-category]');
        items.forEach(item => {
          if (filter === 'all' || item.dataset.category === filter) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  /* ── Smooth reveal on hero ── */
  document.querySelectorAll('.hero-content > *, .hero-badge, .hero-title, .hero-desc, .hero-actions, .hero-stats').forEach((el, i) => {
    el.style.animationDelay = `${i * 0.12}s`;
    el.classList.add('animate-in');
  });

});

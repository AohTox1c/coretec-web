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
    const requestTopic = new URLSearchParams(window.location.search).get('tema');
    const serviceSelect = contactForm.querySelector('#servicio');
    const messageField = contactForm.querySelector('#mensaje');
    const subjectField = contactForm.querySelector('input[name="_subject"]');
    const defaultButtonContent = submitButton?.innerHTML || 'Enviar solicitud';
    let isSubmitting = false;

    if (requestTopic === 'certificaciones') {
      if (serviceSelect) serviceSelect.value = 'Antecedentes y certificaciones';
      if (subjectField) {
        subjectField.value = 'Solicitud de antecedentes y certificaciones - CORE-TEC';
      }
      if (messageField && !messageField.value) {
        messageField.placeholder = 'Indica el servicio o proyecto, la empresa solicitante y los antecedentes o certificaciones que necesitas.';
      }
    }

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

  /* ── Autoplay video lifecycle ── */
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const saveDataEnabled = Boolean(navigator.connection?.saveData);
  const autoVideos = Array.from(document.querySelectorAll('video[data-auto-video]'));
  const autoVideoState = new WeakMap();

  function getVideoToggle(video) {
    if (video.matches('[data-hero-video]')) return document.getElementById('sliderToggle');
    return video.closest('.video-card')?.querySelector('[data-video-toggle]') || null;
  }

  function updateVideoToggle(video) {
    const toggle = getVideoToggle(video);
    if (!toggle) return;

    const isPaused = video.paused;
    toggle.setAttribute('aria-label', isPaused ? 'Reproducir video' : 'Pausar video');
    toggle.setAttribute('aria-pressed', String(isPaused));
    const icon = toggle.querySelector('i');
    if (icon) icon.className = isPaused ? 'bi bi-play-fill' : 'bi bi-pause-fill';
  }

  function syncAutoVideo(video) {
    const state = autoVideoState.get(video);
    if (!state) return;

    const modalOpen = document.getElementById('videoLightbox')?.classList.contains('active');
    const mayAutoplay = !reducedMotion.matches && !saveDataEnabled;
    const shouldPlay = mayAutoplay && state.visible && !state.userPaused && !document.hidden && !modalOpen;

    if (shouldPlay) {
      video.play().then(() => updateVideoToggle(video)).catch(() => updateVideoToggle(video));
    } else {
      video.pause();
      updateVideoToggle(video);
    }
  }

  if (autoVideos.length) {
    const autoVideoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const state = autoVideoState.get(entry.target);
        if (!state) return;
        state.visible = entry.isIntersecting;
        syncAutoVideo(entry.target);
      });
    }, { threshold: 0.38 });

    autoVideos.forEach(video => {
      autoVideoState.set(video, { visible: false, userPaused: false });
      if (reducedMotion.matches || saveDataEnabled) {
        video.removeAttribute('autoplay');
        video.pause();
      }

      const toggle = getVideoToggle(video);
      toggle?.addEventListener('click', () => {
        const state = autoVideoState.get(video);
        if (!state) return;

        if (video.paused) {
          state.userPaused = false;
          video.play().then(() => updateVideoToggle(video)).catch(() => updateVideoToggle(video));
        } else {
          state.userPaused = true;
          video.pause();
          updateVideoToggle(video);
        }
      });

      video.addEventListener('play', () => updateVideoToggle(video));
      video.addEventListener('pause', () => updateVideoToggle(video));
      autoVideoObserver.observe(video);
      updateVideoToggle(video);
    });

    document.addEventListener('visibilitychange', () => {
      autoVideos.forEach(syncAutoVideo);
    });

    reducedMotion.addEventListener?.('change', () => {
      autoVideos.forEach(syncAutoVideo);
    });
  }

  /* ── Portfolio video viewer ── */
  const videoLightbox = document.getElementById('videoLightbox');
  const videoLightboxPlayer = document.getElementById('videoLightboxPlayer');
  const videoLightboxTitle = document.getElementById('videoLightboxTitle');
  const videoLightboxClose = document.querySelector('.video-lightbox-close');
  const videoOpenButtons = Array.from(document.querySelectorAll('[data-video-open]'));
  let lastVideoTrigger = null;

  if (videoLightbox && videoLightboxPlayer && videoOpenButtons.length) {
    function openVideoLightbox(trigger) {
      const src = trigger.dataset.videoSrc;
      if (!src) return;

      lastVideoTrigger = trigger;
      autoVideos.forEach(video => video.pause());
      videoLightboxPlayer.src = src;
      videoLightboxTitle.textContent = trigger.dataset.videoTitle || 'Operación en terreno';
      videoLightbox.classList.add('active');
      videoLightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      videoLightboxPlayer.load();
      videoLightboxPlayer.play().catch(() => {});
      videoLightboxClose?.focus();
    }

    function closeVideoLightbox() {
      if (!videoLightbox.classList.contains('active')) return;

      videoLightboxPlayer.pause();
      videoLightboxPlayer.removeAttribute('src');
      videoLightboxPlayer.load();
      videoLightbox.classList.remove('active');
      videoLightbox.setAttribute('aria-hidden', 'true');
      videoLightboxTitle.textContent = '';
      document.body.style.overflow = '';
      autoVideos.forEach(syncAutoVideo);
      lastVideoTrigger?.focus();
    }

    videoOpenButtons.forEach(button => {
      button.addEventListener('click', () => openVideoLightbox(button));
    });
    videoLightboxClose?.addEventListener('click', closeVideoLightbox);
    videoLightbox.addEventListener('click', event => {
      if (event.target === videoLightbox) closeVideoLightbox();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && videoLightbox.classList.contains('active')) {
        closeVideoLightbox();
      }
    });
  }

  /* ── Gallery Lightbox ── */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxPrev = document.querySelector('.lightbox-prev');
  const lightboxNext = document.querySelector('.lightbox-next');
  const lightboxMedia = document.querySelector('.lightbox-media');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item[data-src]'));
  let lastLightboxTrigger = null;
  let currentLightboxIndex = 0;
  let lightboxTransitionTimer = null;
  let swipeStartX = null;
  let swipeStartY = null;
  let swipePointerId = null;

  if (lightbox && lightboxImg && galleryItems.length) {
    function normalizeLightboxIndex(index) {
      return (index + galleryItems.length) % galleryItems.length;
    }

    function preloadLightboxNeighbors() {
      [-1, 1].forEach(offset => {
        const item = galleryItems[normalizeLightboxIndex(currentLightboxIndex + offset)];
        const src = item?.dataset.src;
        if (src) {
          const preload = new Image();
          preload.src = src;
        }
      });
    }

    function renderLightboxItem(index, animate = true) {
      currentLightboxIndex = normalizeLightboxIndex(index);
      const item = galleryItems[currentLightboxIndex];
      const src = item.dataset.src;
      const itemImg = item.querySelector('img');
      const title = item.dataset.title || itemImg?.alt || 'Imagen ampliada';

      const applyImage = () => {
        lightboxImg.src = src;
        lightboxImg.alt = itemImg?.alt || title;
        lightboxTitle.textContent = title;
        lightboxCounter.textContent = `${currentLightboxIndex + 1} de ${galleryItems.length}`;
        preloadLightboxNeighbors();

        if (lightboxImg.complete) {
          requestAnimationFrame(() => lightboxImg.classList.remove('is-changing'));
        }
      };

      window.clearTimeout(lightboxTransitionTimer);
      if (animate && lightbox.classList.contains('active')) {
        lightboxImg.classList.add('is-changing');
        lightboxTransitionTimer = window.setTimeout(applyImage, 110);
      } else {
        lightboxImg.classList.remove('is-changing');
        applyImage();
      }
    }

    function navigateLightbox(offset) {
      if (!lightbox.classList.contains('active')) return;
      renderLightboxItem(currentLightboxIndex + offset);
    }

    function openLightbox(item) {
      const index = galleryItems.indexOf(item);
      if (index < 0) return;

      lastLightboxTrigger = item;
      renderLightboxItem(index, false);
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lightboxClose?.focus();
    }

    galleryItems.forEach(item => {
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
      window.clearTimeout(lightboxTransitionTimer);
      lightboxImg.src = '';
      lightboxImg.alt = 'Imagen ampliada';
      lightboxImg.classList.remove('is-changing');
      lightboxTitle.textContent = '';
      lightboxCounter.textContent = '';
      lastLightboxTrigger?.focus();
    }

    lightboxImg.addEventListener('load', () => {
      requestAnimationFrame(() => lightboxImg.classList.remove('is-changing'));
    });
    lightboxImg.addEventListener('error', () => lightboxImg.classList.remove('is-changing'));
    lightboxClose?.addEventListener('click', closeLightbox);
    lightboxPrev?.addEventListener('click', () => navigateLightbox(-1));
    lightboxNext?.addEventListener('click', () => navigateLightbox(1));
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    lightboxMedia?.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      swipeStartX = event.clientX;
      swipeStartY = event.clientY;
      swipePointerId = event.pointerId;
      lightboxMedia.setPointerCapture?.(event.pointerId);
    });

    lightboxMedia?.addEventListener('pointerup', event => {
      if (swipePointerId !== event.pointerId || swipeStartX === null || swipeStartY === null) return;

      const deltaX = event.clientX - swipeStartX;
      const deltaY = event.clientY - swipeStartY;
      swipeStartX = null;
      swipeStartY = null;
      swipePointerId = null;

      if (Math.abs(deltaX) >= 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        navigateLightbox(deltaX < 0 ? 1 : -1);
      }
    });

    lightboxMedia?.addEventListener('pointercancel', () => {
      swipeStartX = null;
      swipeStartY = null;
      swipePointerId = null;
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;

      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateLightbox(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateLightbox(1);
      }
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

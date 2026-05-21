/* ============================================================
   CORETECH - Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Hamburger / Mobile Menu ── */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
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

  if (lightbox) {
    document.querySelectorAll('.gallery-item[data-src]').forEach(item => {
      item.addEventListener('click', () => {
        const src = item.dataset.src;
        if (src) {
          lightboxImg.src = src;
          lightbox.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      lightboxImg.src = '';
    }

    lightboxClose?.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  /* ── Gallery / Product Filters ── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

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

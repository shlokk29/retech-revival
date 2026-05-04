/* ══════════════════════════════════════════════════════════════
   ReTech Revival — 3D Animation Engine
   Interactive tilt, scroll reveal, particles, cursor tracking
   ══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Scroll-Reveal Observer ──────────────────────────────────
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Unobserve to avoid re-triggering
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  function initScrollReveal() {
    const selectors = [
      '.reveal', '.reveal-left', '.reveal-right', '.reveal-scale'
    ];
    selectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        revealObserver.observe(el);
      });
    });
  }

  // ── Auto-tag elements for scroll reveal ─────────────────────
  function autoTagRevealElements() {
    // Cards
    document.querySelectorAll('.card, .prod-card, .step, .testimonial, .team-card, .stat-card, .feature-item, .value-item').forEach((el, i) => {
      if (!el.classList.contains('reveal') &&
          !el.classList.contains('reveal-left') &&
          !el.classList.contains('reveal-right') &&
          !el.classList.contains('reveal-scale')) {
        el.classList.add('reveal');
        el.setAttribute('data-delay', String((i % 6) + 1));
      }
    });

    // Section titles
    document.querySelectorAll('.section-title, .section-sub').forEach((el) => {
      if (!el.classList.contains('reveal')) {
        el.classList.add('reveal');
      }
    });

    // CTA banners
    document.querySelectorAll('.cta-banner').forEach((el) => {
      if (!el.classList.contains('reveal-scale')) {
        el.classList.add('reveal-scale');
        el.classList.add('cta-3d');
      }
    });
  }

  // ── 3D Tilt Effect ─────────────────────────────────────────
  function initTiltEffect() {
    const tiltElements = document.querySelectorAll('.tilt-3d');

    tiltElements.forEach((el) => {
      // Add glare layer if not present
      if (!el.querySelector('.tilt-glare')) {
        const glare = document.createElement('div');
        glare.className = 'tilt-glare';
        el.style.position = 'relative';
        el.appendChild(glare);
      }

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;

        el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;

        // Update glare position
        const glare = el.querySelector('.tilt-glare');
        if (glare) {
          const glareX = (x / rect.width) * 100;
          const glareY = (y / rect.height) * 100;
          glare.style.setProperty('--glare-x', glareX + '%');
          glare.style.setProperty('--glare-y', glareY + '%');
        }
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
    });
  }

  // ── Auto-apply tilt to cards ────────────────────────────────
  function autoApplyTilt() {
    document.querySelectorAll('.card, .prod-card, .device-card, .step, .team-card, .testimonial').forEach((el) => {
      if (!el.classList.contains('tilt-3d')) {
        el.classList.add('tilt-3d');
      }
    });
  }

  // ── Card Mouse Glow Tracking ────────────────────────────────
  function initCardGlow() {
    document.querySelectorAll('.card, .prod-card, .step, .team-card').forEach((el) => {
      if (!el.classList.contains('card-glow-hover')) {
        el.classList.add('card-glow-hover');
      }

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        el.style.setProperty('--mouse-x', x + '%');
        el.style.setProperty('--mouse-y', y + '%');
      });
    });
  }

  // ── Cursor Glow Trail ──────────────────────────────────────
  function initCursorGlow() {
    // Skip on mobile
    if (window.matchMedia('(max-width: 768px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateGlow() {
      glowX += (mouseX - glowX) * 0.08;
      glowY += (mouseY - glowY) * 0.08;
      glow.style.left = glowX + 'px';
      glow.style.top = glowY + 'px';
      requestAnimationFrame(animateGlow);
    }
    animateGlow();
  }

  // ── Floating Particle System ────────────────────────────────
  function initParticles() {
    // Skip on mobile or reduced motion
    if (window.matchMedia('(max-width: 768px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');

    let w, h;
    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const PARTICLE_COUNT = 35;
    const isDark = () => document.documentElement.dataset.theme === 'dark';

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.02 + 0.005;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.pulse += this.pulseSpeed;

        if (this.x < -10 || this.x > w + 10 ||
            this.y < -10 || this.y > h + 10) {
          this.reset();
        }
      }
      draw() {
        const currentOpacity = this.opacity * (0.5 + 0.5 * Math.sin(this.pulse));
        const color = isDark()
          ? `rgba(52, 211, 153, ${currentOpacity})`
          : `rgba(15, 40, 71, ${currentOpacity * 0.6})`;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    // Draw connection lines between nearby particles
    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            const opacity = (1 - dist / 150) * 0.12;
            const color = isDark()
              ? `rgba(52, 211, 153, ${opacity})`
              : `rgba(15, 40, 71, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = color;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      drawConnections();
      requestAnimationFrame(animate);
    }
    animate();
  }

  // ── Magnetic Button Effect ──────────────────────────────────
  function initMagneticButtons() {
    if (window.matchMedia('(max-width: 768px)').matches) return;

    document.querySelectorAll('.btn-violet, .btn-primary, .btn-cyan, .btn-green').forEach((btn) => {
      btn.classList.add('btn-magnetic');

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.05)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // ── Ripple Effect on Button Click ───────────────────────────
  function initRippleEffect() {
    document.querySelectorAll('.btn, .filter-chip, .prod-btn').forEach((el) => {
      el.classList.add('ripple-effect');

      el.addEventListener('click', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const size = Math.max(rect.width, rect.height) * 2;

        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.cssText = `
          width: ${size}px; height: ${size}px;
          left: ${x - size / 2}px; top: ${y - size / 2}px;
        `;
        el.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
      });
    });
  }

  // ── Animated Counter (for stat numbers) ─────────────────────
  function initCounters() {
    const counters = document.querySelectorAll('.hero-stat span, .stat-card .num, .cb-stat strong');

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((counter) => {
      counter.classList.add('counter-3d');
      counterObserver.observe(counter);
    });
  }

  function animateCounter(el) {
    const text = el.textContent;
    const match = text.match(/^([\d,]+)/);
    if (!match) return;

    const target = parseInt(match[1].replace(/,/g, ''));
    if (isNaN(target) || target === 0) return;

    const suffix = text.slice(match[0].length);
    const duration = 1500;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.round(target * eased);

      el.textContent = current.toLocaleString('en-IN') + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // ── Enhanced Navbar Scroll ──────────────────────────────────
  function initEnhancedNavbar() {
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;

      if (currentScroll > 100) {
        navbar.style.transform = currentScroll > lastScroll
          ? 'translateY(-100%)'
          : 'translateY(0)';
      } else {
        navbar.style.transform = 'translateY(0)';
      }

      lastScroll = currentScroll;
    }, { passive: true });
  }

  // ── Hero Parallax Layers ────────────────────────────────────
  function initHeroParallax() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const deviceCard = hero.querySelector('.device-card');
    const heroContent = hero.querySelector('.hero-content');

    if (!deviceCard && !heroContent) return;

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      if (deviceCard) {
        deviceCard.style.transform = `
          perspective(1000px)
          rotateY(${x * 12}deg)
          rotateX(${-y * 8}deg)
          translateZ(20px)
        `;
      }

      if (heroContent) {
        heroContent.style.transform = `translate(${x * -15}px, ${y * -10}px)`;
      }
    });

    hero.addEventListener('mouseleave', () => {
      if (deviceCard) {
        deviceCard.style.transform = '';
        deviceCard.style.transition = 'transform 0.6s ease';
        setTimeout(() => deviceCard.style.transition = '', 600);
      }
      if (heroContent) {
        heroContent.style.transform = '';
        heroContent.style.transition = 'transform 0.6s ease';
        setTimeout(() => heroContent.style.transition = '', 600);
      }
    });
  }

  // ── Smooth Page Load ────────────────────────────────────────
  function initPageLoad() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    window.addEventListener('load', () => {
      requestAnimationFrame(() => {
        document.body.style.opacity = '1';
      });
    });
  }

  // ── Add 3D classes to step & feature elements ───────────────
  function enhance3DElements() {
    document.querySelectorAll('.step').forEach((el) => {
      el.classList.add('step-3d');
    });

    document.querySelectorAll('.feature-item').forEach((el) => {
      el.classList.add('feature-bounce');
    });

    // Add perspective containers
    document.querySelectorAll('.product-grid, .product-grid-catalog, .steps, .testimonial-grid, .team-grid').forEach((el) => {
      el.classList.add('perspective-container');
    });

    // Device card 3D float
    document.querySelectorAll('.device-card').forEach((el) => {
      el.classList.add('hero-device-3d');
      el.classList.add('gradient-border');
    });

    // Testimonial 3D
    document.querySelectorAll('.testimonial').forEach((el) => {
      el.classList.add('testimonial-3d');
    });

    // Product image parallax
    document.querySelectorAll('.prod-img-wrap').forEach((el) => {
      el.classList.add('prod-img-parallax');
    });

    // Section titles 3D text
    document.querySelectorAll('.section-title').forEach((el) => {
      el.classList.add('text-3d');
    });

    // Floating badges
    document.querySelectorAll('.floating-badge').forEach((el) => {
      el.classList.add('float-badge-3d');
    });
  }

  // ── Master Init ─────────────────────────────────────────────
  function init() {
    initPageLoad();
    autoTagRevealElements();
    initScrollReveal();
    enhance3DElements();
    autoApplyTilt();
    initTiltEffect();
    initCardGlow();
    initCursorGlow();
    initParticles();
    initMagneticButtons();
    initRippleEffect();
    initCounters();
    initEnhancedNavbar();
    initHeroParallax();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-initialize after dynamic content loads (e.g., AJAX product cards)
  const originalFetch = window.fetch;
  let reinitTimer = null;
  window.fetch = function (...args) {
    return originalFetch.apply(this, args).then((response) => {
      // After any fetch completes, schedule a re-init of 3D effects
      clearTimeout(reinitTimer);
      reinitTimer = setTimeout(() => {
        autoTagRevealElements();
        initScrollReveal();
        enhance3DElements();
        autoApplyTilt();
        initTiltEffect();
        initCardGlow();
        initRippleEffect();
      }, 500);
      return response;
    });
  };
})();

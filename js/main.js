/**
 * Kevin - Modern Personal Portfolio
 * Unified Motion & Interaction Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Element Selectors ---
  const header = document.querySelector('.site-header');
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const contactForm = document.getElementById('contactForm');
  const toast = document.getElementById('toastNotice');
  const backToTopBtn = document.getElementById('backToTop');

  // --- 1. Sticky Header & ScrollSpy with requestAnimationFrame ---
  let isScrolling = false;

  const handleScrollState = () => {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Header subtle appearance transition
    if (header) {
      const isScrolled = scrollY > 20;
      if (isScrolled !== header.classList.contains('scrolled')) {
        header.classList.toggle('scrolled', isScrolled);
      }
    }

    // ScrollSpy active link indicator with smooth boundary detection
    let activeId = '';
    const scrollOffset = scrollY + 140;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollOffset >= top && scrollOffset < top + height) {
        activeId = section.getAttribute('id');
      }
    });

    if (activeId) {
      navItems.forEach(link => {
        const isMatch = link.getAttribute('href') === `#${activeId}`;
        link.classList.toggle('active', isMatch);
      });
    }

    isScrolling = false;
  };

  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      window.requestAnimationFrame(handleScrollState);
      isScrolling = true;
    }
  }, { passive: true });

  // Initial check on load
  handleScrollState();

  // --- 2. Mobile Menu Toggle ---
  if (hamburger && navLinks) {
    const closeMobileMenu = () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('is-active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('is-active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on navigation link click
    navItems.forEach(item => {
      item.addEventListener('click', closeMobileMenu);
    });

    // Close when tapping outside the menu
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
        closeMobileMenu();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        closeMobileMenu();
      }
    });
  }

  // --- 3. Smooth Anchor Link Scrolling with Accurate Header Offset ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerEl = document.querySelector('.site-header');
        const headerOffset = headerEl ? headerEl.offsetHeight : 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - (headerOffset - 2);

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // --- 4. Scroll Reveal via Intersection Observer ---
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target); // Unobserve immediately: element permanently settles into view
        }
      });
    }, {
      threshold: 0.06,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Graceful fallback for older engines
    revealElements.forEach(el => el.classList.add('active'));
  }

  // --- 5. Contact Form Submission & Toast Micro-interaction ---
  if (contactForm && toast) {
    let toastTimeout = null;

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('senderName');
      const emailInput = document.getElementById('senderEmail');
      const messageInput = document.getElementById('senderMessage');
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      if (!nameInput.value.trim() || !emailInput.value.trim() || !messageInput.value.trim()) {
        showToast('Please fill in all fields before sending.', '⚠️');
        return;
      }

      // Visual feedback on submit button
      const originalContent = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Sending...';
      submitBtn.style.opacity = '0.85';
      submitBtn.disabled = true;

      setTimeout(() => {
        showToast('Thank you! Your message has been sent successfully.', '✓');
        contactForm.reset();
        submitBtn.innerHTML = originalContent;
        submitBtn.style.opacity = '';
        submitBtn.disabled = false;
      }, 500);
    });

    function showToast(message, iconChar = '✓') {
      const toastIcon = toast.querySelector('.toast-icon');
      const toastText = toast.querySelector('.toast-text');

      if (toastIcon) toastIcon.textContent = iconChar;
      if (toastText) toastText.textContent = message;

      toast.classList.add('show');

      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
      }, 3500);
    }
  }

  // --- 6. Back to Top Button ---
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});

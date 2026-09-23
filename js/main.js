/**
 * Kevin - Modern Personal Portfolio
 * Interactive JavaScript Engine
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

  // --- 1. Sticky Header on Scroll ---
  const handleScrollHeader = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScrollHeader, { passive: true });
  handleScrollHeader(); // Initial check

  // --- 2. Mobile Menu Toggle ---
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('is-active', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu when clicking outside or clicking any nav link
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        if (navLinks.classList.contains('open')) {
          navLinks.classList.remove('open');
          hamburger.classList.remove('is-active');
          hamburger.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('is-active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // --- 3. ScrollSpy: Highlight Active Link in Navbar ---
  const updateActiveNavLink = () => {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navItems.forEach(link => {
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  };
  window.addEventListener('scroll', updateActiveNavLink, { passive: true });

  // --- 4. Smooth Anchor Link Scrolling ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  // --- 5. Scroll Reveal with Intersection Observer ---
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback for older browsers
    revealElements.forEach(el => el.classList.add('active'));
  }

  // --- 6. Contact Form Submission & Toast Notification ---
  if (contactForm && toast) {
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

      // Simulate sending state
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Sending Message...';
      submitBtn.disabled = true;

      setTimeout(() => {
        showToast('Thank you! Your message has been sent successfully.', '✓');
        contactForm.reset();
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      }, 700);
    });
  }

  // Toast notice helper
  function showToast(message, iconChar = '✓') {
    if (!toast) return;
    const toastIcon = toast.querySelector('.toast-icon');
    const toastText = toast.querySelector('.toast-text');

    if (toastIcon) toastIcon.textContent = iconChar;
    if (toastText) toastText.textContent = message;

    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  // --- 7. Back to Top Button ---
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});

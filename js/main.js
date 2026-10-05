/**
 * Kevin - Modern Personal Portfolio
 * Unified Motion & Interaction Engine
 */

// ============================================================================
// EMAILJS CONFIGURATION
// Replace the placeholder values below with your personal EmailJS credentials:
// 1. PUBLIC_KEY  : EmailJS Dashboard -> Account -> General -> Public Key
// 2. SERVICE_ID  : EmailJS Dashboard -> Email Services (e.g. "service_xxxxxxx")
// 3. TEMPLATE_ID : EmailJS Dashboard -> Email Templates (e.g. "template_xxxxxxx")
// ============================================================================
const EMAILJS_CONFIG = {
  PUBLIC_KEY: 'XjhNUFBGpJx9_2uoU',
  SERVICE_ID: 'service_a6illxr',
  TEMPLATE_ID: 'template_luo9ccg',
};

// Helper to send email via EmailJS Browser SDK or REST API fallback
async function sendEmailMessage(templateParams) {
  if (window.emailjs && typeof window.emailjs.send === 'function') {
    return await window.emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );
  }

  // REST API fallback if the SDK script was blocked or not loaded
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service_id: EMAILJS_CONFIG.SERVICE_ID,
      template_id: EMAILJS_CONFIG.TEMPLATE_ID,
      user_id: EMAILJS_CONFIG.PUBLIC_KEY,
      template_params: templateParams,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `EmailJS request failed with status ${response.status}`);
  }

  return response;
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize EmailJS SDK if available and credentials are set
  if (window.emailjs && EMAILJS_CONFIG.PUBLIC_KEY && EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
    try {
      emailjs.init({ publicKey: EMAILJS_CONFIG.PUBLIC_KEY });
    } catch (err) {
      console.warn('[EmailJS] Init notice:', err);
    }
  }

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

  // --- 5. Contact Form Submission & Toast Micro-interaction (EmailJS) ---
  if (contactForm && toast) {
    let toastTimeout = null;
    let isSubmitting = false;

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Prevent duplicate submissions
      if (isSubmitting) return;

      const nameInput = document.getElementById('senderName');
      const emailInput = document.getElementById('senderEmail');
      const messageInput = document.getElementById('senderMessage');
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';

      // 1. Validate all fields
      if (!name || !email || !message) {
        showToast('Please fill in all fields before sending.', '⚠️', 'warning');
        return;
      }

      // 2. Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address.', '⚠️', 'warning');
        if (emailInput) emailInput.focus();
        return;
      }

      // 3. Check for placeholder credentials
      const isConfigured =
        EMAILJS_CONFIG.PUBLIC_KEY && EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_PUBLIC_KEY' &&
        EMAILJS_CONFIG.SERVICE_ID && EMAILJS_CONFIG.SERVICE_ID !== 'YOUR_SERVICE_ID' &&
        EMAILJS_CONFIG.TEMPLATE_ID && EMAILJS_CONFIG.TEMPLATE_ID !== 'YOUR_TEMPLATE_ID';

      if (!isConfigured) {
        showToast('Please configure your EmailJS credentials in js/main.js', '⚠️', 'warning');
        console.warn('[EmailJS] Configuration missing: Replace YOUR_PUBLIC_KEY, YOUR_SERVICE_ID, and YOUR_TEMPLATE_ID in js/main.js.');
        return;
      }

      // 4. Processing UI state: Disable button, show "Sending..."
      isSubmitting = true;
      const originalButtonHtml = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Sending...';
      submitBtn.style.opacity = '0.85';
      submitBtn.disabled = true;

      try {
        // 5. Send name, email, and message to EmailJS
        await sendEmailMessage({
          name: name,
          email: email,
          message: message,
          from_name: name,
          from_email: email,
          reply_to: email,
        });

        // 6. On success: show success message and clear the form
        showToast('Thank you! Your message has been sent successfully.', '✓', 'success');
        contactForm.reset();
      } catch (error) {
        // 7. On failure: show error message and keep user's input intact
        console.error('[EmailJS] Error sending message:', error);
        showToast('Failed to send message. Please try again.', '✕', 'error');
      } finally {
        // 8. Re-enable button after completion
        submitBtn.innerHTML = originalButtonHtml;
        submitBtn.style.opacity = '';
        submitBtn.disabled = false;
        isSubmitting = false;
      }
    });

    function showToast(message, iconChar = '✓', type = 'success') {
      const toastIcon = toast.querySelector('.toast-icon');
      const toastText = toast.querySelector('.toast-text');

      if (toastIcon) {
        toastIcon.textContent = iconChar;
        if (type === 'error') {
          toastIcon.style.background = '#EF4444';
          toastIcon.style.color = '#FFFFFF';
        } else if (type === 'warning') {
          toastIcon.style.background = '#F59E0B';
          toastIcon.style.color = '#0E1013';
        } else {
          toastIcon.style.background = '';
          toastIcon.style.color = '';
        }
      }

      if (type === 'error') {
        toast.style.borderColor = '#EF4444';
      } else if (type === 'warning') {
        toast.style.borderColor = '#F59E0B';
      } else {
        toast.style.borderColor = '';
      }

      if (toastText) toastText.textContent = message;

      toast.classList.add('show');

      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
          if (toastIcon) {
            toastIcon.style.background = '';
            toastIcon.style.color = '';
          }
          toast.style.borderColor = '';
        }, 400);
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

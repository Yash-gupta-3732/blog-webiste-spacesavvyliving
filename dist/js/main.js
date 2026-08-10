/* ==========================================================================
   SpaceSavvyLiving — Main JavaScript
   Vanilla JS · No libraries · Use with defer
   ========================================================================== */

(function () {
  'use strict';

  /* ────────────────────────────────────────────────────────────────────────
     1. Mobile Navigation Toggle
     ──────────────────────────────────────────────────────────────────────── */
  const hamburger    = document.querySelector('.hamburger');
  const mobileMenu   = document.querySelector('.mobile-menu');
  const mobileOverlay = document.querySelector('.mobile-overlay');
  const mobileClose  = document.querySelector('.mobile-menu-close');

  function openMobileMenu() {
    hamburger?.classList.add('active');
    mobileMenu?.classList.add('active');
    mobileOverlay?.classList.add('active');
    document.body.classList.add('no-scroll');
  }

  function closeMobileMenu() {
    hamburger?.classList.remove('active');
    mobileMenu?.classList.remove('active');
    mobileOverlay?.classList.remove('active');
    document.body.classList.remove('no-scroll');
  }

  hamburger?.addEventListener('click', function () {
    const isOpen = mobileMenu?.classList.contains('active');
    isOpen ? closeMobileMenu() : openMobileMenu();
  });

  mobileOverlay?.addEventListener('click', closeMobileMenu);
  mobileClose?.addEventListener('click', closeMobileMenu);

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileMenu?.classList.contains('active')) {
      closeMobileMenu();
    }
  });

  // Close when a mobile-menu link is clicked
  mobileMenu?.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMobileMenu);
  });


  /* ────────────────────────────────────────────────────────────────────────
     2. Sticky Navbar — add .scrolled after 50 px
     ──────────────────────────────────────────────────────────────────────── */
  const navbar = document.querySelector('.navbar');

  if (navbar) {
    function handleNavScroll() {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll(); // initial check
  }


  /* ────────────────────────────────────────────────────────────────────────
     3. FAQ Accordion
     ──────────────────────────────────────────────────────────────────────── */
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(function (question) {
    question.addEventListener('click', function () {
      const parent = this.closest('.faq-item');
      const answer = parent?.querySelector('.faq-answer');

      // Close all other FAQs
      faqQuestions.forEach(function (otherQ) {
        const otherParent = otherQ.closest('.faq-item');
        const otherAnswer = otherParent?.querySelector('.faq-answer');
        if (otherParent !== parent) {
          otherParent?.classList.remove('active');
          otherAnswer?.classList.remove('active');
        }
      });

      // Toggle current
      parent?.classList.toggle('active');
      answer?.classList.toggle('active');
    });
  });


  /* ────────────────────────────────────────────────────────────────────────
     4. Scroll Animations — IntersectionObserver on .fade-in
     ──────────────────────────────────────────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    const fadeElements = document.querySelectorAll('.fade-in');

    const fadeObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target); // once
          }
        });
      },
      { threshold: 0.1 }
    );

    fadeElements.forEach(function (el) {
      fadeObserver.observe(el);
    });
  }


  /* ────────────────────────────────────────────────────────────────────────
     5. Smooth Scroll for Table of Contents links
     ──────────────────────────────────────────────────────────────────────── */
  const tocLinks = document.querySelectorAll('.toc a[href^="#"]');

  tocLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      const targetEl = document.querySelector(targetId);

      if (targetEl) {
        e.preventDefault();

        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        const targetPosition = targetEl.getBoundingClientRect().top
                             + window.pageYOffset
                             - navbarHeight
                             - 20; // extra breathing room

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });

        // Update URL hash without jumping
        history.pushState(null, '', targetId);
      }
    });
  });

  /* ────────────────────────────────────────────────────────────────────────
     8. Functional Newsletter Subscription
     ──────────────────────────────────────────────────────────────────────── */
  const newsletterForms = document.querySelectorAll('.newsletter-form');
  
  newsletterForms.forEach(function(form) {
    form.addEventListener('submit', function(e) {

      const emailInput = form.querySelector('input[type="email"]');
      const enteredEmail = emailInput ? emailInput.value.trim().toLowerCase() : '';

      // Get the list of already-subscribed emails
      const subscribedEmails = JSON.parse(localStorage.getItem('ssl_subscribed_emails') || '[]');

      // Check if THIS specific email already subscribed on this browser
      if (enteredEmail && subscribedEmails.includes(enteredEmail)) {
        e.preventDefault(); // Prevent duplicate submission
        const parent = form.parentElement;
        parent.innerHTML = `
          <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem;">You're already subscribed! 🎉</h2>
          <p style="color: var(--color-accent-dark); font-weight: 500;">
            Thanks for being a part of our community. Keep an eye on your inbox for our latest updates.
          </p>
        `;
        return;
      }

      // NOTE: We DO NOT use e.preventDefault() here for first-time subscribers!
      // The form natively submits its POST request to the target="hidden_iframe"
      // so Kit properly registers the subscriber without reloading the page.

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = 'Subscribing...';
      }

      // Save this email so future attempts with the same email show the right message
      if (enteredEmail) {
        subscribedEmails.push(enteredEmail);
        localStorage.setItem('ssl_subscribed_emails', JSON.stringify(subscribedEmails));
      }

      // Wait 1.5 seconds to ensure the POST request to the iframe goes through
      // before we remove the form from the DOM and show the success message.
      setTimeout(function() {
        const parent = form.parentElement;
        parent.innerHTML = `
          <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Welcome to the club! 🎉</h2>
          <p style="color: var(--color-accent-dark); font-weight: 500;">
            Thanks for subscribing! Keep an eye on your inbox for our latest updates and tips.
          </p>
        `;
      }, 1500);
    });
  });


  /* ────────────────────────────────────────────────────────────────────────
     9. Contact Form AJAX Submission
     ──────────────────────────────────────────────────────────────────────── */
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;
      
      const formData = new FormData(contactForm);
      
      // Use the AJAX endpoint for FormSubmit
      fetch('https://formsubmit.co/ajax/spacesavvylivingco@gmail.com', {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        },
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        const parent = contactForm.parentElement;
        parent.innerHTML = `
          <div style="background: var(--bg-secondary); padding: 3rem 2rem; border-radius: 12px; text-align: center; border: 1px solid var(--border-color);">
            <h2 style="font-family: var(--font-display); color: var(--text-primary); margin-bottom: 1rem;">Message Sent! ✨</h2>
            <p style="color: var(--text-secondary); font-size: 1.1rem; font-weight: 500;">
              Thanks for reaching out! We will get back to you within 1-2 business days.
            </p>
          </div>
        `;
      })
      .catch(error => {
        console.error('FormSubmit Error:', error);
        submitBtn.textContent = 'Error! Try again.';
        submitBtn.disabled = false;
        setTimeout(() => { submitBtn.textContent = originalText; }, 3000);
      });
    });
  }

  /* ────────────────────────────────────────────────────────────────────────
     10. Dynamic Active Navigation Links
     ──────────────────────────────────────────────────────────────────────── */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu-links a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath) {
      link.classList.add('active');
    }
  });

})();

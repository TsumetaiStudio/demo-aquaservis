(function() {
    'use strict';

    // ─── DOM References ───
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const scrollTopBtn = document.getElementById('scrollTop');
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    const submitBtn = document.getElementById('submitBtn');
    const faqItems = document.querySelectorAll('.faq-item');
    const statNumbers = document.querySelectorAll('.hero-stat-number');
    const animateElements = document.querySelectorAll('.animate-on-scroll');

    // ─── Mobile Nav Overlay ───
    let navOverlay = null;

    function createOverlay() {
        if (navOverlay) return;
        navOverlay = document.createElement('div');
        navOverlay.className = 'nav-overlay';
        document.body.appendChild(navOverlay);
        navOverlay.addEventListener('click', closeMenu);
    }

    function openMenu() {
        createOverlay();
        navToggle.classList.add('active');
        navLinks.classList.add('active');
        navOverlay.classList.add('active');
        navToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
        if (navOverlay) navOverlay.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    function toggleMenu() {
        navToggle.classList.contains('active') ? closeMenu() : openMenu();
    }

    // ─── Navbar Scroll Effect ───
    let lastScroll = 0;
    function handleNavScroll() {
        const scrollY = window.scrollY;
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = scrollY;
    }

    // ─── Scroll to Top Button ───
    function handleScrollTopVisibility() {
        if (window.scrollY > 500) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    }

    // ─── Smooth Scroll for Anchor Links ───
    function handleSmoothScroll(e) {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        const targetId = link.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        closeMenu();

        const navHeight = navbar.offsetHeight;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;

        window.scrollTo({
            top: targetPos,
            behavior: 'smooth'
        });
    }

    // ─── Counter Animation ───
    function animateCounter(el) {
        const target = parseInt(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(target * eased);

            el.textContent = current.toLocaleString('cs-CZ') + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // ─── Intersection Observer: Scroll Animations ───
    let statsAnimated = false;

    const scrollObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Animate stat counters once
                if (!statsAnimated && entry.target.classList.contains('hero-stats')) {
                    statsAnimated = true;
                    // Small delay for visual effect
                    setTimeout(function() {
                        statNumbers.forEach(animateCounter);
                    }, 300);
                }

                scrollObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -60px 0px'
    });

    animateElements.forEach(function(el) {
        scrollObserver.observe(el);
    });

    // ─── FAQ Accordion ───
    function toggleFAQ(item) {
        const isActive = item.classList.contains('active');
        const question = item.querySelector('.faq-question');

        // Close all
        faqItems.forEach(function(faq) {
            faq.classList.remove('active');
            faq.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });

        // Toggle clicked
        if (!isActive) {
            item.classList.add('active');
            question.setAttribute('aria-expanded', 'true');
        }
    }

    // ─── Form Validation ───
    function validateField(input) {
        const group = input.closest('.form-group');
        if (!group) return true;

        let valid = true;

        if (input.required && !input.value.trim()) {
            valid = false;
        } else if (input.type === 'email' && input.value) {
            valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
        } else if (input.type === 'tel' && input.value) {
            valid = /^[\+]?[\d\s\-()]{6,}$/.test(input.value.trim());
        }

        if (valid) {
            group.classList.remove('error');
        } else {
            group.classList.add('error');
        }

        return valid;
    }

    function handleFormSubmit(e) {
        e.preventDefault();

        const inputs = contactForm.querySelectorAll('input, select, textarea');
        let allValid = true;

        inputs.forEach(function(input) {
            if (!validateField(input)) {
                allValid = false;
            }
        });

        if (!allValid) return;

        // Simulate submission
        submitBtn.classList.add('loading');

        setTimeout(function() {
            submitBtn.classList.remove('loading');
            formSuccess.classList.add('visible');
            contactForm.reset();

            // Remove success after 5s
            setTimeout(function() {
                formSuccess.classList.remove('visible');
            }, 5000);
        }, 1500);
    }

    // ─── Event Listeners ───

    // Scroll events (throttled via rAF)
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(function() {
                handleNavScroll();
                handleScrollTopVisibility();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Nav toggle
    navToggle.addEventListener('click', toggleMenu);

    // Close menu on nav link click
    navLinks.addEventListener('click', function(e) {
        if (e.target.closest('a')) {
            closeMenu();
        }
    });

    // Smooth scroll
    document.addEventListener('click', handleSmoothScroll);

    // Scroll to top
    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // FAQ
    faqItems.forEach(function(item) {
        item.querySelector('.faq-question').addEventListener('click', function() {
            toggleFAQ(item);
        });
    });

    // Form
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);

        // Real-time validation on blur
        contactForm.querySelectorAll('input, select, textarea').forEach(function(input) {
            input.addEventListener('blur', function() {
                if (input.value) validateField(input);
            });
            // Clear error on input
            input.addEventListener('input', function() {
                input.closest('.form-group').classList.remove('error');
            });
        });
    }

    // Keyboard: close menu on Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMenu();
            // Close FAQ
            faqItems.forEach(function(item) {
                item.classList.remove('active');
                item.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });
        }
    });

    // Initialize: handle scroll state on load
    handleNavScroll();
    handleScrollTopVisibility();

})();

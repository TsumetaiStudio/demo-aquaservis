(function() {
    'use strict';

    // ─── DOM Reference ───
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const scrollTopBtn = document.getElementById('scrollTop');
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    const submitBtn = document.getElementById('submitBtn');
    const scrollProgress = document.getElementById('scrollProgress');
    const faqItems = document.querySelectorAll('.faq-item');
    const statNumbers = document.querySelectorAll('.stat-number');
    const animateElements = document.querySelectorAll('.animate-on-scroll');

    // ─── Mobilní navigace — overlay ───
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

    // ─── Scroll progress bar ───
    function updateScrollProgress() {
        if (!scrollProgress) return;
        var scrollTop = window.scrollY;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) { scrollProgress.style.width = '0'; return; }
        var percent = (scrollTop / docHeight) * 100;
        scrollProgress.style.width = percent + '%';
    }

    // ─── Navbar scroll efekt ───
    function handleNavScroll() {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // ─── Scroll-to-top viditelnost ───
    function handleScrollTopVisibility() {
        if (!scrollTopBtn) return;
        if (window.scrollY > 500) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    }

    // ─── Smooth scroll pro anchor linky ───
    function handleSmoothScroll(e) {
        var link = e.target.closest('a[href^="#"]');
        if (!link) return;
        var targetId = link.getAttribute('href');
        if (targetId === '#') return;
        var target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        closeMenu();
        var navHeight = navbar.offsetHeight;
        var targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
    }

    // ─── Counter animace ───
    function animateCounter(el) {
        var target = parseInt(el.dataset.target);
        var suffix = el.dataset.suffix || '';
        var duration = 2000;
        var startTime = performance.now();

        function update(currentTime) {
            var elapsed = currentTime - startTime;
            var progress = Math.min(elapsed / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = Math.round(target * eased);
            el.textContent = current.toLocaleString('cs-CZ') + suffix;
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    // ─── IntersectionObserver — scroll animace ───
    var statsAnimated = false;

    var scrollObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Animace statistik (jen jednou)
                if (!statsAnimated && entry.target.classList.contains('hero-stats')) {
                    statsAnimated = true;
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

    // ─── Aktivní nav link highlighting ───
    var sections = document.querySelectorAll('section[id]');
    var navLinksAll = document.querySelectorAll('.nav-links a[href^="#"]');

    var sectionObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var id = entry.target.getAttribute('id');
                navLinksAll.forEach(function(link) {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '-20% 0px -60% 0px'
    });

    sections.forEach(function(section) {
        sectionObserver.observe(section);
    });

    // ─── FAQ Accordion ───
    function toggleFAQ(item) {
        var isActive = item.classList.contains('active');
        var question = item.querySelector('.faq-question');

        // Zavřít všechny
        faqItems.forEach(function(faq) {
            faq.classList.remove('active');
            faq.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });

        // Otevřít kliknutý (pokud nebyl otevřený)
        if (!isActive) {
            item.classList.add('active');
            question.setAttribute('aria-expanded', 'true');
        }
    }

    // ─── Validace formuláře ───
    function validateField(input) {
        var group = input.closest('.form-group');
        if (!group) return true;
        var valid = true;

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
        var inputs = contactForm.querySelectorAll('input, select, textarea');
        var allValid = true;

        inputs.forEach(function(input) {
            if (!validateField(input)) allValid = false;
        });

        if (!allValid) return;

        // Simulace odeslání (nahradit Netlify Forms fetch)
        submitBtn.classList.add('loading');

        setTimeout(function() {
            submitBtn.classList.remove('loading');
            formSuccess.classList.add('visible');
            contactForm.reset();

            setTimeout(function() {
                formSuccess.classList.remove('visible');
            }, 5000);
        }, 1500);
    }

    // ─── Service card → contact pre-fill ───
    function preSelectService() {
        var params = new URLSearchParams(window.location.search);
        var service = params.get('service');
        if (service) {
            var select = document.getElementById('service');
            if (select) {
                for (var i = 0; i < select.options.length; i++) {
                    if (select.options[i].value === service) {
                        select.selectedIndex = i;
                        break;
                    }
                }
            }
        }
    }

    // ─── Event listenery ───

    // Scroll (throttled přes rAF)
    var ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(function() {
                handleNavScroll();
                handleScrollTopVisibility();
                updateScrollProgress();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Navigace
    navToggle.addEventListener('click', toggleMenu);
    navLinks.addEventListener('click', function(e) {
        if (e.target.closest('a')) closeMenu();
    });

    // Smooth scroll
    document.addEventListener('click', handleSmoothScroll);

    // Scroll to top
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // FAQ
    faqItems.forEach(function(item) {
        item.querySelector('.faq-question').addEventListener('click', function() {
            toggleFAQ(item);
        });
    });

    // Formulář
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
        contactForm.querySelectorAll('input, select, textarea').forEach(function(input) {
            input.addEventListener('blur', function() {
                if (input.value) validateField(input);
            });
            input.addEventListener('input', function() {
                input.closest('.form-group').classList.remove('error');
            });
        });
    }

    // Klávesové zkratky
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMenu();
            faqItems.forEach(function(item) {
                item.classList.remove('active');
                item.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });
        }
    });

    // ─── Inicializace ───
    handleNavScroll();
    handleScrollTopVisibility();
    updateScrollProgress();
    preSelectService();

})();

(function() {
    'use strict';

    // ─── DOM References (shared across all pages) ───
    var navbar = document.getElementById('navbar');
    var navToggle = document.getElementById('navToggle');
    var navLinks = document.getElementById('navLinks');
    var scrollTopBtn = document.getElementById('scrollTop');
    var scrollProgress = document.getElementById('scrollProgress');
    var faqItems = document.querySelectorAll('.faq-item');
    var statNumbers = document.querySelectorAll('.stat-number');
    var animateElements = document.querySelectorAll('.animate-on-scroll');

    // ─── Active Page Highlighting ───
    function setActivePage() {
        var path = window.location.pathname;
        var page = path.split('/').pop() || 'index.html';
        if (page === '' || page === '/') page = 'index.html';

        var navLinksEl = document.querySelectorAll('.nav-links a:not(.nav-cta-btn)');
        var matched = false;
        navLinksEl.forEach(function(link) {
            link.classList.remove('active-page');
            var href = link.getAttribute('href');
            if (!href) return;

            // Strip query params and hash
            var linkPage = href.split('?')[0].split('#')[0];
            linkPage = linkPage.split('/').pop() || 'index.html';
            if (linkPage === '' || linkPage === '/') linkPage = 'index.html';

            if (linkPage === page) {
                link.classList.add('active-page');
                matched = true;
            }
        });

        // Highlight logo on homepage when no nav link matched
        var logo = document.querySelector('.nav-logo');
        if (logo) {
            if (page === 'index.html' && !matched) {
                logo.classList.add('active-page');
            } else {
                logo.classList.remove('active-page');
            }
        }
    }

    // ─── Mobile Navigation — overlay ───
    var navOverlay = null;

    function createOverlay() {
        if (navOverlay) return;
        navOverlay = document.createElement('div');
        navOverlay.className = 'nav-overlay';
        document.body.appendChild(navOverlay);
        navOverlay.addEventListener('click', closeMenu);
    }

    function openMenu() {
        if (!navToggle || !navLinks) return;
        createOverlay();
        navToggle.classList.add('active');
        navLinks.classList.add('active');
        navOverlay.classList.add('active');
        navToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        if (!navToggle) return;
        navToggle.classList.remove('active');
        if (navLinks) navLinks.classList.remove('active');
        if (navOverlay) navOverlay.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    function toggleMenu() {
        if (!navToggle) return;
        navToggle.classList.contains('active') ? closeMenu() : openMenu();
    }

    // ─── Scroll Progress Bar ───
    function updateScrollProgress() {
        if (!scrollProgress) return;
        var scrollTop = window.scrollY;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) { scrollProgress.style.width = '0'; return; }
        var percent = (scrollTop / docHeight) * 100;
        scrollProgress.style.width = percent + '%';
    }

    // ─── Navbar Scroll Effect ───
    function handleNavScroll() {
        if (!navbar) return;
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // ─── Scroll-to-top Visibility ───
    function handleScrollTopVisibility() {
        if (!scrollTopBtn) return;
        if (window.scrollY > 500) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    }

    // ─── Smooth Scroll for Anchor Links ───
    function handleSmoothScroll(e) {
        var link = e.target.closest('a[href^="#"]');
        if (!link) return;
        var targetId = link.getAttribute('href');
        if (targetId === '#' || targetId.length < 2) return;
        var target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        closeMenu();
        var navHeight = navbar ? navbar.offsetHeight : 72;
        var targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
    }

    // ─── Counter Animation ───
    function animateCounter(el) {
        var target = parseInt(el.dataset.target);
        if (isNaN(target)) return;
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

    // ─── IntersectionObserver — Scroll Animations ───
    var statsAnimated = false;

    if (animateElements.length > 0) {
        var scrollObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');

                    // Stats counter animation (only on pages with hero-stats)
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
    }

    // ─── Active Nav Link Highlighting (anchor-based, homepage only) ───
    var sections = document.querySelectorAll('section[id]');
    var navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

    if (sections.length > 0 && navAnchors.length > 0) {
        var sectionObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var id = entry.target.getAttribute('id');
                    navAnchors.forEach(function(link) {
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
    }

    // ─── FAQ Accordion ───
    function toggleFAQ(item) {
        var isActive = item.classList.contains('active');
        var question = item.querySelector('.faq-question');

        // Close all
        faqItems.forEach(function(faq) {
            faq.classList.remove('active');
            var q = faq.querySelector('.faq-question');
            if (q) q.setAttribute('aria-expanded', 'false');
        });

        // Open clicked (if wasn't open)
        if (!isActive) {
            item.classList.add('active');
            if (question) question.setAttribute('aria-expanded', 'true');
        }
    }

    // ─── Event Listeners ───

    // Scroll (throttled via rAF)
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

    // Navigation
    if (navToggle) {
        navToggle.addEventListener('click', toggleMenu);
    }
    if (navLinks) {
        navLinks.addEventListener('click', function(e) {
            if (e.target.closest('a')) closeMenu();
        });
    }

    // Close mobile nav on resize to desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 1024) closeMenu();
    }, { passive: true });

    // Smooth scroll
    document.addEventListener('click', handleSmoothScroll);

    // Scroll to top
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // FAQ
    if (faqItems.length > 0) {
        faqItems.forEach(function(item) {
            var question = item.querySelector('.faq-question');
            if (question) {
                question.setAttribute('tabindex', '0');
                question.setAttribute('role', 'button');
                question.addEventListener('click', function() {
                    toggleFAQ(item);
                });
                question.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.click();
                    }
                });
            }
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMenu();
            // Close FAQ items
            faqItems.forEach(function(item) {
                item.classList.remove('active');
                var q = item.querySelector('.faq-question');
                if (q) q.setAttribute('aria-expanded', 'false');
            });
        }
    });

    // ─── Newsletter Form Handler ───
    var newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var emailInput = newsletterForm.querySelector('input[type="email"]');
            if (!emailInput || !emailInput.value) return;
            newsletterForm.innerHTML = '<p style="color:var(--primary);font-weight:600;">Děkujeme za přihlášení k odběru!</p>';
        });
    }

    // ─── Global Lightbox ───
    (function() {
        var triggers = document.querySelectorAll('.lightbox-trigger');
        if (triggers.length === 0) return;

        // Create lightbox DOM
        var lb = document.createElement('div');
        lb.className = 'lightbox-global';
        lb.innerHTML = '<button class="lightbox-global-close" aria-label="Zavřít">&times;</button><img class="lightbox-global-img" src="" alt="">';
        document.body.appendChild(lb);

        var lbImg = lb.querySelector('.lightbox-global-img');
        var lbClose = lb.querySelector('.lightbox-global-close');
        var previousFocus = null;

        function openLightbox(src, alt) {
            previousFocus = document.activeElement;
            lbImg.src = src;
            lbImg.alt = alt || '';
            lb.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (lbClose) lbClose.focus();
        }

        function closeLightbox() {
            lb.classList.remove('active');
            document.body.style.overflow = '';
            lbImg.src = '';
            if (previousFocus && previousFocus.focus) {
                previousFocus.focus();
                previousFocus = null;
            }
        }

        triggers.forEach(function(trigger) {
            trigger.addEventListener('click', function() {
                var img = trigger.tagName === 'IMG' ? trigger : trigger.querySelector('img');
                if (!img) return;
                var fullSrc = img.dataset.full || img.src;
                openLightbox(fullSrc, img.alt);
            });
        });

        lbClose.addEventListener('click', closeLightbox);
        lb.addEventListener('click', function(e) {
            if (e.target === lb) closeLightbox();
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && lb.classList.contains('active')) closeLightbox();
        });
    })();

    // ─── Stagger Animation ───
    var staggerContainers = document.querySelectorAll('.steps-grid, .services-grid');
    staggerContainers.forEach(function(container) {
        var items = container.children;
        for (var i = 0; i < items.length; i++) {
            items[i].style.transitionDelay = (i * 150) + 'ms';
        }
    });

    // ─── Testimonials Carousel: Clone cards for infinite loop ───
    (function initTestimonialsCarousel() {
        var track = document.getElementById('testimonialsTrack');
        if (!track) return;
        // Clone all cards and append for seamless infinite loop
        var cards = track.querySelectorAll('.testimonial-card');
        cards.forEach(function(card) {
            var clone = card.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            track.appendChild(clone);
        });
    })();

    // ─── Dark Mode Toggle ───
    var themeToggle = document.getElementById('themeToggle');

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        // Update theme-color meta
        var metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute('content', theme === 'dark' ? '#0f172a' : '#0284c7');
        }
    }

    // Initialize theme
    (function initTheme() {
        var stored = localStorage.getItem('theme');
        if (stored) {
            setTheme(stored);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
        }
    })();

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            var current = document.documentElement.getAttribute('data-theme');
            setTheme(current === 'dark' ? 'light' : 'dark');
        });
    }

    // Listen for system theme changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            if (!localStorage.getItem('theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    // ─── Initialization ───
    setActivePage();
    handleNavScroll();
    handleScrollTopVisibility();
    updateScrollProgress();

    // ─── Service Worker Registration ───
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js').catch(function() {
                // SW registration failed silently
            });
        });
    }

})();

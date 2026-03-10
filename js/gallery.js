(function() {
    'use strict';

    // ─── DOM References ───
    var galleryGrid = document.querySelector('.gallery-grid');
    var filterBtns = document.querySelectorAll('.gallery-filter-btn');
    var lightbox = document.getElementById('galleryLightbox');
    var lightboxImg = lightbox ? lightbox.querySelector('.lightbox-img') : null;
    var lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
    var lightboxPrev = lightbox ? lightbox.querySelector('.lightbox-prev') : null;
    var lightboxNext = lightbox ? lightbox.querySelector('.lightbox-next') : null;
    var lightboxCaption = lightbox ? lightbox.querySelector('.lightbox-caption') : null;
    var lightboxCounter = lightbox ? lightbox.querySelector('.lightbox-counter') : null;

    if (!galleryGrid) return;

    var galleryItems = galleryGrid.querySelectorAll('.gallery-item');
    var currentFilter = 'all';
    var currentIndex = 0;
    var visibleItems = [];

    // ─── Filtering ───
    function filterGallery(category) {
        currentFilter = category;

        galleryItems.forEach(function(item) {
            var itemCategory = item.dataset.category || 'all';
            if (category === 'all' || itemCategory === category) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });

        // Update visible items list
        updateVisibleItems();

        // Update active button
        filterBtns.forEach(function(btn) {
            btn.classList.remove('active');
            if (btn.dataset.filter === category) {
                btn.classList.add('active');
            }
        });
    }

    function updateVisibleItems() {
        visibleItems = [];
        galleryItems.forEach(function(item) {
            if (!item.classList.contains('hidden')) {
                visibleItems.push(item);
            }
        });
    }

    // ─── Lightbox ───
    var previousFocus = null;

    function openLightbox(index) {
        if (!lightbox || !lightboxImg) return;
        previousFocus = document.activeElement;
        currentIndex = index;
        updateLightboxImage();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (lightboxClose) lightboxClose.focus();
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        if (previousFocus && previousFocus.focus) {
            previousFocus.focus();
            previousFocus = null;
        }
    }

    function updateLightboxImage() {
        if (currentIndex < 0 || currentIndex >= visibleItems.length) return;
        var item = visibleItems[currentIndex];
        var img = item.querySelector('img');
        if (!img || !lightboxImg) return;

        // Use larger image for lightbox
        var src = img.dataset.full || img.src;
        lightboxImg.src = src;
        lightboxImg.alt = img.alt || '';

        if (lightboxCaption) {
            lightboxCaption.textContent = img.alt || '';
        }
        if (lightboxCounter) {
            lightboxCounter.textContent = (currentIndex + 1) + ' / ' + visibleItems.length;
        }
    }

    function nextImage() {
        if (visibleItems.length === 0) return;
        currentIndex = (currentIndex + 1) % visibleItems.length;
        updateLightboxImage();
    }

    function prevImage() {
        if (visibleItems.length === 0) return;
        currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
        updateLightboxImage();
    }

    // ─── Event Listeners ───

    // Filter buttons
    filterBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            filterGallery(btn.dataset.filter || 'all');
        });
    });

    // Gallery item click → open lightbox
    galleryItems.forEach(function(item) {
        item.setAttribute('tabindex', '0');
        item.setAttribute('role', 'button');
        item.addEventListener('click', function() {
            updateVisibleItems();
            var index = visibleItems.indexOf(item);
            if (index !== -1) {
                openLightbox(index);
            }
        });
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });

    // Lightbox controls
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', function(e) {
            e.stopPropagation();
            prevImage();
        });
    }
    if (lightboxNext) {
        lightboxNext.addEventListener('click', function(e) {
            e.stopPropagation();
            nextImage();
        });
    }

    // Click outside image → close
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!lightbox || !lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            nextImage();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            prevImage();
        }
    });

    // Touch/swipe support for lightbox
    var touchStartX = 0;
    var touchEndX = 0;

    if (lightbox) {
        lightbox.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            var diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    nextImage();
                } else {
                    prevImage();
                }
            }
        }, { passive: true });
    }

    // ─── Lazy Loading with IntersectionObserver ───
    var lazyImages = galleryGrid.querySelectorAll('img[data-src]');
    if (lazyImages.length > 0) {
        var imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '200px'
        });

        lazyImages.forEach(function(img) {
            imageObserver.observe(img);
        });
    }

    // ─── Load Dynamic Gallery Images from localStorage ───
    function loadDynamicGalleryImages() {
        var GALLERY_KEY = 'aquaservis_gallery';
        try {
            var data = localStorage.getItem(GALLERY_KEY);
            if (!data) return;
            var items = JSON.parse(data);
            if (!items || items.length === 0) return;

            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item animate-on-scroll';
                galleryItem.setAttribute('data-category', item.category || 'realizace');
                galleryItem.setAttribute('tabindex', '0');
                galleryItem.setAttribute('role', 'button');

                var img = document.createElement('img');
                img.src = item.src;
                img.alt = item.alt || '';
                img.loading = 'lazy';

                var overlay = document.createElement('div');
                overlay.className = 'gallery-overlay';
                overlay.innerHTML = '<span class="gallery-title">' + (item.alt || '') + '</span>';

                galleryItem.appendChild(img);
                galleryItem.appendChild(overlay);
                galleryGrid.appendChild(galleryItem);

                // Add click handler for lightbox
                (function(el) {
                    el.addEventListener('click', function() {
                        updateVisibleItems();
                        var index = visibleItems.indexOf(el);
                        if (index !== -1) openLightbox(index);
                    });
                    el.addEventListener('keydown', function(e) {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            el.click();
                        }
                    });
                })(galleryItem);
            }

            // Refresh galleryItems NodeList
            galleryItems = galleryGrid.querySelectorAll('.gallery-item');

            // Observe new items for scroll animation
            var scrollObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        scrollObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

            var newItems = galleryGrid.querySelectorAll('.gallery-item.animate-on-scroll:not(.visible)');
            newItems.forEach(function(item) { scrollObserver.observe(item); });
        } catch (e) {
            // Silently fail
        }
    }

    loadDynamicGalleryImages();

    // ─── Initialize ───
    updateVisibleItems();

})();

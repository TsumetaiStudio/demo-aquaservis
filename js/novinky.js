(function() {
    'use strict';

    var POST_KEY = 'aquapool_posts';
    var grid = document.getElementById('novinkyGrid');
    if (!grid) return;

    var DEFAULT_POSTS = [
        {
            id: 1,
            title: 'Jak připravit bazén na letní sezónu 2026',
            slug: 'jak-pripravit-bazen-na-letni-sezonu-2026',
            excerpt: 'Kompletní průvodce jarním zprovozněním bazénu — od kontroly filtrace až po správné chemické ošetření vody.',
            content: 'Blíží se bazénová sezóna a je čas připravit váš bazén na léto. V tomto článku vám přinášíme kompletní průvodce jarním zprovozněním.\n\nPrvním krokem je důkladná kontrola filtračního systému. Zkontrolujte stav filtračního písku a případně ho vyměňte. Doporučujeme výměnu každé 3–4 roky.\n\nDalším krokem je napuštění bazénu čistou vodou a úprava chemie. Změřte pH hodnotu (ideálně 7,0–7,4) a hladinu chloru. Nezapomeňte na šokovou chloraci při prvním napuštění.\n\nPokud si nejste jisti, kontaktujte nás — rádi vám s jarním zprovozněním pomůžeme!',
            category: 'tipy',
            imageUrl: '',
            author: 'Redakce AquaPool',
            status: 'published',
            newsletterSent: true,
            createdAt: '2026-03-01T10:00:00.000Z',
            updatedAt: '2026-03-01T10:00:00.000Z'
        },
        {
            id: 2,
            title: 'Nová služba: Instalace tepelných čerpadel',
            slug: 'nova-sluzba-instalace-tepelnych-cerpadel',
            excerpt: 'Rozšiřujeme naše služby o profesionální instalaci a servis tepelných čerpadel pro bazény.',
            content: 'S radostí oznamujeme, že od března 2026 nabízíme kompletní služby v oblasti tepelných čerpadel pro bazény.\n\nTepelné čerpadlo je nejefektivnější způsob ohřevu bazénové vody. Na každou investovanou kWh elektrické energie získáte 4–6 kWh tepla.\n\nNabízíme instalaci, servis i poradenství při výběru správného modelu pro váš bazén. Pracujeme s ověřenými značkami a poskytujeme záruku na všechny instalace.\n\nKontaktujte nás pro nezávaznou konzultaci a cenovou nabídku.',
            category: 'novinky',
            imageUrl: '',
            author: 'Redakce AquaPool',
            status: 'published',
            newsletterSent: true,
            createdAt: '2026-02-15T09:00:00.000Z',
            updatedAt: '2026-02-15T09:00:00.000Z'
        },
        {
            id: 3,
            title: 'Jarní akce: 20% sleva na čištění bazénů',
            slug: 'jarni-akce-20-sleva-na-cisteni-bazenu',
            excerpt: 'Využijte jarní akci a objednejte si čištění bazénu se slevou 20 %. Platí do konce dubna 2026.',
            content: 'Připravte se na léto včas! Do konce dubna 2026 nabízíme 20% slevu na kompletní čištění bazénů.\n\nAkce zahrnuje:\n— Vysátí dna a stěn bazénu\n— Čištění vodní linky\n— Kontrola a čištění filtrace\n— Úprava chemie vody\n— Vizuální kontrola technologie\n\nAkci lze kombinovat s jarním zprovozněním. Objednejte se ještě dnes — kapacita je omezená!',
            category: 'akce',
            imageUrl: '',
            author: 'Redakce AquaPool',
            status: 'published',
            newsletterSent: false,
            createdAt: '2026-02-01T08:00:00.000Z',
            updatedAt: '2026-02-01T08:00:00.000Z'
        }
    ];

    var CATEGORY_LABELS = {
        'novinky': 'Novinky',
        'tipy': 'Tipy a rady',
        'akce': 'Akce a slevy',
        'servis': 'Servis'
    };

    // ─── Init seed data ───
    function initPosts() {
        var stored = localStorage.getItem(POST_KEY);
        if (!stored) {
            localStorage.setItem(POST_KEY, JSON.stringify(DEFAULT_POSTS));
        }
    }

    function getPosts() {
        try {
            var data = localStorage.getItem(POST_KEY);
            var posts = data ? JSON.parse(data) : [];
            // Only published, newest first
            return posts
                .filter(function(p) { return p.status === 'published'; })
                .sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
        } catch (e) { return []; }
    }

    function formatDate(isoString) {
        var d = new Date(isoString);
        return d.getDate() + '. ' + (d.getMonth() + 1) + '. ' + d.getFullYear();
    }

    function escapeHTML(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function formatContent(text) {
        if (!text) return '';
        // If content contains HTML tags (from rich editor), use directly
        if (/<[a-z]/i.test(text)) {
            return text;
        }
        // Plain text — convert to paragraphs (backward compatibility)
        var paragraphs = text.split(/\n\n+/);
        return paragraphs.map(function(p) {
            return '<p>' + escapeHTML(p.trim()).replace(/\n/g, '<br>') + '</p>';
        }).join('');
    }

    // ─── Render ───
    function renderPosts(posts) {
        if (posts.length === 0) {
            grid.innerHTML = '<div class="novinky-empty">'
                + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 8h10M7 12h6M7 16h8" stroke-linecap="round"/></svg>'
                + '<h3>Zatím žádné příspěvky</h3>'
                + '<p>Brzy zde najdete novinky, tipy a akce.</p>'
                + '</div>';
            return;
        }

        var html = '';
        for (var i = 0; i < posts.length; i++) {
            html += renderCard(posts[i]);
        }
        grid.innerHTML = html;
    }

    function renderCard(post) {
        var imageHTML;
        if (post.imageUrl) {
            imageHTML = '<div class="novinky-card-image">'
                + '<img src="' + escapeHTML(post.imageUrl) + '" alt="' + escapeHTML(post.title) + '" loading="lazy">'
                + '</div>';
        } else {
            imageHTML = '<div class="novinky-card-image novinky-card-image--placeholder">'
                + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 8h10M7 12h6M7 16h8" stroke-linecap="round"/></svg>'
                + '</div>';
        }

        var categoryClass = 'novinky-cat-' + post.category;
        var categoryLabel = CATEGORY_LABELS[post.category] || post.category;

        return '<article class="novinky-card animate-on-scroll" data-category="' + post.category + '">'
            + imageHTML
            + '<div class="novinky-card-body">'
            + '<div class="novinky-card-meta">'
            + '<span class="novinky-category-badge ' + categoryClass + '">' + categoryLabel + '</span>'
            + '<time datetime="' + post.createdAt.split('T')[0] + '">' + formatDate(post.createdAt) + '</time>'
            + '</div>'
            + '<h3 class="novinky-card-title">' + escapeHTML(post.title) + '</h3>'
            + '<p class="novinky-card-excerpt">' + escapeHTML(post.excerpt || '') + '</p>'
            + '<button class="novinky-read-more" aria-expanded="false" data-post-id="' + post.id + '">'
            + 'Číst dále '
            + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>'
            + '</button>'
            + '<div class="novinky-card-full" id="postFull-' + post.id + '">'
            + '<div class="novinky-card-content">'
            + formatContent(post.content)
            + '</div>'
            + '</div>'
            + '</div>'
            + '</article>';
    }

    // ─── Filtering ───
    function handleFilter(category) {
        var cards = grid.querySelectorAll('.novinky-card');
        cards.forEach(function(card) {
            if (category === 'all' || card.getAttribute('data-category') === category) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });

        // Update active filter button
        var filters = document.querySelectorAll('.novinky-filter');
        filters.forEach(function(btn) {
            btn.classList.remove('active');
            if (btn.getAttribute('data-filter') === category) {
                btn.classList.add('active');
            }
        });
    }

    // ─── Read More toggle ───
    function handleReadMore(button) {
        var postId = button.getAttribute('data-post-id');
        var fullContent = document.getElementById('postFull-' + postId);
        if (!fullContent) return;

        var isExpanded = button.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
            button.setAttribute('aria-expanded', 'false');
            fullContent.classList.remove('expanded');
            button.innerHTML = 'Číst dále <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
        } else {
            button.setAttribute('aria-expanded', 'true');
            fullContent.classList.add('expanded');
            button.innerHTML = 'Skrýt <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
        }
    }

    // ─── Event delegation ───
    document.addEventListener('click', function(e) {
        // Filter buttons
        var filterBtn = e.target.closest('.novinky-filter');
        if (filterBtn) {
            var category = filterBtn.getAttribute('data-filter');
            handleFilter(category);
            return;
        }

        // Read more buttons
        var readMoreBtn = e.target.closest('.novinky-read-more');
        if (readMoreBtn) {
            handleReadMore(readMoreBtn);
            return;
        }
    });

    // ─── Observe dynamically rendered cards for scroll animation ───
    function observeCards() {
        var cards = grid.querySelectorAll('.animate-on-scroll');
        if (cards.length === 0) return;

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -60px 0px'
        });

        cards.forEach(function(card) {
            observer.observe(card);
        });
    }

    // ─── Initialize ───
    initPosts();
    var posts = getPosts();
    renderPosts(posts);
    observeCards();

})();

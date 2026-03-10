(function() {
    'use strict';

    var loginScreen = document.getElementById('adminLogin');
    var dashboard = document.getElementById('adminDashboard');
    var loginForm = document.getElementById('adminLoginForm');
    var sidebar = document.getElementById('adminSidebar');
    // mobileToggle replaced by FAB menu
    var logoutBtn = document.getElementById('adminLogout');

    // ─── Admin Theme Toggle ───
    var adminThemeToggle = document.getElementById('adminThemeToggle');
    var adminThemeLabel = document.querySelector('.admin-theme-label');

    function setAdminTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (adminThemeLabel) {
            adminThemeLabel.textContent = theme === 'dark' ? 'Tmavý režim' : 'Světlý režim';
        }
    }

    // Initialize theme from localStorage
    (function() {
        var stored = localStorage.getItem('theme');
        if (stored) {
            setAdminTheme(stored);
        } else {
            setAdminTheme('dark');
        }
    })();

    if (adminThemeToggle) {
        adminThemeToggle.addEventListener('click', function() {
            var current = document.documentElement.getAttribute('data-theme');
            setAdminTheme(current === 'dark' ? 'light' : 'dark');
        });
    }

    // ─── Auto-login if session exists ───
    var session = window.AquaAuth ? window.AquaAuth.getSession() : null;
    if (session && session.role === 'admin') {
        if (loginScreen) loginScreen.style.display = 'none';
        if (dashboard) dashboard.classList.add('active');
    }

    // ─── Login handler ───
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            var emailInput = document.getElementById('adminEmail');
            var passwordInput = document.getElementById('adminPassword');
            var email = emailInput ? emailInput.value.trim() : '';
            var password = passwordInput ? passwordInput.value : '';

            // Remove previous error
            var prevError = loginForm.querySelector('.admin-login-error');
            if (prevError) prevError.remove();

            if (!email || !password) {
                showLoginError('Vyplňte e-mail a heslo.');
                return;
            }

            if (!window.AquaAuth) {
                // Fallback: any credentials (old behavior)
                if (loginScreen) loginScreen.style.display = 'none';
                if (dashboard) dashboard.classList.add('active');
                return;
            }

            var result = window.AquaAuth.login(email, password);

            if (!result.success) {
                showLoginError(result.error);
                return;
            }

            if (result.user.role !== 'admin') {
                showLoginError('Tento účet nemá oprávnění administrátora.');
                window.AquaAuth.logout();
                return;
            }

            // Success — show dashboard
            if (loginScreen) loginScreen.style.display = 'none';
            if (dashboard) dashboard.classList.add('active');
        });
    }

    function showLoginError(message) {
        var prevError = loginForm.querySelector('.admin-login-error');
        if (prevError) prevError.remove();

        var errorEl = document.createElement('div');
        errorEl.className = 'admin-login-error';
        errorEl.style.cssText = 'background:rgba(220,38,38,0.1);color:#f87171;padding:12px 16px;border-radius:8px;font-size:14px;text-align:center;margin-top:12px;border:1px solid rgba(220,38,38,0.2);';
        errorEl.textContent = message;
        loginForm.appendChild(errorEl);

        setTimeout(function() { if (errorEl.parentNode) errorEl.remove(); }, 4000);
    }

    // ─── Logout handler ───
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (window.AquaAuth) window.AquaAuth.logout();
            if (dashboard) dashboard.classList.remove('active');
            if (loginScreen) loginScreen.style.display = '';
            if (loginForm) loginForm.reset();
        });
    }

    // ─── Sidebar navigation ───
    var navItems = document.querySelectorAll('.admin-nav-item[data-panel]');
    var panels = document.querySelectorAll('.admin-panel');

    navItems.forEach(function(item) {
        item.addEventListener('click', function() {
            var target = this.getAttribute('data-panel');

            // Update active nav item
            navItems.forEach(function(nav) { nav.classList.remove('active'); });
            this.classList.add('active');

            // Show target panel
            panels.forEach(function(panel) { panel.classList.remove('active'); });
            var targetPanel = document.getElementById(target);
            if (targetPanel) targetPanel.classList.add('active');

            // Close mobile sidebar
            if (sidebar) sidebar.classList.remove('open');
        });
    });

    // ─── Dashboard stat cards → navigate to panel ───
    var statLinks = document.querySelectorAll('.admin-stat-link[data-goto]');
    statLinks.forEach(function(card) {
        card.addEventListener('click', function() {
            var target = this.getAttribute('data-goto');
            if (!target) return;

            // Find and click the corresponding sidebar nav item
            var navBtn = document.querySelector('.admin-nav-item[data-panel="' + target + '"]');
            if (navBtn) navBtn.click();
        });
    });

    // ─── Mobile Top Icon Bar ───
    var mobileIcons = document.querySelectorAll('.admin-mobile-icon[data-panel]');

    mobileIcons.forEach(function(icon) {
        icon.addEventListener('click', function() {
            var panelId = icon.getAttribute('data-panel');

            // Update sidebar nav
            navItems.forEach(function(n) { n.classList.remove('active'); });
            var matchingNav = document.querySelector('.admin-nav-item[data-panel="' + panelId + '"]');
            if (matchingNav) matchingNav.classList.add('active');

            // Show panel
            panels.forEach(function(p) { p.classList.remove('active'); });
            var targetPanel = document.getElementById(panelId);
            if (targetPanel) targetPanel.classList.add('active');

            // Update mobile bar active state
            mobileIcons.forEach(function(mi) { mi.classList.remove('active'); });
            icon.classList.add('active');
        });
    });

    // Sync mobile bar active state when sidebar nav is clicked
    navItems.forEach(function(navItem) {
        navItem.addEventListener('click', function() {
            var panelId = navItem.getAttribute('data-panel');
            mobileIcons.forEach(function(mi) { mi.classList.remove('active'); });
            var matchingMobile = document.querySelector('.admin-mobile-icon[data-panel="' + panelId + '"]');
            if (matchingMobile) matchingMobile.classList.add('active');
        });
    });

    // ─── Standalone Newsletter send (demo) ───
    var standaloneNewsletterBtn = document.getElementById('standaloneNewsletterBtn');
    if (standaloneNewsletterBtn) {
        standaloneNewsletterBtn.addEventListener('click', function() {
            var textarea = document.getElementById('standaloneNewsletterMsg');
            if (textarea && textarea.value.trim()) {
                standaloneNewsletterBtn.textContent = 'Odesláno!';
                standaloneNewsletterBtn.style.background = 'linear-gradient(135deg, #10b981, #34d399)';
                showAdminToast('Novinky odeslány 156 odběratelům!', 'success');
                setTimeout(function() {
                    standaloneNewsletterBtn.textContent = 'Odeslat newsletter';
                    standaloneNewsletterBtn.style.background = '';
                    textarea.value = '';
                }, 2000);
            }
        });
    }

    // ═══════════════════════════════════════════
    //  NOVINKY (BLOG) — CRUD
    // ═══════════════════════════════════════════

    // ─── Rich Editor Init ───
    function initEditor() {
        var toolbar = document.getElementById('editorToolbar');
        var editorArea = document.getElementById('postContent');
        if (!toolbar || !editorArea) return;

        // Toolbar button clicks
        toolbar.addEventListener('click', function(e) {
            var btn = e.target.closest('button');
            if (!btn) return;
            e.preventDefault();

            var cmd = btn.getAttribute('data-cmd');
            if (!cmd) return;

            editorArea.focus();

            if (cmd === 'createLink') {
                var url = prompt('Zadejte URL odkazu:', 'https://');
                if (url) document.execCommand('createLink', false, url);
                return;
            }

            var value = btn.getAttribute('data-value') || null;
            if (cmd === 'formatBlock' && value) {
                document.execCommand(cmd, false, '<' + value + '>');
            } else {
                document.execCommand(cmd, false, value);
            }
        });

        // Insert image into editor content
        var insertImgBtn = document.getElementById('editorInsertImage');
        var editorImgInput = document.getElementById('editorImageInput');
        if (insertImgBtn && editorImgInput) {
            insertImgBtn.addEventListener('click', function(e) {
                e.preventDefault();
                editorImgInput.click();
            });
            editorImgInput.addEventListener('change', function() {
                if (!this.files || !this.files[0]) return;
                compressImage(this.files[0], 800, 0.7, function(base64) {
                    editorArea.focus();
                    document.execCommand('insertImage', false, base64);
                });
                this.value = '';
            });
        }

        // Main article image upload
        var uploadBtn = document.getElementById('postImageUploadBtn');
        var fileInput = document.getElementById('postImageFile');
        var previewContainer = document.getElementById('postImagePreview');
        var previewImg = document.getElementById('postImagePreviewImg');
        var removeBtn = document.getElementById('postImageRemove');
        var hiddenInput = document.getElementById('postImage');
        var nameSpan = document.getElementById('postImageName');

        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', function(e) {
                e.preventDefault();
                fileInput.click();
            });
            fileInput.addEventListener('change', function() {
                if (!this.files || !this.files[0]) return;
                var file = this.files[0];
                if (nameSpan) nameSpan.textContent = file.name;
                compressImage(file, 1200, 0.8, function(base64) {
                    if (hiddenInput) hiddenInput.value = base64;
                    if (previewImg) previewImg.src = base64;
                    if (previewContainer) previewContainer.style.display = '';
                });
            });
        }

        if (removeBtn) {
            removeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (hiddenInput) hiddenInput.value = '';
                if (previewContainer) previewContainer.style.display = 'none';
                if (previewImg) previewImg.src = '';
                if (fileInput) fileInput.value = '';
                if (nameSpan) nameSpan.textContent = '';
            });
        }
    }

    // ─── Image Compression ───
    function compressImage(file, maxWidth, quality, callback) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var img = new Image();
            img.onload = function() {
                var w = img.width;
                var h = img.height;
                if (w > maxWidth) {
                    h = Math.round(h * maxWidth / w);
                    w = maxWidth;
                }
                var canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                var dataUrl = canvas.toDataURL('image/jpeg', quality);
                callback(dataUrl);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // ─── Get Editor Content ───
    function getEditorContent() {
        var el = document.getElementById('postContent');
        return el ? el.innerHTML.trim() : '';
    }

    function setEditorContent(html) {
        var el = document.getElementById('postContent');
        if (el) el.innerHTML = html || '';
    }

    var POST_KEY = 'aquaservis_posts';
    var editingPostId = null;

    var DEFAULT_POSTS = [
        {
            id: 1,
            title: 'Jak připravit bazén na letní sezónu 2026',
            slug: 'jak-pripravit-bazen-na-letni-sezonu-2026',
            excerpt: 'Kompletní průvodce jarním zprovozněním bazénu — od kontroly filtrace až po správné chemické ošetření vody.',
            content: 'Blíží se bazénová sezóna a je čas připravit váš bazén na léto. V tomto článku vám přinášíme kompletní průvodce jarním zprovozněním.\n\nPrvním krokem je důkladná kontrola filtračního systému. Zkontrolujte stav filtračního písku a případně ho vyměňte. Doporučujeme výměnu každé 3–4 roky.\n\nDalším krokem je napuštění bazénu čistou vodou a úprava chemie. Změřte pH hodnotu (ideálně 7,0–7,4) a hladinu chloru. Nezapomeňte na šokovou chloraci při prvním napuštění.\n\nPokud si nejste jisti, kontaktujte nás — rádi vám s jarním zprovozněním pomůžeme!',
            category: 'tipy',
            imageUrl: '',
            author: 'Admin WebZitra',
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
            author: 'Admin WebZitra',
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
            author: 'Admin WebZitra',
            status: 'published',
            newsletterSent: false,
            createdAt: '2026-02-01T08:00:00.000Z',
            updatedAt: '2026-02-01T08:00:00.000Z'
        }
    ];

    // Initialize seed posts
    function initPosts() {
        var stored = localStorage.getItem(POST_KEY);
        if (!stored) {
            localStorage.setItem(POST_KEY, JSON.stringify(DEFAULT_POSTS));
        }
    }

    function getPostsFromStorage() {
        try {
            var data = localStorage.getItem(POST_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    }

    function savePostsToStorage(posts) {
        localStorage.setItem(POST_KEY, JSON.stringify(posts));
    }

    function generateSlug(title) {
        var map = { 'á':'a','č':'c','ď':'d','é':'e','ě':'e','í':'i','ň':'n','ó':'o','ř':'r','š':'s','ť':'t','ú':'u','ů':'u','ý':'y','ž':'z' };
        return title.toLowerCase().replace(/[áčďéěíňóřšťúůýž]/g, function(ch) { return map[ch] || ch; })
            .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 80);
    }

    function getNextPostId(posts) {
        var maxId = 0;
        for (var i = 0; i < posts.length; i++) {
            if (posts[i].id > maxId) maxId = posts[i].id;
        }
        return maxId + 1;
    }

    function formatDateCZ(isoString) {
        var d = new Date(isoString);
        return d.getDate() + '. ' + (d.getMonth() + 1) + '. ' + d.getFullYear();
    }

    var CATEGORY_LABELS = {
        'novinky': 'Novinky',
        'tipy': 'Tipy a rady',
        'akce': 'Akce a slevy',
        'servis': 'Servis'
    };

    // ─── Admin Toast ───
    function showAdminToast(message, type) {
        var existing = document.querySelector('.admin-toast');
        if (existing) existing.remove();

        var toast = document.createElement('div');
        toast.className = 'admin-toast' + (type === 'success' ? ' admin-toast-success' : type === 'error' ? ' admin-toast-error' : '');
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                toast.classList.add('visible');
            });
        });

        setTimeout(function() {
            toast.classList.remove('visible');
            setTimeout(function() { toast.remove(); }, 300);
        }, 3000);
    }

    // ─── Newsletter Simulation ───
    function simulateNewsletter(post) {
        showAdminToast('Odesílání newsletteru 156 odběratelům...', '');
        setTimeout(function() {
            var posts = getPostsFromStorage();
            for (var i = 0; i < posts.length; i++) {
                if (posts[i].id === post.id) {
                    posts[i].newsletterSent = true;
                    break;
                }
            }
            savePostsToStorage(posts);
            showAdminToast('Newsletter úspěšně odeslán! ✓', 'success');
            renderAdminPostsList();
        }, 1500);
    }

    // ─── Render Admin Posts List ───
    function renderAdminPostsList() {
        var container = document.getElementById('adminPostsList');
        var countEl = document.getElementById('postCount');
        if (!container) return;

        var posts = getPostsFromStorage();
        posts.sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });

        if (countEl) {
            countEl.textContent = posts.length + ' příspěvk' + (posts.length === 1 ? '' : posts.length < 5 ? 'y' : 'ů');
        }

        if (posts.length === 0) {
            container.innerHTML = '<div class="admin-posts-empty">Zatím žádné příspěvky. Vytvořte první příspěvek výše.</div>';
            return;
        }

        var html = '';
        for (var i = 0; i < posts.length; i++) {
            var p = posts[i];
            var statusBadge = p.status === 'published'
                ? '<span class="admin-badge admin-badge-success">Publikováno</span>'
                : '<span class="admin-badge admin-badge-warning">Koncept</span>';
            var categoryBadge = '<span class="admin-badge admin-badge-info">' + (CATEGORY_LABELS[p.category] || p.category) + '</span>';
            var newsletterIcon = p.newsletterSent
                ? '<button class="btn-newsletter sent" title="Newsletter odeslán" data-action="newsletter" data-id="' + p.id + '"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="14" height="10" rx="1.5"/><path d="M1 4.5l7 4.5 7-4.5"/></svg>✓</button>'
                : '<button class="btn-newsletter" title="Odeslat newsletter" data-action="newsletter" data-id="' + p.id + '"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="14" height="10" rx="1.5"/><path d="M1 4.5l7 4.5 7-4.5"/></svg></button>';

            html += '<div class="admin-post-row">'
                + '<div class="admin-post-info">'
                + '<h4>' + escapeHTML(p.title) + '</h4>'
                + '<div class="admin-post-meta">' + categoryBadge + ' ' + statusBadge + ' · ' + formatDateCZ(p.createdAt) + '</div>'
                + '</div>'
                + '<div class="admin-post-actions">'
                + '<button data-action="edit" data-id="' + p.id + '">Upravit</button>'
                + '<button class="btn-delete" data-action="delete" data-id="' + p.id + '">Smazat</button>'
                + newsletterIcon
                + '</div>'
                + '</div>';
        }
        container.innerHTML = html;
    }

    function escapeHTML(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ─── Form Reset ───
    function resetPostForm() {
        editingPostId = null;
        var title = document.getElementById('postTitle');
        var category = document.getElementById('postCategory');
        var excerpt = document.getElementById('postExcerpt');
        var image = document.getElementById('postImage');
        var newsletter = document.getElementById('postSendNewsletter');
        var formTitle = document.getElementById('postFormTitle');
        var cancelBtn = document.getElementById('postFormCancel');
        var previewContainer = document.getElementById('postImagePreview');
        var previewImg = document.getElementById('postImagePreviewImg');
        var fileInput = document.getElementById('postImageFile');
        var nameSpan = document.getElementById('postImageName');

        if (title) title.value = '';
        if (category) category.value = 'novinky';
        if (excerpt) excerpt.value = '';
        setEditorContent('');
        if (image) image.value = '';
        if (newsletter) newsletter.checked = true;
        if (formTitle) formTitle.textContent = 'Nový příspěvek';
        if (cancelBtn) cancelBtn.style.display = 'none';
        if (previewContainer) previewContainer.style.display = 'none';
        if (previewImg) previewImg.src = '';
        if (fileInput) fileInput.value = '';
        if (nameSpan) nameSpan.textContent = '';
    }

    // ─── Publish Post ───
    function handlePublishPost() {
        var titleEl = document.getElementById('postTitle');
        var categoryEl = document.getElementById('postCategory');
        var excerptEl = document.getElementById('postExcerpt');
        var imageEl = document.getElementById('postImage');
        var newsletterEl = document.getElementById('postSendNewsletter');

        var titleVal = titleEl ? titleEl.value.trim() : '';
        var contentVal = getEditorContent();

        if (!titleVal) { showAdminToast('Vyplňte nadpis článku.', 'error'); return; }
        if (!contentVal) { showAdminToast('Vyplňte obsah článku.', 'error'); return; }

        var posts = getPostsFromStorage();
        var now = new Date().toISOString();
        var sendNewsletter = newsletterEl ? newsletterEl.checked : false;

        if (editingPostId) {
            for (var i = 0; i < posts.length; i++) {
                if (posts[i].id === editingPostId) {
                    posts[i].title = titleVal;
                    posts[i].slug = generateSlug(titleVal);
                    posts[i].excerpt = excerptEl ? excerptEl.value.trim() : '';
                    posts[i].content = contentVal;
                    posts[i].category = categoryEl ? categoryEl.value : 'novinky';
                    posts[i].imageUrl = imageEl ? imageEl.value.trim() : '';
                    posts[i].status = 'published';
                    posts[i].updatedAt = now;
                    if (sendNewsletter) {
                        savePostsToStorage(posts);
                        simulateNewsletter(posts[i]);
                    } else {
                        savePostsToStorage(posts);
                    }
                    break;
                }
            }
            showAdminToast('Příspěvek byl aktualizován.', 'success');
        } else {
            var newPost = {
                id: getNextPostId(posts),
                title: titleVal,
                slug: generateSlug(titleVal),
                excerpt: excerptEl ? excerptEl.value.trim() : '',
                content: contentVal,
                category: categoryEl ? categoryEl.value : 'novinky',
                imageUrl: imageEl ? imageEl.value.trim() : '',
                author: (session ? session.name : 'Admin'),
                status: 'published',
                newsletterSent: false,
                createdAt: now,
                updatedAt: now
            };
            posts.push(newPost);
            savePostsToStorage(posts);
            if (sendNewsletter) {
                simulateNewsletter(newPost);
            }
            showAdminToast('Příspěvek byl publikován!', 'success');
        }

        resetPostForm();
        renderAdminPostsList();
    }

    // ─── Save Draft ───
    function handleSaveDraft() {
        var titleEl = document.getElementById('postTitle');
        var categoryEl = document.getElementById('postCategory');
        var excerptEl = document.getElementById('postExcerpt');
        var imageEl = document.getElementById('postImage');

        var titleVal = titleEl ? titleEl.value.trim() : '';
        if (!titleVal) { showAdminToast('Vyplňte alespoň nadpis.', 'error'); return; }

        var contentVal = getEditorContent();
        var posts = getPostsFromStorage();
        var now = new Date().toISOString();

        if (editingPostId) {
            for (var i = 0; i < posts.length; i++) {
                if (posts[i].id === editingPostId) {
                    posts[i].title = titleVal;
                    posts[i].slug = generateSlug(titleVal);
                    posts[i].excerpt = excerptEl ? excerptEl.value.trim() : '';
                    posts[i].content = contentVal;
                    posts[i].category = categoryEl ? categoryEl.value : 'novinky';
                    posts[i].imageUrl = imageEl ? imageEl.value.trim() : '';
                    posts[i].status = 'draft';
                    posts[i].updatedAt = now;
                    break;
                }
            }
        } else {
            posts.push({
                id: getNextPostId(posts),
                title: titleVal,
                slug: generateSlug(titleVal),
                excerpt: excerptEl ? excerptEl.value.trim() : '',
                content: contentVal,
                category: categoryEl ? categoryEl.value : 'novinky',
                imageUrl: imageEl ? imageEl.value.trim() : '',
                author: (session ? session.name : 'Admin'),
                status: 'draft',
                newsletterSent: false,
                createdAt: now,
                updatedAt: now
            });
        }

        savePostsToStorage(posts);
        resetPostForm();
        renderAdminPostsList();
        showAdminToast('Koncept uložen.', 'success');
    }

    // ─── Edit Post ───
    function handleEditPost(id) {
        var posts = getPostsFromStorage();
        var post = null;
        for (var i = 0; i < posts.length; i++) {
            if (posts[i].id === id) { post = posts[i]; break; }
        }
        if (!post) return;

        editingPostId = id;
        var titleEl = document.getElementById('postTitle');
        var categoryEl = document.getElementById('postCategory');
        var excerptEl = document.getElementById('postExcerpt');
        var imageEl = document.getElementById('postImage');
        var formTitle = document.getElementById('postFormTitle');
        var cancelBtn = document.getElementById('postFormCancel');
        var previewContainer = document.getElementById('postImagePreview');
        var previewImg = document.getElementById('postImagePreviewImg');

        if (titleEl) titleEl.value = post.title;
        if (categoryEl) categoryEl.value = post.category;
        if (excerptEl) excerptEl.value = post.excerpt;
        // Set editor content — if it contains HTML use directly, otherwise convert plain text
        if (post.content && /<[a-z]/i.test(post.content)) {
            setEditorContent(post.content);
        } else {
            // Convert plain text to paragraphs for backward compatibility
            var paragraphs = (post.content || '').split(/\n\n+/);
            var htmlContent = '';
            for (var j = 0; j < paragraphs.length; j++) {
                if (paragraphs[j].trim()) {
                    htmlContent += '<p>' + escapeHTML(paragraphs[j].trim()).replace(/\n/g, '<br>') + '</p>';
                }
            }
            setEditorContent(htmlContent);
        }
        if (imageEl) imageEl.value = post.imageUrl || '';
        // Show image preview if there's an image
        if (post.imageUrl && previewContainer && previewImg) {
            previewImg.src = post.imageUrl;
            previewContainer.style.display = '';
        }
        if (formTitle) formTitle.textContent = 'Upravit příspěvek';
        if (cancelBtn) cancelBtn.style.display = '';

        // Scroll form into view
        var formCard = document.getElementById('postFormCard');
        if (formCard) formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ─── Delete Post ───
    function handleDeletePost(id) {
        if (!confirm('Opravdu chcete smazat tento příspěvek?')) return;
        var posts = getPostsFromStorage();
        posts = posts.filter(function(p) { return p.id !== id; });
        savePostsToStorage(posts);
        renderAdminPostsList();
        showAdminToast('Příspěvek byl smazán.', 'success');
    }

    // ─── Event Listeners for Blog ───
    var publishBtn = document.getElementById('postPublish');
    var draftBtn = document.getElementById('postSaveDraft');
    var cancelFormBtn = document.getElementById('postFormCancel');
    var postsListEl = document.getElementById('adminPostsList');

    if (publishBtn) publishBtn.addEventListener('click', handlePublishPost);
    if (draftBtn) draftBtn.addEventListener('click', handleSaveDraft);
    if (cancelFormBtn) cancelFormBtn.addEventListener('click', resetPostForm);

    // Delegate clicks on post list actions
    if (postsListEl) {
        postsListEl.addEventListener('click', function(e) {
            var btn = e.target.closest('[data-action]');
            if (!btn) return;
            var action = btn.getAttribute('data-action');
            var id = parseInt(btn.getAttribute('data-id'));
            if (isNaN(id)) return;

            if (action === 'edit') handleEditPost(id);
            else if (action === 'delete') handleDeletePost(id);
            else if (action === 'newsletter') {
                var posts = getPostsFromStorage();
                var post = null;
                for (var i = 0; i < posts.length; i++) {
                    if (posts[i].id === id) { post = posts[i]; break; }
                }
                if (post) simulateNewsletter(post);
            }
        });
    }

    // ═══════════════════════════════════════════
    //  STATISTIKY WEBU
    // ═══════════════════════════════════════════

    var currentStatsPeriod = 'week';

    function generateTrafficData(period) {
        var data = [];
        var labels = [];
        var days, max;

        if (period === 'week') {
            labels = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
            days = 7; max = 120;
        } else if (period === 'month') {
            for (var i = 1; i <= 30; i++) labels.push(i + '.');
            days = 30; max = 150;
        } else {
            labels = ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čvn', 'Čvc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro'];
            days = 12; max = 2800;
        }

        // Seed for consistent but simulated values
        var seed = 42;
        function seededRandom() {
            seed = (seed * 16807) % 2147483647;
            return (seed - 1) / 2147483646;
        }

        for (var j = 0; j < days; j++) {
            var base = max * 0.5;
            var val = Math.round(base + seededRandom() * max * 0.5);
            // Weekends have fewer visits (for week period)
            if (period === 'week' && (j === 5 || j === 6)) val = Math.round(val * 0.6);
            data.push({ label: labels[j], value: val });
        }
        return data;
    }

    function renderTrafficChart(data) {
        var container = document.getElementById('statsChart');
        if (!container) return;

        var maxVal = 0;
        for (var i = 0; i < data.length; i++) {
            if (data[i].value > maxVal) maxVal = data[i].value;
        }

        var svgW = 700;
        var svgH = 150;
        var barW = Math.min(20, Math.max(12, (svgW - 60) / data.length - 6));
        var gap = 6;
        var startX = 40;

        var svg = '<svg viewBox="0 0 ' + svgW + ' ' + (svgH + 30) + '" xmlns="http://www.w3.org/2000/svg">';

        // Y-axis lines
        for (var g = 0; g <= 4; g++) {
            var y = svgH - (svgH * g / 4);
            var yVal = Math.round(maxVal * g / 4);
            svg += '<line x1="' + startX + '" y1="' + y + '" x2="' + svgW + '" y2="' + y + '" stroke="rgba(148,163,184,0.1)" stroke-width="1"/>';
            svg += '<text x="' + (startX - 5) + '" y="' + (y + 4) + '" text-anchor="end" fill="#64748b" font-size="10">' + yVal + '</text>';
        }

        // Bars with tooltips
        for (var b = 0; b < data.length; b++) {
            var barH = maxVal > 0 ? (data[b].value / maxVal) * svgH : 0;
            var bx = startX + b * (barW + gap);
            var by = svgH - barH;

            svg += '<rect class="stats-chart-bar" x="' + bx + '" y="' + by + '" width="' + barW + '" height="' + barH
                + '" rx="5" fill="url(#barGrad)" opacity="0.85" style="cursor:pointer;transition:opacity 0.2s,filter 0.2s;">'
                + '<title>' + data[b].label + ': ' + data[b].value + ' návštěv</title>'
                + '<animate attributeName="height" from="0" to="' + barH + '" dur="0.5s" fill="freeze"/>'
                + '<animate attributeName="y" from="' + svgH + '" to="' + by + '" dur="0.5s" fill="freeze"/>'
                + '</rect>';

            // Label
            var labelX = bx + barW / 2;
            svg += '<text x="' + labelX + '" y="' + (svgH + 16) + '" text-anchor="middle" fill="#64748b" font-size="10">' + data[b].label + '</text>';
        }

        svg += '<defs><linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">'
            + '<stop offset="0%" stop-color="#7dd3fc"/>'
            + '<stop offset="50%" stop-color="#38bdf8"/>'
            + '<stop offset="100%" stop-color="#0284c7"/>'
            + '</linearGradient></defs>';
        svg += '</svg>';

        container.innerHTML = svg;
    }

    function renderStatsMetrics(period) {
        var container = document.getElementById('statsMetrics');
        if (!container) return;

        // Favicon-style gradient circle icons
        var icons = [
            '<svg width="32" height="32" viewBox="0 0 32 32"><defs><linearGradient id="ig1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0ea5e9"/><stop offset="100%" stop-color="#06b6d4"/></linearGradient></defs><circle cx="16" cy="16" r="15" fill="url(#ig1)"/><path d="M8 16s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z" stroke="white" stroke-width="1.5" fill="none"/><circle cx="16" cy="16" r="2.5" fill="white"/></svg>',
            '<svg width="32" height="32" viewBox="0 0 32 32"><defs><linearGradient id="ig2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0ea5e9"/><stop offset="100%" stop-color="#06b6d4"/></linearGradient></defs><circle cx="16" cy="16" r="15" fill="url(#ig2)"/><rect x="10" y="8" width="12" height="16" rx="2" stroke="white" stroke-width="1.5" fill="none"/><line x1="13" y1="14" x2="19" y2="14" stroke="white" stroke-width="1.3"/><line x1="13" y1="17" x2="17" y2="17" stroke="white" stroke-width="1.3"/><line x1="13" y1="20" x2="18" y2="20" stroke="white" stroke-width="1.3"/></svg>',
            '<svg width="32" height="32" viewBox="0 0 32 32"><defs><linearGradient id="ig3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0ea5e9"/><stop offset="100%" stop-color="#06b6d4"/></linearGradient></defs><circle cx="16" cy="16" r="15" fill="url(#ig3)"/><path d="M10 22l5-5 3 3 4-5" stroke="white" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 14h4v4" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>',
            '<svg width="32" height="32" viewBox="0 0 32 32"><defs><linearGradient id="ig4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0ea5e9"/><stop offset="100%" stop-color="#06b6d4"/></linearGradient></defs><circle cx="16" cy="16" r="15" fill="url(#ig4)"/><circle cx="16" cy="16" r="7" stroke="white" stroke-width="1.5" fill="none"/><line x1="16" y1="11" x2="16" y2="16" stroke="white" stroke-width="1.5" stroke-linecap="round"/><line x1="16" y1="16" x2="19" y2="18" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>'
        ];

        var metrics;
        if (period === 'week') {
            metrics = [
                { value: '847', label: 'Návštěvy', change: '+12%', positive: true },
                { value: '2 341', label: 'Zobrazení', change: '+8%', positive: true },
                { value: '42%', label: 'Míra odchodů', change: '-3%', positive: true },
                { value: '2:34', label: 'Prům. čas', change: '+15s', positive: true }
            ];
        } else if (period === 'month') {
            metrics = [
                { value: '3 562', label: 'Návštěvy', change: '+18%', positive: true },
                { value: '9 847', label: 'Zobrazení', change: '+14%', positive: true },
                { value: '39%', label: 'Míra odchodů', change: '-5%', positive: true },
                { value: '2:48', label: 'Prům. čas', change: '+22s', positive: true }
            ];
        } else {
            metrics = [
                { value: '42 150', label: 'Návštěvy', change: '+45%', positive: true },
                { value: '118 920', label: 'Zobrazení', change: '+52%', positive: true },
                { value: '38%', label: 'Míra odchodů', change: '-8%', positive: true },
                { value: '3:02', label: 'Prům. čas', change: '+35s', positive: true }
            ];
        }

        var html = '';
        for (var i = 0; i < metrics.length; i++) {
            var m = metrics[i];
            var delay = (i * 0.08).toFixed(2);
            html += '<div class="stats-metric stats-metric-animate" style="animation-delay:' + delay + 's">'
                + '<div class="stats-metric-icon">' + icons[i] + '</div>'
                + '<div class="stats-metric-value">' + m.value + '</div>'
                + '<div class="stats-metric-label">' + m.label + '</div>'
                + '<div class="stats-metric-change ' + (m.positive ? 'positive' : 'negative') + '">' + m.change + '</div>'
                + '</div>';
        }
        container.innerHTML = html;
    }

    function renderTopPages() {
        var container = document.getElementById('statsTopPages');
        if (!container) return;

        var pages = [
            { name: 'Úvodní stránka', pct: 100 },
            { name: 'Služby', pct: 72 },
            { name: 'Ceník', pct: 58 },
            { name: 'Kontakt', pct: 45 },
            { name: 'Galerie', pct: 34 },
            { name: 'Novinky', pct: 28 },
            { name: 'O nás', pct: 22 }
        ];

        var html = '';
        for (var i = 0; i < pages.length; i++) {
            html += '<div class="stats-bar-item">'
                + '<div class="stats-bar-label">' + pages[i].name + '</div>'
                + '<div class="stats-bar-track"><div class="stats-bar-fill" style="width:' + pages[i].pct + '%"></div></div>'
                + '<div class="stats-bar-value">' + pages[i].pct + '%</div>'
                + '</div>';
        }
        container.innerHTML = html;
    }

    function renderContentStats() {
        var container = document.getElementById('statsContent');
        if (!container) return;

        var postCount = getPostsFromStorage().length;
        var galleryCount = 0;
        try {
            var gData = localStorage.getItem('aquaservis_gallery');
            galleryCount = gData ? JSON.parse(gData).length : 0;
        } catch (e) {}

        var items = [
            { name: 'Příspěvky (novinky)', value: postCount },
            { name: 'Obrázky v galerii', value: galleryCount },
            { name: 'Stránky webu', value: 10 },
            { name: 'Odběratelé novinek', value: 156 }
        ];

        var html = '';
        for (var i = 0; i < items.length; i++) {
            html += '<div class="stats-bar-item">'
                + '<div class="stats-bar-label">' + items[i].name + '</div>'
                + '<div class="stats-bar-track"><div class="stats-bar-fill" style="width:' + Math.min(100, items[i].value * 5) + '%"></div></div>'
                + '<div class="stats-bar-value">' + items[i].value + '</div>'
                + '</div>';
        }
        container.innerHTML = html;
    }

    function renderDeviceStats() {
        var container = document.getElementById('statsDevices');
        if (!container) return;

        var devices = [
            { name: 'Počítač', pct: 52 },
            { name: 'Mobil', pct: 38 },
            { name: 'Tablet', pct: 10 }
        ];

        var html = '';
        for (var i = 0; i < devices.length; i++) {
            html += '<div class="stats-bar-item">'
                + '<div class="stats-bar-label">' + devices[i].name + '</div>'
                + '<div class="stats-bar-track"><div class="stats-bar-fill" style="width:' + devices[i].pct + '%"></div></div>'
                + '<div class="stats-bar-value">' + devices[i].pct + '%</div>'
                + '</div>';
        }
        container.innerHTML = html;
    }

    function renderSourceStats() {
        var container = document.getElementById('statsSources');
        if (!container) return;

        var sources = [
            { name: 'Google', pct: 48 },
            { name: 'Přímé', pct: 25 },
            { name: 'Sociální sítě', pct: 15 },
            { name: 'Odkazy', pct: 12 }
        ];

        var html = '';
        for (var i = 0; i < sources.length; i++) {
            html += '<div class="stats-bar-item">'
                + '<div class="stats-bar-label">' + sources[i].name + '</div>'
                + '<div class="stats-bar-track"><div class="stats-bar-fill" style="width:' + sources[i].pct + '%"></div></div>'
                + '<div class="stats-bar-value">' + sources[i].pct + '%</div>'
                + '</div>';
        }
        container.innerHTML = html;
    }

    function renderAllStats(period) {
        currentStatsPeriod = period || 'week';
        renderStatsMetrics(currentStatsPeriod);
        renderTrafficChart(generateTrafficData(currentStatsPeriod));
        renderTopPages();
        renderContentStats();
        renderDeviceStats();
        renderSourceStats();
    }

    // Period selector event listeners
    var periodBtns = document.querySelectorAll('.stats-period-btn');
    periodBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            periodBtns.forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            renderAllStats(btn.getAttribute('data-period'));
        });
    });

    // Initial render
    renderAllStats('week');

    // ═══════════════════════════════════════════
    //  GALERIE — CRUD
    // ═══════════════════════════════════════════

    var GALLERY_KEY = 'aquaservis_gallery';

    function getGalleryFromStorage() {
        try {
            var data = localStorage.getItem(GALLERY_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    }

    function saveGalleryToStorage(items) {
        try {
            localStorage.setItem(GALLERY_KEY, JSON.stringify(items));
        } catch (e) {
            showAdminToast('Galerie je plná — nelze uložit další obrázky.', 'error');
        }
    }

    // ─── Static gallery images from galerie.html ───
    var STATIC_GALLERY_IMAGES = [
        { id: 's1', src: 'images/gallery/cisteni-02.jpg', alt: 'Hloubkové čištění dna bazénu', category: 'cisteni', source: 'static' },
        { id: 's2', src: 'images/gallery/cisteni-03.jpg', alt: 'Čištění stěn bazénu – odstranění řas', category: 'cisteni', source: 'static' },
        { id: 's3', src: 'images/gallery/cisteni-04.jpg', alt: 'Jarní zprovoznění bazénu – odzimování', category: 'cisteni', source: 'static' },
        { id: 's4', src: 'images/gallery/cisteni-05.jpg', alt: 'Sezónní příprava bazénu – čistá voda', category: 'cisteni', source: 'static' },
        { id: 's5', src: 'images/gallery/cisteni-06.jpg', alt: 'Servis filtrace a bazénové technologie', category: 'cisteni', source: 'static' },
        { id: 's6', src: 'images/gallery/cisteni-07.jpg', alt: 'Údržba bazénu v sezóně', category: 'cisteni', source: 'static' },
        { id: 's7', src: 'images/gallery/cisteni-08.jpg', alt: 'Výsledek profesionálního čištění bazénu', category: 'cisteni', source: 'static' },
        { id: 's8', src: 'images/gallery/bazen-01.jpg', alt: 'Realizace bazénu na klíč – výkop a montáž', category: 'bazeny', source: 'static' },
        { id: 's9', src: 'images/gallery/bazen-02.jpg', alt: 'Montáž plastového bazénu', category: 'bazeny', source: 'static' },
        { id: 's10', src: 'images/gallery/bazen-03.jpg', alt: 'Dokončený bazén v zahradě', category: 'bazeny', source: 'static' },
        { id: 's11', src: 'images/gallery/bazen-04.jpg', alt: 'Instalace bazénové technologie', category: 'bazeny', source: 'static' },
        { id: 's12', src: 'images/gallery/bazen-05.jpg', alt: 'Hotový bazén – naše realizace', category: 'bazeny', source: 'static' },
        { id: 's13', src: 'images/gallery/bazen-06.jpg', alt: 'Bazén na klíč – kompletní dodávka', category: 'bazeny', source: 'static' },
        { id: 's14', src: 'images/gallery/zastreseni-01.jpg', alt: 'Zastřešení bazénu Alukov – nízký profil', category: 'zastreseni', source: 'static' },
        { id: 's15', src: 'images/gallery/zastreseni-02.jpg', alt: 'Zastřešení bazénu – ochrana a komfort', category: 'zastreseni', source: 'static' },
        { id: 's16', src: 'images/gallery/zastreseni-03.jpg', alt: 'Nízké zastřešení bazénu Viva – antracit', category: 'zastreseni', source: 'static' },
        { id: 's17', src: 'images/gallery/zastreseni-04.jpg', alt: 'Zastřešení bazénu Imperia Neo – moderní design', category: 'zastreseni', source: 'static' },
        { id: 's18', src: 'images/gallery/zastreseni-07.jpg', alt: 'Zastřešení Azure Angle – kompaktní design', category: 'zastreseni', source: 'static' },
        { id: 's19', src: 'images/gallery/zastreseni-08.jpg', alt: 'Zastřešení Azure Flat – IR polykarbonát', category: 'zastreseni', source: 'static' },
        { id: 's20', src: 'images/gallery/zastreseni-09.jpg', alt: 'Zastřešení Azure Flat – kompaktní polykarbonát', category: 'zastreseni', source: 'static' },
        { id: 's21', src: 'images/gallery/bazen-install-06.jpg', alt: 'Plastový bazén po instalaci – napuštěný a připravený', category: 'realizace', source: 'static' },
        { id: 's22', src: 'images/gallery/bazen-install-07.jpg', alt: 'Stavba bazénu – příprava základů', category: 'realizace', source: 'static' },
        { id: 's23', src: 'images/gallery/bazen-install-08.jpg', alt: 'Bazén – přípravné práce', category: 'realizace', source: 'static' },
        { id: 's24', src: 'images/gallery/bazen-install-09.jpg', alt: 'Výkop pro bazén – zemní práce', category: 'realizace', source: 'static' },
        { id: 's25', src: 'images/gallery/bazen-install-10.jpg', alt: 'Osazení plastového bazénu do výkopu', category: 'realizace', source: 'static' },
        { id: 's26', src: 'images/gallery/bazen-install-12.jpg', alt: 'Napouštění dokončeného bazénu', category: 'realizace', source: 'static' },
        { id: 's27', src: 'images/gallery/bazen-install-13.jpg', alt: 'Hotový bazén s úpravou okolí', category: 'realizace', source: 'static' },
        { id: 's28', src: 'images/gallery/bazen-install-14.jpg', alt: 'Instalace bazénové technologie – filtrace', category: 'realizace', source: 'static' },
        { id: 's29', src: 'images/gallery/bazen-install-15.jpg', alt: 'Příprava bazénového skeletu', category: 'realizace', source: 'static' },
        { id: 's30', src: 'images/gallery/bazen-install-16.jpg', alt: 'Bazén na klíč – finální realizace', category: 'realizace', source: 'static' },
        { id: 's31', src: 'images/gallery/bazen-install-17.jpg', alt: 'Montáž bazénu – pokládání technologie', category: 'realizace', source: 'static' },
        { id: 's32', src: 'images/gallery/bazen-install-18.jpg', alt: 'Dokončený bazén – boční pohled', category: 'realizace', source: 'static' },
        { id: 's33', src: 'images/gallery/bazen-install-19.jpg', alt: 'Instalace bazénu – betonáž a výztuž', category: 'realizace', source: 'static' },
        { id: 's34', src: 'images/gallery/bazen-install-20.jpg', alt: 'Bazén – detail technického zázemí', category: 'realizace', source: 'static' },
        { id: 's35', src: 'images/gallery/bazen-install-21.jpg', alt: 'Bazén se zastřešením – kompletní dodávka', category: 'realizace', source: 'static' },
        { id: 's36', src: 'images/gallery/bazen-install-22.jpg', alt: 'Hotový bazén – přední pohled', category: 'realizace', source: 'static' },
        { id: 's37', src: 'images/gallery/bazen-install-23.jpg', alt: 'Instalace bazénu – zadní pohled', category: 'realizace', source: 'static' },
        { id: 's38', src: 'images/gallery/bazen-install-24.jpg', alt: 'Bazén s okolní terasou – realizace', category: 'realizace', source: 'static' },
        { id: 's39', src: 'images/gallery/bazen-install-25.jpg', alt: 'Dokončená realizace bazénu v zahradě', category: 'realizace', source: 'static' },
        { id: 's40', src: 'images/gallery/bazen-install-26.jpg', alt: 'Kompletní bazén na klíč – finální stav', category: 'realizace', source: 'static' },
        { id: 's41', src: 'images/gallery/cov-01.png', alt: 'Čistírna odpadních vod – konstrukce nádrže', category: 'vodni-hospodarstvi', source: 'static' },
        { id: 's42', src: 'images/gallery/cov-02.png', alt: 'Čistírna odpadních vod – kompresor a ventily', category: 'vodni-hospodarstvi', source: 'static' },
        { id: 's43', src: 'images/gallery/cov-03.png', alt: 'Čistírna odpadních vod – vzduchové ventily', category: 'vodni-hospodarstvi', source: 'static' },
        { id: 's44', src: 'images/gallery/cov-04.png', alt: 'Čistírna odpadních vod – detail dmychadla', category: 'vodni-hospodarstvi', source: 'static' },
        { id: 's45', src: 'images/gallery/ekocis-01.jpg', alt: 'Ekocis – plastová jímka výroba', category: 'vodni-hospodarstvi', source: 'static' },
        { id: 's46', src: 'images/gallery/ekocis-02.jpg', alt: 'Ekocis – plastové nádrže ve výrobě', category: 'vodni-hospodarstvi', source: 'static' },
        { id: 's47', src: 'images/gallery/ekocis-03.jpg', alt: 'Ekocis – vodoměrná šachta', category: 'vodni-hospodarstvi', source: 'static' },
        { id: 's48', src: 'images/gallery/ekocis-04.jpg', alt: 'Ekocis – septik a potrubí', category: 'vodni-hospodarstvi', source: 'static' },
        { id: 's49', src: 'images/gallery/ekocis-05.jpg', alt: 'Ekocis – retenční nádrž', category: 'vodni-hospodarstvi', source: 'static' },
        { id: 's50', src: 'images/gallery/ekocis-06.jpg', alt: 'Ekocis – detail plastové nádrže', category: 'vodni-hospodarstvi', source: 'static' },
        { id: 's51', src: 'images/gallery/ekocis-07.jpg', alt: 'Ekocis – skladování nádrží', category: 'vodni-hospodarstvi', source: 'static' },
        { id: 's52', src: 'images/gallery/ekocis-08.jpg', alt: 'Ekocis – výrobní hala s nádržemi', category: 'vodni-hospodarstvi', source: 'static' },
        { id: 's53', src: 'images/gallery/ekocis-09.jpg', alt: 'Ekocis – přepravní příprava nádrží', category: 'vodni-hospodarstvi', source: 'static' },
        { id: 's54', src: 'images/gallery/ekocis-10.jpg', alt: 'Ekocis – hotové nádrže k expedici', category: 'vodni-hospodarstvi', source: 'static' }
    ];

    var CATEGORY_LABELS = {
        'cisteni': 'Čištění',
        'bazeny': 'Bazény',
        'zastreseni': 'Zastřešení',
        'realizace': 'Realizace',
        'vodni-hospodarstvi': 'Vodní hospodářství'
    };

    var currentGalleryFilter = 'all';

    function getAllGalleryItems() {
        var uploaded = getGalleryFromStorage();
        // Mark uploaded items
        for (var i = 0; i < uploaded.length; i++) {
            uploaded[i].source = 'uploaded';
        }
        // Merge: check for alt text overrides in localStorage
        var altOverrides = {};
        try {
            var stored = localStorage.getItem('aquaservis_gallery_alts');
            if (stored) altOverrides = JSON.parse(stored);
        } catch(e) {}

        var staticItems = STATIC_GALLERY_IMAGES.map(function(item) {
            var copy = { id: item.id, src: item.src, alt: altOverrides[item.src] || item.alt, category: item.category, source: 'static' };
            return copy;
        });

        return staticItems.concat(uploaded);
    }

    function generateSEOAlt(category, fileName) {
        var catLabel = CATEGORY_LABELS[category] || category;
        var templates = {
            'cisteni': 'Profesionální čištění bazénu – {detail} | AquaServis Praha',
            'bazeny': 'Realizace bazénu – {detail} | AquaServis Praha',
            'zastreseni': 'Zastřešení bazénu – {detail} | AquaServis Praha',
            'realizace': 'Montáž a instalace bazénu – {detail} | AquaServis Praha',
            'vodni-hospodarstvi': 'Vodní hospodářství – {detail} | AquaServis Praha'
        };
        var detail = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').replace(/\d+/g, '').trim();
        if (!detail) detail = catLabel.toLowerCase();
        var template = templates[category] || '{detail} | AquaServis Praha';
        return template.replace('{detail}', detail.charAt(0).toUpperCase() + detail.slice(1));
    }

    function renderAdminGallery() {
        var grid = document.getElementById('adminGalleryGrid');
        var countEl = document.getElementById('galleryCount');
        if (!grid) return;

        var allItems = getAllGalleryItems();
        var items = currentGalleryFilter === 'all' ? allItems : allItems.filter(function(item) {
            return item.category === currentGalleryFilter;
        });

        var total = allItems.length;
        var filtered = items.length;
        if (countEl) {
            var suffix = total === 1 ? '' : total < 5 ? 'y' : 'ů';
            countEl.textContent = (currentGalleryFilter === 'all' ? total : filtered + ' / ' + total) + ' obrázk' + suffix;
        }

        // Update filter counts
        var filterBtns = document.querySelectorAll('.admin-gallery-filter-btn');
        filterBtns.forEach(function(btn) {
            var f = btn.getAttribute('data-filter');
            if (f === 'all') return;
            var count = allItems.filter(function(item) { return item.category === f; }).length;
            var label = btn.textContent.replace(/\s*\(\d+\)/, '');
            btn.textContent = label + ' (' + count + ')';
        });

        if (items.length === 0) {
            grid.innerHTML = '<div class="admin-gallery-empty" style="padding:2rem;text-align:center;color:#64748b;">Žádné obrázky v této kategorii.</div>';
            return;
        }

        var html = '';
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var isStatic = item.source === 'static';
            html += '<div class="admin-gallery-item" data-gallery-src="' + escapeHTML(item.src) + '">'
                + '<img src="' + escapeHTML(item.src) + '" alt="' + escapeHTML(item.alt || '') + '" loading="lazy">'
                + (item.alt && item.alt.indexOf('AquaServis') > -1 ? '<span class="admin-gallery-seo-badge">SEO</span>' : '')
                + '<div class="admin-gallery-overlay">'
                + '<div class="admin-gallery-overlay-cat">' + escapeHTML(CATEGORY_LABELS[item.category] || item.category) + '</div>'
                + '<div class="admin-gallery-overlay-text">' + escapeHTML(item.alt || 'Bez popisu') + '</div>'
                + '<div class="admin-gallery-actions">'
                + '<button class="admin-gallery-action-btn admin-gallery-action-btn--edit" data-gallery-edit="' + escapeHTML(item.id) + '" title="Upravit popis">'
                + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>'
                + '</button>'
                + (isStatic ? '' : '<button class="admin-gallery-action-btn admin-gallery-action-btn--delete" data-gallery-id="' + item.id + '" title="Odebrat">'
                + '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'
                + '</button>')
                + '</div>'
                + '</div>'
                + '</div>';
        }
        grid.innerHTML = html;
    }

    // Gallery upload handler
    var galleryUploadBtn = document.getElementById('galleryUploadBtn');
    var galleryFileInput = document.getElementById('galleryFileInput');
    var galleryPreview = document.getElementById('galleryPreview');
    var galleryPreviewImg = document.getElementById('galleryPreviewImg');
    var galleryFileName = document.getElementById('galleryFileName');
    var galleryAddBtn = document.getElementById('galleryAddBtn');
    var galleryBase64 = '';

    if (galleryUploadBtn && galleryFileInput) {
        galleryUploadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            galleryFileInput.click();
        });
        galleryFileInput.addEventListener('change', function() {
            if (!this.files || !this.files[0]) return;
            var file = this.files[0];
            if (galleryFileName) galleryFileName.textContent = file.name;
            compressImage(file, 1200, 0.65, function(base64) {
                galleryBase64 = base64;
                if (galleryPreviewImg) galleryPreviewImg.src = base64;
                if (galleryPreview) galleryPreview.style.display = '';
            });
        });
    }

    if (galleryAddBtn) {
        galleryAddBtn.addEventListener('click', function() {
            if (!galleryBase64) {
                showAdminToast('Vyberte obrázek.', 'error');
                return;
            }
            var altEl = document.getElementById('galleryAlt');
            var catEl = document.getElementById('galleryCategory');
            var items = getGalleryFromStorage();
            var maxId = 0;
            for (var i = 0; i < items.length; i++) {
                if (items[i].id > maxId) maxId = items[i].id;
            }
            var altText = altEl ? altEl.value.trim() : '';
            var category = catEl ? catEl.value : 'realizace';
            // Auto-generate SEO alt if empty
            if (!altText) {
                var fileName = galleryFileName ? galleryFileName.textContent : 'image';
                altText = generateSEOAlt(category, fileName);
            }
            items.push({
                id: maxId + 1,
                src: galleryBase64,
                alt: altText,
                category: category,
                createdAt: new Date().toISOString(),
                source: 'uploaded'
            });
            saveGalleryToStorage(items);
            renderAdminGallery();
            showAdminToast('Obrázek přidán s SEO optimalizací!', 'success');

            // Reset form
            galleryBase64 = '';
            if (galleryFileInput) galleryFileInput.value = '';
            if (galleryPreview) galleryPreview.style.display = 'none';
            if (galleryPreviewImg) galleryPreviewImg.src = '';
            if (galleryFileName) galleryFileName.textContent = '';
            if (altEl) altEl.value = '';
            if (catEl) catEl.value = 'realizace';
        });
    }

    // Gallery filter buttons
    var galleryFilterContainer = document.getElementById('adminGalleryFilter');
    if (galleryFilterContainer) {
        galleryFilterContainer.addEventListener('click', function(e) {
            var btn = e.target.closest('.admin-gallery-filter-btn');
            if (!btn) return;
            currentGalleryFilter = btn.getAttribute('data-filter') || 'all';
            galleryFilterContainer.querySelectorAll('.admin-gallery-filter-btn').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            renderAdminGallery();
        });
    }

    // Gallery delete + edit via delegation
    var galleryGrid = document.getElementById('adminGalleryGrid');
    if (galleryGrid) {
        galleryGrid.addEventListener('click', function(e) {
            // Delete handler
            var deleteBtn = e.target.closest('.admin-gallery-action-btn--delete');
            if (deleteBtn) {
                var id = parseInt(deleteBtn.getAttribute('data-gallery-id'));
                if (isNaN(id)) return;
                if (!confirm('Opravdu chcete odebrat tento obrázek?')) return;
                var items = getGalleryFromStorage();
                items = items.filter(function(item) { return item.id !== id; });
                saveGalleryToStorage(items);
                renderAdminGallery();
                showAdminToast('Obrázek odebrán.', 'success');
                return;
            }

            // Edit handler
            var editBtn = e.target.closest('.admin-gallery-action-btn--edit');
            if (editBtn) {
                var editId = editBtn.getAttribute('data-gallery-edit');
                var allItems = getAllGalleryItems();
                var editItem = null;
                for (var i = 0; i < allItems.length; i++) {
                    if (String(allItems[i].id) === String(editId)) { editItem = allItems[i]; break; }
                }
                if (!editItem) return;
                showGalleryEditModal(editItem);
            }
        });
    }

    function showGalleryEditModal(item) {
        var existing = document.querySelector('.admin-gallery-edit-modal');
        if (existing) existing.remove();

        var modal = document.createElement('div');
        modal.className = 'admin-gallery-edit-modal';
        modal.innerHTML = '<div class="admin-gallery-edit-content">'
            + '<h3 style="color:#f8fafc;margin-bottom:1rem;">Upravit popis obrázku</h3>'
            + '<div style="margin-bottom:1rem;border-radius:0.5rem;overflow:hidden;max-height:200px;"><img src="' + escapeHTML(item.src) + '" style="width:100%;height:auto;display:block;object-fit:cover;" alt=""></div>'
            + '<div class="admin-form-group"><label>Popis (alt text)</label>'
            + '<input type="text" id="editGalleryAlt" value="' + escapeHTML(item.alt || '') + '" maxlength="200" style="width:100%;"></div>'
            + '<div style="display:flex;gap:0.75rem;margin-top:1rem;">'
            + '<button class="admin-newsletter-btn" id="editGallerySave">Uložit</button>'
            + '<button class="admin-newsletter-btn" id="editGalleryCancel" style="background:rgba(148,163,184,0.15);color:#94a3b8;border-color:rgba(148,163,184,0.2);">Zrušit</button>'
            + '</div></div>';
        document.body.appendChild(modal);

        document.getElementById('editGalleryCancel').addEventListener('click', function() { modal.remove(); });
        modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });

        document.getElementById('editGallerySave').addEventListener('click', function() {
            var newAlt = document.getElementById('editGalleryAlt').value.trim();
            if (item.source === 'static') {
                // Save alt override in localStorage
                var altOverrides = {};
                try {
                    var stored = localStorage.getItem('aquaservis_gallery_alts');
                    if (stored) altOverrides = JSON.parse(stored);
                } catch(e) {}
                altOverrides[item.src] = newAlt;
                try { localStorage.setItem('aquaservis_gallery_alts', JSON.stringify(altOverrides)); } catch(e) {}
            } else {
                // Update uploaded item
                var items = getGalleryFromStorage();
                for (var i = 0; i < items.length; i++) {
                    if (items[i].id === item.id) { items[i].alt = newAlt; break; }
                }
                saveGalleryToStorage(items);
            }
            modal.remove();
            renderAdminGallery();
            showAdminToast('Popis obrázku aktualizován.', 'success');
        });
    }

    // ═══════════════════════════════════════════
    //  CUSTOMERS — DATA & DETAIL PANEL
    // ═══════════════════════════════════════════

    var CUSTOMERS_DATA = [
        { id: 1, name: 'Martin Novák', email: 'martin.novak@email.cz', phone: '+420 607 241 001', address: 'Zahradní 15, Praha 4', newsletter: true, status: 'Aktivní', lastActivity: '5. 3. 2026', registered: '12. 1. 2024', note: 'Celoroční zákazník, preferuje ranní termíny.' },
        { id: 2, name: 'Jana Svobodová', email: 'jana.s@email.cz', phone: '+420 608 332 112', address: 'Lipová 8, Praha 6', newsletter: true, status: 'Aktivní', lastActivity: '4. 3. 2026', registered: '3. 5. 2024', note: 'Bazén 8x4m, filtrace Hayward.' },
        { id: 3, name: 'Petr Dvořák', email: 'petr.dvorak@email.cz', phone: '+420 773 445 220', address: 'U Lesa 22, Říčany', newsletter: false, status: 'Aktivní', lastActivity: '3. 3. 2026', registered: '18. 3. 2025', note: '' },
        { id: 4, name: 'Lucie Horáková', email: 'lucie.h@email.cz', phone: '+420 602 789 003', address: 'Květinová 3, Černošice', newsletter: true, status: 'Čekající', lastActivity: '1. 3. 2026', registered: '20. 2. 2026', note: 'Zájem o bazén na klíč.' },
        { id: 5, name: 'Tomáš Marek', email: 't.marek@firma.cz', phone: '+420 604 112 987', address: 'Průmyslová 44, Beroun', newsletter: false, status: 'Neaktivní', lastActivity: '15. 11. 2025', registered: '1. 6. 2024', note: 'Firemní bazén, fakturace na IČ.' }
    ];

    var ORDERS_KEY = 'aquaservis_orders';
    var INVOICES_KEY = 'aquaservis_invoices';

    var DEFAULT_ORDERS = [
        { id: 'AQ-2026-047', customerId: 1, service: 'Pravidelné čištění bazénu', date: '5. 3. 2026', status: 'Dokončeno', price: 3200 },
        { id: 'AQ-2026-046', customerId: 2, service: 'Servis filtrace + úprava vody', date: '4. 3. 2026', status: 'V realizaci', price: 4800 },
        { id: 'AQ-2026-045', customerId: 3, service: 'Jarní zprovoznění', date: '3. 3. 2026', status: 'Dokončeno', price: 3500 },
        { id: 'AQ-2026-044', customerId: 4, service: 'Bazén na klíč — konzultace', date: '1. 3. 2026', status: 'Čeká na schválení', price: 285000 },
        { id: 'AQ-2026-043', customerId: 5, service: 'Zazimování bazénu', date: '28. 10. 2025', status: 'Dokončeno', price: 4200 }
    ];

    var DEFAULT_INVOICES = [
        { id: 'FV-2026-031', customerId: 1, date: '5. 3. 2026', amount: 3200, description: 'Pravidelné čištění bazénu — březen', status: 'Zaplaceno' },
        { id: 'FV-2026-030', customerId: 2, date: '4. 3. 2026', amount: 4800, description: 'Servis filtrace + úprava vody', status: 'Nezaplaceno' },
        { id: 'FV-2026-029', customerId: 3, date: '3. 3. 2026', amount: 3500, description: 'Jarní zprovoznění bazénu', status: 'Zaplaceno' },
        { id: 'FV-2026-028', customerId: 5, date: '28. 10. 2025', amount: 4200, description: 'Zazimování bazénu — podzim 2025', status: 'Zaplaceno' }
    ];

    function getOrdersData() {
        try {
            var stored = localStorage.getItem(ORDERS_KEY);
            if (stored) return JSON.parse(stored);
        } catch(e) {}
        return DEFAULT_ORDERS.slice();
    }
    function saveOrdersData(data) {
        try { localStorage.setItem(ORDERS_KEY, JSON.stringify(data)); } catch(e) {}
    }
    function getInvoicesData() {
        try {
            var stored = localStorage.getItem(INVOICES_KEY);
            if (stored) return JSON.parse(stored);
        } catch(e) {}
        return DEFAULT_INVOICES.slice();
    }
    function saveInvoicesData(data) {
        try { localStorage.setItem(INVOICES_KEY, JSON.stringify(data)); } catch(e) {}
    }

    // ─── Render orders list (full panel) ───
    function renderOrdersList() {
        var container = document.getElementById('ordersListContainer');
        if (!container) return;
        var orders = getOrdersData();
        if (orders.length === 0) {
            container.innerHTML = '<div style="padding:2rem;text-align:center;color:#64748b;">Žádné objednávky</div>';
            return;
        }
        var html = '';
        orders.forEach(function(o) {
            var customer = CUSTOMERS_DATA.find(function(c) { return c.id === o.customerId; });
            var customerName = customer ? customer.name : 'Neznámý';
            var badgeClass = o.status === 'Dokončeno' ? 'admin-badge-active' : (o.status === 'V realizaci' ? 'admin-badge-pending' : 'admin-badge-warning');
            html += '<div class="admin-order-item admin-order-clickable" data-order-id="' + o.id + '">';
            html += '  <div class="admin-order-info">';
            html += '    <strong>' + o.id + '</strong> &mdash; ' + customerName;
            html += '    <p>' + o.service + ' &middot; ' + o.date + '</p>';
            html += '  </div>';
            html += '  <span class="admin-badge ' + badgeClass + '">' + o.status + '</span>';
            html += '  <span class="admin-order-price">' + o.price.toLocaleString('cs-CZ') + ' Kč</span>';
            html += '</div>';
            // Detail panel (hidden by default)
            html += '<div class="admin-order-detail" data-detail-for="' + o.id + '">';
            html += '  <div class="admin-order-detail-grid">';
            html += '    <div class="admin-order-detail-item"><span class="admin-order-detail-label">Zákazník</span><span class="admin-order-detail-value">' + customerName + '</span></div>';
            html += '    <div class="admin-order-detail-item"><span class="admin-order-detail-label">E-mail</span><span class="admin-order-detail-value">' + (customer ? customer.email : '—') + '</span></div>';
            html += '    <div class="admin-order-detail-item"><span class="admin-order-detail-label">Telefon</span><span class="admin-order-detail-value">' + (customer ? customer.phone : '—') + '</span></div>';
            html += '    <div class="admin-order-detail-item"><span class="admin-order-detail-label">Adresa</span><span class="admin-order-detail-value">' + (customer ? customer.address : '—') + '</span></div>';
            html += '    <div class="admin-order-detail-item"><span class="admin-order-detail-label">Služba</span><span class="admin-order-detail-value">' + o.service + '</span></div>';
            html += '    <div class="admin-order-detail-item"><span class="admin-order-detail-label">Datum</span><span class="admin-order-detail-value">' + o.date + '</span></div>';
            html += '    <div class="admin-order-detail-item"><span class="admin-order-detail-label">Stav</span><span class="admin-order-detail-value"><span class="admin-badge ' + badgeClass + '">' + o.status + '</span></span></div>';
            html += '    <div class="admin-order-detail-item"><span class="admin-order-detail-label">Cena</span><span class="admin-order-detail-value" style="font-size:1rem;font-weight:700;color:#38bdf8;">' + o.price.toLocaleString('cs-CZ') + ' Kč</span></div>';
            html += '    <div class="admin-order-detail-item"><span class="admin-order-detail-label">Poznámka</span><span class="admin-order-detail-value">' + (customer && customer.note ? customer.note : '—') + '</span></div>';
            html += '  </div>';
            html += '</div>';
        });
        container.innerHTML = html;
    }

    // ─── Order click handler (expand/collapse detail in orders panel) ───
    var ordersContainer = document.getElementById('ordersListContainer');
    if (ordersContainer) {
        ordersContainer.addEventListener('click', function(e) {
            var row = e.target.closest('.admin-order-clickable');
            if (!row) return;
            var orderId = row.getAttribute('data-order-id');
            if (!orderId) return;
            var detail = ordersContainer.querySelector('.admin-order-detail[data-detail-for="' + orderId + '"]');
            if (!detail) return;
            var wasVisible = detail.classList.contains('visible');
            // Collapse all details
            ordersContainer.querySelectorAll('.admin-order-detail.visible').forEach(function(d) {
                d.classList.remove('visible');
            });
            // Toggle the clicked one
            if (!wasVisible) {
                detail.classList.add('visible');
            }
        });
    }

    // ─── Dashboard order click → navigate to Orders panel and expand ───
    var dashboardOrders = document.querySelectorAll('#panelDashboard .admin-order-clickable[data-order-id]');
    dashboardOrders.forEach(function(item) {
        item.addEventListener('click', function() {
            var orderId = this.getAttribute('data-order-id');
            // Navigate to Orders panel
            var navBtn = document.querySelector('.admin-nav-item[data-panel="panelOrders"]');
            if (navBtn) navBtn.click();
            // After panel switch, expand the specific order
            setTimeout(function() {
                var detail = document.querySelector('#ordersListContainer .admin-order-detail[data-detail-for="' + orderId + '"]');
                if (detail) {
                    // Collapse all first
                    document.querySelectorAll('#ordersListContainer .admin-order-detail.visible').forEach(function(d) {
                        d.classList.remove('visible');
                    });
                    detail.classList.add('visible');
                    detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 100);
        });
    });

    // ─── "Zobrazit vše" link buttons ───
    var linkBtns = document.querySelectorAll('.admin-link-btn[data-goto]');
    linkBtns.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            var target = this.getAttribute('data-goto');
            if (!target) return;
            var navBtn = document.querySelector('.admin-nav-item[data-panel="' + target + '"]');
            if (navBtn) navBtn.click();
        });
    });

    // ─── Render customers list (div-based) ───
    function renderCustomersTable() {
        var container = document.getElementById('customersListContainer');
        if (!container) return;
        // Before re-rendering, detach the detail panel so it doesn't get destroyed
        var detailPanel = document.getElementById('customerDetail');
        if (detailPanel && detailPanel.parentNode === container) {
            document.getElementById('panelCustomers').appendChild(detailPanel);
            detailPanel.style.display = 'none';
        }
        container.innerHTML = '';
        CUSTOMERS_DATA.forEach(function(c) {
            var badgeClass = c.status === 'Aktivní' ? 'admin-badge-active' : (c.status === 'Čekající' ? 'admin-badge-pending' : 'admin-badge-inactive');
            var nlBadge = c.newsletter
                ? '<span class="customer-newsletter-yes">✅ Ano</span>'
                : '<span class="customer-newsletter-no">❌ Ne</span>';
            var row = document.createElement('div');
            row.className = 'customer-row';
            row.setAttribute('data-customer-id', c.id);
            row.innerHTML =
                '<span class="customer-col">' + c.name + '</span>' +
                '<span class="customer-col customer-col-email">' + c.email + '</span>' +
                '<span class="customer-col">' + nlBadge + '</span>' +
                '<span class="customer-col"><span class="admin-badge ' + badgeClass + '">' + c.status + '</span></span>' +
                '<span class="customer-col customer-col-activity">' + c.lastActivity + '</span>';
            container.appendChild(row);
        });
    }

    // ─── Customer click handler ───
    var activeCustomerId = null;

    var customersListContainer = document.getElementById('customersListContainer');
    if (customersListContainer) {
        customersListContainer.addEventListener('click', function(e) {
            var row = e.target.closest('.customer-row');
            if (!row) return;
            // Ignore clicks inside the detail panel
            if (e.target.closest('.customer-detail-panel')) return;
            var id = parseInt(row.getAttribute('data-customer-id'));
            if (isNaN(id)) return;
            handleCustomerClick(id, row);
        });
    }

    function handleCustomerClick(customerId, clickedRow) {
        var detailPanel = document.getElementById('customerDetail');
        if (!detailPanel) return;

        // If clicking the same customer that's already open, close it
        if (activeCustomerId === customerId && detailPanel.style.display !== 'none') {
            detailPanel.style.display = 'none';
            activeCustomerId = null;
            // Remove active highlight
            var prevActive = document.querySelector('.customer-row.active');
            if (prevActive) prevActive.classList.remove('active');
            return;
        }

        activeCustomerId = customerId;
        var customer = CUSTOMERS_DATA.find(function(c) { return c.id === customerId; });
        if (!customer) return;

        var nameEl = document.getElementById('customerDetailName');
        var gridEl = document.getElementById('customerDetailGrid');

        if (nameEl) nameEl.textContent = customer.name;

        // Info grid
        var nlLabel = customer.newsletter
            ? '<span class="customer-newsletter-yes">✅ Odběratel</span>'
            : '<span class="customer-newsletter-no">❌ Neodebírá</span>';
        if (gridEl) {
            gridEl.innerHTML =
                '<div class="customer-detail-item"><span class="customer-detail-label">E-mail</span><span class="customer-detail-value">' + customer.email + '</span></div>' +
                '<div class="customer-detail-item"><span class="customer-detail-label">Telefon</span><span class="customer-detail-value">' + customer.phone + '</span></div>' +
                '<div class="customer-detail-item"><span class="customer-detail-label">Adresa</span><span class="customer-detail-value">' + customer.address + '</span></div>' +
                '<div class="customer-detail-item"><span class="customer-detail-label">Newsletter</span><span class="customer-detail-value">' + nlLabel + '</span></div>' +
                '<div class="customer-detail-item"><span class="customer-detail-label">Registrace</span><span class="customer-detail-value">' + customer.registered + '</span></div>' +
                '<div class="customer-detail-item"><span class="customer-detail-label">Poznámka</span><span class="customer-detail-value">' + (customer.note || '—') + '</span></div>';
        }

        // Render orders for this customer
        renderCustomerOrders(customerId);
        renderCustomerInvoices(customerId);

        // Hide forms
        var orderForm = document.getElementById('assignOrderForm');
        var invoiceForm = document.getElementById('createInvoiceForm');
        if (orderForm) orderForm.style.display = 'none';
        if (invoiceForm) invoiceForm.style.display = 'none';

        // Remove active class from previous row
        var prevActive = document.querySelector('.customer-row.active');
        if (prevActive) prevActive.classList.remove('active');

        // Find the clicked row and insert the detail panel right after it
        var targetRow = clickedRow || document.querySelector('.customer-row[data-customer-id="' + customerId + '"]');
        if (targetRow) {
            targetRow.classList.add('active');
            // Insert detail panel after the clicked row
            targetRow.parentNode.insertBefore(detailPanel, targetRow.nextSibling);
        }

        // Show detail with animation
        detailPanel.style.display = '';

        // Scroll to detail
        detailPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function renderCustomerOrders(customerId) {
        var container = document.getElementById('customerOrdersList');
        if (!container) return;
        var orders = getOrdersData().filter(function(o) { return o.customerId === customerId; });
        if (orders.length === 0) {
            container.innerHTML = '<div class="customer-detail-empty">Žádné objednávky</div>';
            return;
        }
        var html = '<table class="customer-detail-table"><thead><tr><th>ID</th><th>Služba</th><th>Datum</th><th>Status</th><th>Cena</th></tr></thead><tbody>';
        orders.forEach(function(o) {
            var badge = o.status === 'Dokončeno' ? 'admin-badge-active' : (o.status === 'V realizaci' ? 'admin-badge-pending' : 'admin-badge-warning');
            html += '<tr><td>' + o.id + '</td><td>' + o.service + '</td><td>' + o.date + '</td><td><span class="admin-badge ' + badge + '">' + o.status + '</span></td><td>' + o.price.toLocaleString('cs-CZ') + ' Kč</td></tr>';
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    }

    function renderCustomerInvoices(customerId) {
        var container = document.getElementById('customerInvoicesList');
        if (!container) return;
        var invoices = getInvoicesData().filter(function(inv) { return inv.customerId === customerId; });
        if (invoices.length === 0) {
            container.innerHTML = '<div class="customer-detail-empty">Žádné faktury</div>';
            return;
        }
        var html = '<table class="customer-detail-table"><thead><tr><th>Č. faktury</th><th>Datum</th><th>Částka</th><th>Stav</th><th>Popis</th></tr></thead><tbody>';
        invoices.forEach(function(inv) {
            var badge = inv.status === 'Zaplaceno' ? 'invoice-badge-paid' : 'invoice-badge-unpaid';
            html += '<tr><td>' + inv.id + '</td><td>' + inv.date + '</td><td>' + inv.amount.toLocaleString('cs-CZ') + ' Kč</td><td><span class="' + badge + '">' + inv.status + '</span></td><td>' + inv.description + '</td></tr>';
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    }

    // Close detail
    var closeDetailBtn = document.getElementById('customerDetailClose');
    if (closeDetailBtn) {
        closeDetailBtn.addEventListener('click', function() {
            var detailPanel = document.getElementById('customerDetail');
            if (detailPanel) detailPanel.style.display = 'none';
            activeCustomerId = null;
        });
    }

    // ─── Assign Order ───
    var assignOrderBtn = document.getElementById('assignOrderBtn');
    var assignOrderForm = document.getElementById('assignOrderForm');
    var assignOrderCancel = document.getElementById('assignOrderCancel');
    var assignOrderSubmit = document.getElementById('assignOrderSubmit');

    if (assignOrderBtn) {
        assignOrderBtn.addEventListener('click', function() {
            if (assignOrderForm) assignOrderForm.style.display = '';
        });
    }
    if (assignOrderCancel) {
        assignOrderCancel.addEventListener('click', function() {
            if (assignOrderForm) assignOrderForm.style.display = 'none';
        });
    }
    if (assignOrderSubmit) {
        assignOrderSubmit.addEventListener('click', function() {
            if (!activeCustomerId) return;
            var service = document.getElementById('newOrderService').value;
            var price = parseInt(document.getElementById('newOrderPrice').value) || 0;
            var status = document.getElementById('newOrderStatus').value;
            if (!service || price <= 0) {
                showAdminToast('Vyplňte službu a cenu.', 'error');
                return;
            }
            var orders = getOrdersData();
            var nextNum = 48;
            orders.forEach(function(o) {
                var match = o.id.match(/AQ-2026-(\d+)/);
                if (match) { var n = parseInt(match[1]); if (n >= nextNum) nextNum = n + 1; }
            });
            var newOrder = {
                id: 'AQ-2026-' + String(nextNum).padStart(3, '0'),
                customerId: activeCustomerId,
                service: service,
                date: new Date().toLocaleDateString('cs-CZ'),
                status: status,
                price: price
            };
            orders.unshift(newOrder);
            saveOrdersData(orders);

            // Auto-create invoice for this order
            var invoices = getInvoicesData();
            var nextInvNum = 32;
            invoices.forEach(function(inv) {
                var match = inv.id.match(/FV-2026-(\d+)/);
                if (match) { var n = parseInt(match[1]); if (n >= nextInvNum) nextInvNum = n + 1; }
            });
            var newInvoice = {
                id: 'FV-2026-' + String(nextInvNum).padStart(3, '0'),
                customerId: activeCustomerId,
                date: new Date().toLocaleDateString('cs-CZ'),
                amount: price,
                description: service,
                status: 'Nezaplaceno'
            };
            invoices.unshift(newInvoice);
            saveInvoicesData(invoices);

            // Simulate email notification
            var customer = CUSTOMERS_DATA.find(function(c) { return c.id === activeCustomerId; });
            var customerEmail = customer ? customer.email : 'neznámý';
            var customerName = customer ? customer.name : 'Zákazník';
            console.log('📧 E-mail odeslán na: ' + customerEmail);
            console.log('   Předmět: Nová objednávka ' + newOrder.id + ' — ' + service);
            console.log('   Zpráva: Dobrý den ' + customerName + ', vaše objednávka ' + newOrder.id + ' (' + service + ') byla vytvořena. Cena: ' + price.toLocaleString('cs-CZ') + ' Kč. Faktura ' + newInvoice.id + ' byla vystavena.');

            renderCustomerOrders(activeCustomerId);
            renderCustomerInvoices(activeCustomerId);
            renderOrdersList();
            if (assignOrderForm) assignOrderForm.style.display = 'none';
            document.getElementById('newOrderPrice').value = '';
            showAdminToast('Objednávka přiřazena! Faktura ' + newInvoice.id + ' vystavena, e-mail odeslán na ' + customerEmail + '.', 'success');
        });
    }

    // ─── Create Invoice ───
    var createInvoiceBtn = document.getElementById('createInvoiceBtn');
    var createInvoiceForm = document.getElementById('createInvoiceForm');
    var createInvoiceCancel = document.getElementById('createInvoiceCancel');
    var createInvoiceSubmit = document.getElementById('createInvoiceSubmit');

    if (createInvoiceBtn) {
        createInvoiceBtn.addEventListener('click', function() {
            if (createInvoiceForm) createInvoiceForm.style.display = '';
        });
    }
    if (createInvoiceCancel) {
        createInvoiceCancel.addEventListener('click', function() {
            if (createInvoiceForm) createInvoiceForm.style.display = 'none';
        });
    }
    if (createInvoiceSubmit) {
        createInvoiceSubmit.addEventListener('click', function() {
            if (!activeCustomerId) return;
            var amount = parseInt(document.getElementById('newInvoiceAmount').value) || 0;
            var status = document.getElementById('newInvoiceStatus').value;
            var desc = document.getElementById('newInvoiceDesc').value.trim();
            if (amount <= 0 || !desc) {
                showAdminToast('Vyplňte částku a popis.', 'error');
                return;
            }
            var invoices = getInvoicesData();
            var nextNum = 32;
            invoices.forEach(function(inv) {
                var match = inv.id.match(/FV-2026-(\d+)/);
                if (match) { var n = parseInt(match[1]); if (n >= nextNum) nextNum = n + 1; }
            });
            var newInvoice = {
                id: 'FV-2026-' + String(nextNum).padStart(3, '0'),
                customerId: activeCustomerId,
                date: new Date().toLocaleDateString('cs-CZ'),
                amount: amount,
                description: desc,
                status: status
            };
            invoices.unshift(newInvoice);
            saveInvoicesData(invoices);
            renderCustomerInvoices(activeCustomerId);
            if (createInvoiceForm) createInvoiceForm.style.display = 'none';
            document.getElementById('newInvoiceAmount').value = '';
            document.getElementById('newInvoiceDesc').value = '';
            showAdminToast('Faktura vystavena!', 'success');
        });
    }

    // ═══════════════════════════════════════════
    //  MESSAGES (ZPRÁVY) PANEL
    // ═══════════════════════════════════════════

    var MESSAGES_KEY = 'aquaservis_messages';

    function getMessagesFromStorage() {
        try {
            var stored = localStorage.getItem(MESSAGES_KEY);
            if (stored) return JSON.parse(stored);
        } catch(e) {}
        // Default demo messages
        return [
            { id: 1, name: 'Pavel Kučera', email: 'pavel.k@email.cz', phone: '+420 608 111 222', service: 'Čištění bazénu', message: 'Dobrý den, rád bych se informoval o možnosti pravidelného čištění bazénu v sezóně 2026. Bazén má rozměry 6x3m. Děkuji za odpověď.', createdAt: '2026-03-08T14:30:00', read: false },
            { id: 2, name: 'Eva Malá', email: 'eva.mala@email.cz', phone: '+420 775 333 444', service: 'Zastřešení bazénu', message: 'Dobrý den, máme zájem o zastřešení bazénu. Mohli byste nám poskytnout cenovou nabídku? Bazén je 8x4m.', createdAt: '2026-03-07T09:15:00', read: true },
            { id: 3, name: 'Jiří Novotný', email: 'jiri.n@firma.cz', phone: '', service: 'Bazén na klíč', message: 'Dobrý den, plánujeme výstavbu bazénu na zahradě rodinného domu. Rádi bychom se domluvili na konzultaci. Máme k dispozici plochu cca 12x6m.', createdAt: '2026-03-06T16:45:00', read: false }
        ];
    }

    function saveMessagesToStorage(messages) {
        try { localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages)); } catch(e) {}
    }

    function getUnreadCount() {
        var messages = getMessagesFromStorage();
        return messages.filter(function(m) { return !m.read; }).length;
    }

    function updateMessagesBadge() {
        var badge = document.getElementById('messagesBadge');
        if (!badge) return;
        var count = getUnreadCount();
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = '';
        } else {
            badge.style.display = 'none';
        }
        // Update count in header
        var countEl = document.getElementById('messagesCount');
        var messages = getMessagesFromStorage();
        if (countEl) countEl.textContent = messages.length + ' zpráv' + (count > 0 ? ' (' + count + ' nepřečtených)' : '');
    }

    function renderMessages() {
        var container = document.getElementById('messagesListContainer');
        if (!container) return;
        var messages = getMessagesFromStorage();
        if (messages.length === 0) {
            container.innerHTML = '<div class="messages-empty">📭 Žádné zprávy</div>';
            updateMessagesBadge();
            return;
        }
        // Sort newest first
        messages.sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });

        var html = '';
        messages.forEach(function(m) {
            var date = new Date(m.createdAt);
            var dateStr = date.toLocaleDateString('cs-CZ') + ' ' + date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
            var serviceLabels = {
                'cisteni': 'Čištění bazénu',
                'odzimovani': 'Sezónní příprava',
                'zazimovani': 'Zazimování',
                'bazen': 'Bazén na klíč',
                'zastreseni': 'Zastřešení',
                'tepelna-cerpadla': 'Tepelné čerpadlo',
                'chlorace': 'Automatická chlorace',
                'chemie': 'Bazénová chemie',
                'ekocis': 'Vodní program Ekocis',
                'jine': 'Jiné'
            };
            var serviceName = serviceLabels[m.service] || m.service || 'Nezvoleno';

            html += '<div class="message-card' + (m.read ? '' : ' unread') + '" data-message-id="' + m.id + '">';
            html += '<div class="message-card-header">';
            html += '<span class="message-card-sender">' + m.name + '</span>';
            html += '<span class="message-card-date">' + dateStr + '</span>';
            html += '</div>';
            html += '<div class="message-card-service">' + serviceName + '</div>';
            html += '<div class="message-card-preview">' + m.message.substring(0, 100) + (m.message.length > 100 ? '...' : '') + '</div>';
            html += '<div class="message-card-detail">';
            html += '<div class="message-detail-text">' + m.message + '</div>';
            html += '<div class="message-detail-meta">';
            html += '<span>📧 ' + m.email + '</span>';
            if (m.phone) html += '<span>📞 ' + m.phone + '</span>';
            html += '</div>';
            html += '<div class="message-detail-actions">';
            if (!m.read) html += '<button type="button" class="btn-mark-read" data-msg-id="' + m.id + '">Označit jako přečtené</button>';
            html += '<button type="button" class="btn-delete-msg" data-msg-id="' + m.id + '">Smazat</button>';
            html += '</div>';
            html += '</div>';
            html += '</div>';
        });
        container.innerHTML = html;
        updateMessagesBadge();
    }

    // Message click handler (delegation)
    var messagesContainer = document.getElementById('messagesListContainer');
    if (messagesContainer) {
        messagesContainer.addEventListener('click', function(e) {
            // Handle mark as read
            var markBtn = e.target.closest('.btn-mark-read');
            if (markBtn) {
                var msgId = parseInt(markBtn.getAttribute('data-msg-id'));
                var messages = getMessagesFromStorage();
                messages = messages.map(function(m) {
                    if (m.id === msgId) m.read = true;
                    return m;
                });
                saveMessagesToStorage(messages);
                renderMessages();
                showAdminToast('Zpráva označena jako přečtená.', 'success');
                return;
            }

            // Handle delete
            var delBtn = e.target.closest('.btn-delete-msg');
            if (delBtn) {
                if (!confirm('Opravdu chcete smazat tuto zprávu?')) return;
                var dMsgId = parseInt(delBtn.getAttribute('data-msg-id'));
                var msgs = getMessagesFromStorage();
                msgs = msgs.filter(function(m) { return m.id !== dMsgId; });
                saveMessagesToStorage(msgs);
                renderMessages();
                showAdminToast('Zpráva smazána.', 'success');
                return;
            }

            // Toggle expand
            var card = e.target.closest('.message-card');
            if (card) {
                var wasExpanded = card.classList.contains('expanded');
                // Collapse all
                messagesContainer.querySelectorAll('.message-card.expanded').forEach(function(c) {
                    c.classList.remove('expanded');
                });
                if (!wasExpanded) {
                    card.classList.add('expanded');
                    // Mark as read
                    var cardId = parseInt(card.getAttribute('data-message-id'));
                    if (card.classList.contains('unread')) {
                        var allMsgs = getMessagesFromStorage();
                        allMsgs = allMsgs.map(function(m) {
                            if (m.id === cardId) m.read = true;
                            return m;
                        });
                        saveMessagesToStorage(allMsgs);
                        card.classList.remove('unread');
                        updateMessagesBadge();
                    }
                }
            }
        });
    }

    // ═══════════════════════════════════════════
    //  SETTINGS PANEL
    // ═══════════════════════════════════════════

    var SETTINGS_KEY = 'aquaservis_settings';

    function getSettings() {
        try {
            var stored = localStorage.getItem(SETTINGS_KEY);
            if (stored) return JSON.parse(stored);
        } catch(e) {}
        return {
            name: 'Admin AquaServis',
            email: 'admin@cistimebazeny.cz',
            phone: '+420 777 888 999',
            webName: 'AquaServis Praha',
            webDesc: 'Profesionální servis bazénů, zastřešení a vodní hospodářství',
            webEmail: 'info@aquaservis.cz',
            webPhone: '+420 123 456 789',
            emailNotif: true,
            orderNotif: true
        };
    }

    function saveSettings(settings) {
        try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch(e) {}
    }

    function initSettings() {
        var settings = getSettings();
        var fields = {
            'settingsName': settings.name,
            'settingsEmail': settings.email,
            'settingsPhone': settings.phone,
            'settingsWebName': settings.webName,
            'settingsWebDesc': settings.webDesc,
            'settingsWebEmail': settings.webEmail,
            'settingsWebPhone': settings.webPhone
        };
        for (var key in fields) {
            var el = document.getElementById(key);
            if (el) el.value = fields[key] || '';
        }
        var emailNotif = document.getElementById('settingsEmailNotif');
        var orderNotif = document.getElementById('settingsOrderNotif');
        if (emailNotif) emailNotif.checked = settings.emailNotif !== false;
        if (orderNotif) orderNotif.checked = settings.orderNotif !== false;
    }

    var saveProfileBtn = document.getElementById('settingsSaveProfile');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', function() {
            var settings = getSettings();
            settings.name = (document.getElementById('settingsName') || {}).value || '';
            settings.email = (document.getElementById('settingsEmail') || {}).value || '';
            settings.phone = (document.getElementById('settingsPhone') || {}).value || '';
            saveSettings(settings);
            showAdminToast('Profil uložen.', 'success');
        });
    }

    var saveWebBtn = document.getElementById('settingsSaveWeb');
    if (saveWebBtn) {
        saveWebBtn.addEventListener('click', function() {
            var settings = getSettings();
            settings.webName = (document.getElementById('settingsWebName') || {}).value || '';
            settings.webDesc = (document.getElementById('settingsWebDesc') || {}).value || '';
            settings.webEmail = (document.getElementById('settingsWebEmail') || {}).value || '';
            settings.webPhone = (document.getElementById('settingsWebPhone') || {}).value || '';
            saveSettings(settings);
            showAdminToast('Nastavení webu uloženo.', 'success');
        });
    }

    // Notification toggles
    var emailNotifEl = document.getElementById('settingsEmailNotif');
    var orderNotifEl = document.getElementById('settingsOrderNotif');
    if (emailNotifEl) {
        emailNotifEl.addEventListener('change', function() {
            var s = getSettings(); s.emailNotif = this.checked; saveSettings(s);
        });
    }
    if (orderNotifEl) {
        orderNotifEl.addEventListener('change', function() {
            var s = getSettings(); s.orderNotif = this.checked; saveSettings(s);
        });
    }

    // Export data
    var exportBtn = document.getElementById('settingsExportData');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            var data = {
                settings: getSettings(),
                customers: CUSTOMERS_DATA,
                orders: getOrdersData(),
                invoices: getInvoicesData(),
                messages: getMessagesFromStorage(),
                gallery_alts: (function() { try { return JSON.parse(localStorage.getItem('aquaservis_gallery_alts') || '{}'); } catch(e) { return {}; } })(),
                exportedAt: new Date().toISOString()
            };
            var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'aquaservis-export-' + new Date().toISOString().slice(0,10) + '.json';
            a.click();
            URL.revokeObjectURL(url);
            showAdminToast('Data exportována.', 'success');
        });
    }

    // Reset demo data
    var resetBtn = document.getElementById('settingsResetData');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (!confirm('Opravdu chcete resetovat všechna demo data? Tato akce je nevratná.')) return;
            ['aquaservis_orders', 'aquaservis_invoices', 'aquaservis_messages', 'aquaservis_posts', 'aquaservis_gallery', 'aquaservis_gallery_alts', 'aquaservis_settings', 'aquaservis_ai_history'].forEach(function(key) {
                localStorage.removeItem(key);
            });
            showAdminToast('Demo data resetována. Stránka se obnoví.', 'info');
            setTimeout(function() { location.reload(); }, 1500);
        });
    }

    // ═══════════════════════════════════════════
    //  DASHBOARD LIVE DATA
    // ═══════════════════════════════════════════

    function updateDashboardStats() {
        var statNumbers = document.querySelectorAll('.admin-stat-card .admin-stat-number');
        if (statNumbers.length < 4) return;

        var customerCount = CUSTOMERS_DATA.length;
        var orders = getOrdersData();
        var activeOrders = orders.filter(function(o) { return o.status === 'V realizaci' || o.status === 'Čeká na schválení'; }).length;
        var newsletterCount = CUSTOMERS_DATA.filter(function(c) { return c.newsletter; }).length;
        var monthOrders = orders.filter(function(o) {
            return o.date && o.date.indexOf('3. 2026') > -1 || o.date && o.date.indexOf('2. 2026') > -1 || o.date && o.date.indexOf('1. 2026') > -1;
        }).length;

        statNumbers[0].textContent = customerCount;
        statNumbers[1].textContent = activeOrders;
        statNumbers[2].textContent = newsletterCount;
        statNumbers[3].textContent = monthOrders;
    }

    // ═══════════════════════════════════════════
    //  SECURITY
    // ═══════════════════════════════════════════

    // Session timeout (30 min inactivity)
    var SESSION_TIMEOUT = 30 * 60 * 1000;
    var lastActivity = Date.now();

    function resetActivityTimer() {
        lastActivity = Date.now();
    }

    ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'].forEach(function(evt) {
        document.addEventListener(evt, resetActivityTimer, { passive: true });
    });

    setInterval(function() {
        if (dashboard && dashboard.classList.contains('active') && (Date.now() - lastActivity > SESSION_TIMEOUT)) {
            if (window.AquaAuth) window.AquaAuth.logout();
            if (dashboard) dashboard.classList.remove('active');
            if (loginScreen) loginScreen.style.display = '';
            showAdminToast('Sezení vypršelo kvůli neaktivitě.', 'info');
        }
    }, 60000);

    // Login rate limiting
    var loginAttempts = 0;
    var loginCooldownUntil = 0;

    if (loginForm) {
        var origSubmitHandler = loginForm.onsubmit;
        loginForm.addEventListener('submit', function(e) {
            if (Date.now() < loginCooldownUntil) {
                e.preventDefault();
                e.stopImmediatePropagation();
                var remaining = Math.ceil((loginCooldownUntil - Date.now()) / 1000);
                showLoginError('Příliš mnoho pokusů. Zkuste to za ' + remaining + ' sekund.');
                return false;
            }
        }, true);

        // Track failed login attempts
        var origLoginBtn = loginForm.querySelector('button[type="submit"]');
        if (origLoginBtn) {
            var observer = new MutationObserver(function() {
                var errorEl = loginForm.querySelector('.admin-login-error');
                if (errorEl) {
                    loginAttempts++;
                    if (loginAttempts >= 5) {
                        loginCooldownUntil = Date.now() + 30000;
                        loginAttempts = 0;
                    }
                }
            });
            observer.observe(loginForm, { childList: true, subtree: true });
        }
    }

    // File upload validation
    if (galleryFileInput) {
        var origChangeHandler = galleryFileInput.onchange;
        galleryFileInput.addEventListener('change', function() {
            if (!this.files || !this.files[0]) return;
            var file = this.files[0];
            // Max 5MB
            if (file.size > 5 * 1024 * 1024) {
                showAdminToast('Obrázek je příliš velký (max 5 MB).', 'error');
                this.value = '';
                return;
            }
            // Only images
            if (!file.type.startsWith('image/')) {
                showAdminToast('Povoleny jsou pouze obrázky.', 'error');
                this.value = '';
                return;
            }
        }, true);
    }

    // ─── Initialize everything ───
    initPosts();
    renderAdminPostsList();
    renderAdminGallery();
    initEditor();
    renderCustomersTable();
    renderOrdersList();
    renderMessages();
    initSettings();
    updateDashboardStats();

    // Initialize statistics if panel exists
    if (document.getElementById('panelStatistiky')) {
        renderAllStats('week');
    }

    // Update messages badge on mobile bar too
    updateMessagesBadge();

})();

(function() {
    'use strict';

    var loginScreen = document.getElementById('adminLogin');
    var dashboard = document.getElementById('adminDashboard');
    var loginForm = document.getElementById('adminLoginForm');
    var sidebar = document.getElementById('adminSidebar');
    var mobileToggle = document.getElementById('adminMobileToggle');
    var logoutBtn = document.getElementById('adminLogout');

    // Login handler
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Demo: any credentials work
            if (loginScreen) loginScreen.style.display = 'none';
            if (dashboard) dashboard.classList.add('active');
        });
    }

    // Logout handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (dashboard) dashboard.classList.remove('active');
            if (loginScreen) loginScreen.style.display = '';
            if (loginForm) loginForm.reset();
        });
    }

    // Sidebar navigation
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

    // Mobile sidebar toggle
    if (mobileToggle && sidebar) {
        mobileToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
        });

        // Close sidebar on outside click
        document.addEventListener('click', function(e) {
            if (sidebar.classList.contains('open') &&
                !sidebar.contains(e.target) &&
                !mobileToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }

    // Newsletter send (demo)
    var newsletterBtn = document.getElementById('newsletterSendBtn');
    if (newsletterBtn) {
        newsletterBtn.addEventListener('click', function() {
            var textarea = document.getElementById('newsletterMessage');
            if (textarea && textarea.value.trim()) {
                this.textContent = 'Odesláno!';
                this.style.background = 'linear-gradient(135deg, #10b981, #34d399)';
                setTimeout(function() {
                    newsletterBtn.textContent = 'Odeslat newsletter';
                    newsletterBtn.style.background = '';
                    textarea.value = '';
                }, 2000);
            }
        });
    }
})();

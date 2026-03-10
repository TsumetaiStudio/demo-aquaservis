(function() {
    'use strict';

    var noAuth = document.getElementById('clientNoAuth');
    var dashboard = document.getElementById('clientDashboard');
    var clientNameEl = document.getElementById('clientName');
    var clientEmailEl = document.getElementById('clientEmail');
    var logoutBtn = document.getElementById('clientLogout');

    // Check session
    var session = window.AquaAuth ? window.AquaAuth.getSession() : null;

    if (!session) {
        if (noAuth) noAuth.style.display = '';
        if (dashboard) dashboard.style.display = 'none';
        return;
    }

    // Admin trying to access client zone -> redirect to admin
    if (session.role === 'admin') {
        window.location.href = 'admin.html';
        return;
    }

    // Show authenticated state
    if (noAuth) noAuth.style.display = 'none';
    if (dashboard) dashboard.style.display = '';

    // Populate user info
    if (clientNameEl) clientNameEl.textContent = session.name;
    if (clientEmailEl) clientEmailEl.textContent = session.email;

    // Populate profile form from full user data
    var user = window.AquaAuth.findByEmail(session.email);
    if (user) {
        setValue('profFirstName', user.firstName);
        setValue('profLastName', user.lastName);
        setValue('profEmail', user.email);
        setValue('profPhone', user.phone);
    }

    function setValue(id, val) {
        var el = document.getElementById(id);
        if (el) el.value = val || '';
    }

    // ─── Tab navigation ───
    var tabs = document.querySelectorAll('.client-tab[data-panel]');
    var panels = document.querySelectorAll('.client-panel');

    tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            var target = this.getAttribute('data-panel');
            tabs.forEach(function(t) { t.classList.remove('active'); });
            this.classList.add('active');
            panels.forEach(function(p) { p.classList.remove('active'); });
            var targetPanel = document.getElementById(target);
            if (targetPanel) targetPanel.classList.add('active');
        });
    });

    // ─── Logout ───
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (window.AquaAuth) window.AquaAuth.logout();
            window.location.href = 'prihlaseni.html';
        });
    }

    // ─── Profile edit toggle ───
    var editBtn = document.getElementById('profileEditBtn');
    var saveBtn = document.getElementById('profileSaveBtn');
    var cancelBtn = document.getElementById('profileCancelBtn');
    var editableFields = ['profFirstName', 'profLastName', 'profPhone'];

    if (editBtn) {
        editBtn.addEventListener('click', function() {
            editableFields.forEach(function(id) {
                var el = document.getElementById(id);
                if (el) el.removeAttribute('readonly');
            });
            editBtn.style.display = 'none';
            if (saveBtn) saveBtn.style.display = '';
            if (cancelBtn) cancelBtn.style.display = '';
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            if (user) {
                setValue('profFirstName', user.firstName);
                setValue('profLastName', user.lastName);
                setValue('profPhone', user.phone);
            }
            editableFields.forEach(function(id) {
                var el = document.getElementById(id);
                if (el) el.setAttribute('readonly', '');
            });
            if (editBtn) editBtn.style.display = '';
            if (saveBtn) saveBtn.style.display = 'none';
            if (cancelBtn) cancelBtn.style.display = 'none';
        });
    }

    // ─── Profile save ───
    var profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var users = window.AquaAuth.getUsers();
            var idx = -1;
            for (var i = 0; i < users.length; i++) {
                if (users[i].id === session.userId) { idx = i; break; }
            }
            if (idx === -1) return;

            users[idx].firstName = document.getElementById('profFirstName').value.trim();
            users[idx].lastName = document.getElementById('profLastName').value.trim();
            users[idx].phone = document.getElementById('profPhone').value.trim();
            localStorage.setItem('aquaservis_users', JSON.stringify(users));

            // Update local user reference
            user = users[idx];

            // Update session name
            session.name = users[idx].firstName + ' ' + users[idx].lastName;
            localStorage.setItem('aquaservis_session', JSON.stringify(session));
            if (clientNameEl) clientNameEl.textContent = session.name;

            // Reset to readonly
            editableFields.forEach(function(id) {
                var el = document.getElementById(id);
                if (el) el.setAttribute('readonly', '');
            });
            if (editBtn) editBtn.style.display = '';
            if (saveBtn) saveBtn.style.display = 'none';
            if (cancelBtn) cancelBtn.style.display = 'none';

            showToast('Údaje byly úspěšně uloženy.');
        });
    }

    // ─── Password change ───
    var passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var current = document.getElementById('currentPassword').value;
            var newPw = document.getElementById('newPassword').value;
            var newPwConfirm = document.getElementById('newPasswordConfirm').value;

            if (!user || current !== user.password) {
                showToast('Stávající heslo je nesprávné.', true);
                return;
            }
            if (newPw.length < 8) {
                showToast('Nové heslo musí mít alespoň 8 znaků.', true);
                return;
            }
            if (newPw !== newPwConfirm) {
                showToast('Nová hesla se neshodují.', true);
                return;
            }

            var users = window.AquaAuth.getUsers();
            for (var i = 0; i < users.length; i++) {
                if (users[i].id === session.userId) {
                    users[i].password = newPw;
                    user = users[i];
                    break;
                }
            }
            localStorage.setItem('aquaservis_users', JSON.stringify(users));
            passwordForm.reset();
            showToast('Heslo bylo úspěšně změněno.');
        });
    }

    // ─── Toast notification ───
    function showToast(message, isError) {
        var toast = document.createElement('div');
        toast.className = 'client-toast' + (isError ? ' client-toast-error' : '');
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

    // ─── Order row expand/collapse ───
    var orderRows = document.querySelectorAll('.client-order-row');
    orderRows.forEach(function(row) {
        var summary = row.querySelector('.client-order-summary');
        if (summary) {
            summary.addEventListener('click', function(e) {
                // Don't toggle if clicking a document button
                if (e.target.closest('.client-doc-btn')) return;
                // Close other expanded rows
                orderRows.forEach(function(r) {
                    if (r !== row) r.classList.remove('expanded');
                });
                row.classList.toggle('expanded');
            });
        }
    });

    // ─── Document download buttons ───
    var docBtns = document.querySelectorAll('.client-doc-btn');
    docBtns.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var docType = this.getAttribute('data-doc');
            var orderId = this.getAttribute('data-order');
            var label = docType === 'smlouva' ? 'Smlouva' : 'Faktura';
            showToast('Stahování dokumentu: ' + label + ' (' + orderId + ')...');
        });
    });

    // ─── Message row expand/collapse ───
    var messageRows = document.querySelectorAll('.client-message-row');
    messageRows.forEach(function(row) {
        var summary = row.querySelector('.client-message-summary');
        if (summary) {
            summary.addEventListener('click', function() {
                // Close other expanded messages
                messageRows.forEach(function(r) {
                    if (r !== row) r.classList.remove('expanded');
                });
                row.classList.toggle('expanded');
            });
        }
    });

    // ─── Newsletter toggle ───
    var newsletterToggle = document.getElementById('newsletterToggle');
    if (newsletterToggle) {
        // Load saved state
        var savedNewsletter = localStorage.getItem('aquaservis_newsletter');
        if (savedNewsletter === 'true') {
            newsletterToggle.checked = true;
        }
        newsletterToggle.addEventListener('change', function() {
            localStorage.setItem('aquaservis_newsletter', this.checked ? 'true' : 'false');
            if (this.checked) {
                showToast('Odběr novinek byl aktivován.');
            } else {
                showToast('Odběr novinek byl deaktivován.');
            }
        });
    }

    // ─── Delete account ───
    var deleteBtn = document.getElementById('deleteAccountBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            var confirmed = confirm('Opravdu chcete smazat svůj účet? Tato akce je nevratná a přijdete o veškerá data.');
            if (!confirmed) return;

            // Remove user from users array
            var users = window.AquaAuth ? window.AquaAuth.getUsers() : [];
            var filtered = [];
            for (var i = 0; i < users.length; i++) {
                if (users[i].id !== session.userId) {
                    filtered.push(users[i]);
                }
            }
            localStorage.setItem('aquaservis_users', JSON.stringify(filtered));

            // Clear session and newsletter preference
            localStorage.removeItem('aquaservis_session');
            localStorage.removeItem('aquaservis_newsletter');

            // Redirect to homepage
            window.location.href = 'index.html';
        });
    }
})();

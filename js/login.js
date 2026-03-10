(function() {
    'use strict';

    // Auto-redirect if already logged in
    var session = window.AquaAuth ? window.AquaAuth.getSession() : null;
    if (session) {
        if (session.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'klientska-zona.html';
        }
        return;
    }

    var form = document.getElementById('loginForm');
    if (!form) return;

    var emailInput = document.getElementById('loginEmail');
    var passwordInput = document.getElementById('loginPassword');
    var errorDiv = document.getElementById('loginError');

    function showFieldError(fieldEl, message) {
        var group = fieldEl.closest('.form-group');
        if (!group) return;
        group.classList.add('error');
        var errorSpan = group.querySelector('.form-error');
        if (errorSpan) errorSpan.textContent = message;
    }

    function clearFieldError(fieldEl) {
        var group = fieldEl.closest('.form-group');
        if (!group) return;
        group.classList.remove('error');
    }

    function showLoginError(message) {
        if (!errorDiv) return;
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(function() {
            if (errorDiv) errorDiv.style.display = 'none';
        }, 5000);
    }

    // Live clear on input
    [emailInput, passwordInput].forEach(function(el) {
        if (el) {
            el.addEventListener('input', function() {
                clearFieldError(el);
                if (errorDiv) errorDiv.style.display = 'none';
            });
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (errorDiv) errorDiv.style.display = 'none';

        var email = emailInput ? emailInput.value.trim() : '';
        var password = passwordInput ? passwordInput.value : '';
        var isValid = true;

        if (!email) {
            showFieldError(emailInput, 'Zadejte e-mail');
            isValid = false;
        }
        if (!password) {
            showFieldError(passwordInput, 'Zadejte heslo');
            isValid = false;
        }

        if (!isValid) return;

        if (!window.AquaAuth) {
            showLoginError('Systém není dostupný. Zkuste to prosím později.');
            return;
        }

        // Disable form during async login
        var submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        window.AquaAuth.login(email, password).then(function(result) {
            if (!result.success) {
                showLoginError(result.error);
                if (submitBtn) submitBtn.disabled = false;
                return;
            }

            // Redirect based on role
            if (result.user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'klientska-zona.html';
            }
        }).catch(function() {
            showLoginError('Chyba p\u0159i p\u0159ihla\u0161ov\u00e1n\u00ed. Zkuste to znovu.');
            if (submitBtn) submitBtn.disabled = false;
        });
    });
})();

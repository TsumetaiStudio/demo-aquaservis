(function() {
    'use strict';

    var form = document.getElementById('registerForm');
    if (!form) return;

    var fields = {
        firstName: { el: document.getElementById('firstName'), min: 2, msg: 'Jméno musí mít alespoň 2 znaky' },
        lastName: { el: document.getElementById('lastName'), min: 2, msg: 'Příjmení musí mít alespoň 2 znaky' },
        email: { el: document.getElementById('regEmail'), pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, msg: 'Zadejte platný e-mail' },
        phone: { el: document.getElementById('regPhone'), pattern: /^(\+?\d{1,4})?[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3,4}$/, msg: 'Zadejte platné telefonní číslo' },
        password: { el: document.getElementById('regPassword'), min: 8, msg: 'Heslo musí mít alespoň 8 znaků' },
        passwordConfirm: { el: document.getElementById('regPasswordConfirm'), match: 'password', msg: 'Hesla se neshodují' }
    };

    var termsCheckbox = document.getElementById('termsAgree');
    var gdprCheckbox = document.getElementById('gdprAgree');
    var successOverlay = document.getElementById('registerSuccess');

    function showError(fieldEl, message) {
        var group = fieldEl.closest('.form-group');
        if (!group) return;
        group.classList.add('error');
        var errorSpan = group.querySelector('.form-error');
        if (errorSpan) {
            errorSpan.textContent = message;
        }
    }

    function clearError(fieldEl) {
        var group = fieldEl.closest('.form-group');
        if (!group) return;
        group.classList.remove('error');
    }

    function validateField(name) {
        var config = fields[name];
        if (!config || !config.el) return false;

        var value = config.el.value.trim();
        clearError(config.el);

        if (!value) {
            showError(config.el, 'Toto pole je povinné');
            return false;
        }

        if (config.min && value.length < config.min) {
            showError(config.el, config.msg);
            return false;
        }

        if (config.pattern && !config.pattern.test(value)) {
            showError(config.el, config.msg);
            return false;
        }

        if (config.match) {
            var matchField = fields[config.match];
            if (matchField && matchField.el && value !== matchField.el.value.trim()) {
                showError(config.el, config.msg);
                return false;
            }
        }

        return true;
    }

    // Live validation on blur
    Object.keys(fields).forEach(function(name) {
        var config = fields[name];
        if (config.el) {
            config.el.addEventListener('blur', function() {
                validateField(name);
            });
            config.el.addEventListener('input', function() {
                clearError(config.el);
            });
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        var isValid = true;

        Object.keys(fields).forEach(function(name) {
            if (!validateField(name)) {
                isValid = false;
            }
        });

        // Check checkboxes
        if (termsCheckbox && !termsCheckbox.checked) {
            var termsGroup = termsCheckbox.closest('.form-group') || termsCheckbox.parentElement;
            if (termsGroup) termsGroup.classList.add('error');
            isValid = false;
        }

        if (gdprCheckbox && !gdprCheckbox.checked) {
            var gdprGroup = gdprCheckbox.closest('.form-group') || gdprCheckbox.parentElement;
            if (gdprGroup) gdprGroup.classList.add('error');
            isValid = false;
        }

        if (!isValid) {
            // Scroll to first error
            var firstError = form.querySelector('.form-group.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Show success overlay
        if (successOverlay) {
            successOverlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    });

    // Close success overlay
    if (successOverlay) {
        var closeBtn = successOverlay.querySelector('.success-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                successOverlay.style.display = 'none';
                document.body.style.overflow = '';
                form.reset();
            });
        }
    }
})();

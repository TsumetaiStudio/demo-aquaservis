(function() {
    'use strict';

    var contactForm = document.getElementById('contactForm');
    var formSuccess = document.getElementById('formSuccess');
    var submitBtn = document.getElementById('submitBtn');

    if (!contactForm) return;

    // ─── Service Pre-selection from URL ───
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

    // ─── Field Validation ───
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

    // ─── Form Submit Handler ───
    function handleFormSubmit(e) {
        e.preventDefault();
        var inputs = contactForm.querySelectorAll('input:not([type="hidden"]), select, textarea');
        var allValid = true;

        inputs.forEach(function(input) {
            if (!validateField(input)) allValid = false;
        });

        if (!allValid) {
            // Scroll to first error
            var firstError = contactForm.querySelector('.form-group.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Check honeypot
        var honeypot = contactForm.querySelector('.form-honeypot input');
        if (honeypot && honeypot.value) return;

        // Show loading state
        if (submitBtn) submitBtn.classList.add('loading');

        // Netlify Forms submission
        var formData = new FormData(contactForm);

        fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData).toString()
        })
        .then(function(response) {
            if (response.ok) {
                showSuccess();
            } else {
                // Show error to user
                if (submitBtn) submitBtn.classList.remove('loading');
                var errorEl = document.createElement('div');
                errorEl.className = 'form-message form-message--error';
                errorEl.style.cssText = 'background:#fef2f2;color:#dc2626;padding:16px;border-radius:8px;margin-top:16px;text-align:center;';
                errorEl.textContent = 'Odeslání se nezdařilo. Zkuste to prosím znovu.';
                contactForm.appendChild(errorEl);
                setTimeout(function() { if (errorEl.parentNode) errorEl.remove(); }, 5000);
            }
        })
        .catch(function(err) {
            if (submitBtn) submitBtn.classList.remove('loading');
            // Show error to user
            var errorEl = document.createElement('div');
            errorEl.className = 'form-message form-message--error';
            errorEl.style.cssText = 'background:#fef2f2;color:#dc2626;padding:16px;border-radius:8px;margin-top:16px;text-align:center;';
            errorEl.textContent = 'Odeslání se nezdařilo. Zkuste to prosím znovu.';
            contactForm.appendChild(errorEl);
            setTimeout(function() { if (errorEl.parentNode) errorEl.remove(); }, 5000);
        });
    }

    function showSuccess() {
        if (submitBtn) submitBtn.classList.remove('loading');
        if (formSuccess) formSuccess.classList.add('visible');
        contactForm.reset();

        setTimeout(function() {
            if (formSuccess) formSuccess.classList.remove('visible');
        }, 5000);
    }

    // ─── Event Listeners ───
    contactForm.addEventListener('submit', handleFormSubmit);

    contactForm.querySelectorAll('input, select, textarea').forEach(function(input) {
        input.addEventListener('blur', function() {
            if (input.value) validateField(input);
        });
        input.addEventListener('input', function() {
            var group = input.closest('.form-group');
            if (group) group.classList.remove('error');
        });
    });

    // ─── Initialize ───
    preSelectService();

})();

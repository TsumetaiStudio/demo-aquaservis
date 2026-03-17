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
        var inputs = contactForm.querySelectorAll('input:not([type="hidden"]):not([type="file"]), select, textarea');
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

        // Netlify Forms submission (multipart for file uploads)
        var formData = new FormData(contactForm);

        fetch('/', {
            method: 'POST',
            body: formData
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

        // Save message to localStorage for admin panel
        saveMessageToAdmin();

        contactForm.reset();
        // Clear file upload previews
        if (uploadPreview) uploadPreview.innerHTML = '';
        selectedFiles = [];

        setTimeout(function() {
            if (formSuccess) formSuccess.classList.remove('visible');
        }, 5000);
    }

    // ─── Save message to localStorage for admin Zprávy panel ───
    function saveMessageToAdmin() {
        try {
            var nameVal = document.getElementById('name') ? document.getElementById('name').value.trim() : '';
            var emailVal = document.getElementById('email') ? document.getElementById('email').value.trim() : '';
            var phoneVal = document.getElementById('phone') ? document.getElementById('phone').value.trim() : '';
            var serviceVal = document.getElementById('service') ? document.getElementById('service').value : '';
            var messageVal = document.getElementById('message') ? document.getElementById('message').value.trim() : '';

            var MESSAGES_KEY = 'aquapool_messages';
            var messages = [];
            var stored = localStorage.getItem(MESSAGES_KEY);
            if (stored) messages = JSON.parse(stored);

            // Generate unique ID
            var maxId = 0;
            messages.forEach(function(m) { if (m.id > maxId) maxId = m.id; });

            var newMessage = {
                id: maxId + 1,
                name: nameVal,
                email: emailVal,
                phone: phoneVal,
                service: serviceVal,
                message: messageVal,
                createdAt: new Date().toISOString(),
                read: false
            };

            messages.push(newMessage);
            localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));

            // Log simulated email notification
            console.log('[AquaPool] Simulovaný email odeslán adminovi:', {
                to: 'admin@example.cz',
                subject: 'Nová poptávka od ' + nameVal,
                body: 'Služba: ' + serviceVal + '\nZpráva: ' + messageVal + '\nKontakt: ' + emailVal + ' / ' + phoneVal
            });
        } catch(e) {
            console.warn('Nepodařilo se uložit zprávu do admin panelu:', e);
        }
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

    // ─── File Upload with Drag & Drop ───
    var uploadArea = document.getElementById('uploadArea');
    var uploadInput = document.getElementById('attachment');
    var uploadPreview = document.getElementById('uploadPreview');
    var selectedFiles = [];

    if (uploadArea && uploadInput && uploadPreview) {
        // Drag & drop events
        ['dragenter', 'dragover'].forEach(function(evt) {
            uploadArea.addEventListener(evt, function(e) {
                e.preventDefault();
                e.stopPropagation();
                uploadArea.classList.add('dragover');
            });
        });
        ['dragleave', 'drop'].forEach(function(evt) {
            uploadArea.addEventListener(evt, function(e) {
                e.preventDefault();
                e.stopPropagation();
                uploadArea.classList.remove('dragover');
            });
        });

        uploadArea.addEventListener('drop', function(e) {
            var files = e.dataTransfer.files;
            handleFiles(files);
        });

        uploadInput.addEventListener('change', function() {
            handleFiles(uploadInput.files);
        });

        function handleFiles(fileList) {
            for (var i = 0; i < fileList.length; i++) {
                var file = fileList[i];
                if (!file.type.startsWith('image/')) continue;
                if (file.size > 5 * 1024 * 1024) {
                    alert('Soubor "' + file.name + '" je příliš velký (max. 5 MB).');
                    continue;
                }
                selectedFiles.push(file);
                addPreviewThumb(file, selectedFiles.length - 1);
            }
            updateFileInput();
        }

        function addPreviewThumb(file, idx) {
            var item = document.createElement('div');
            item.className = 'form-upload-preview-item';
            item.dataset.idx = idx;

            var img = document.createElement('img');
            img.alt = file.name;
            var reader = new FileReader();
            reader.onload = function(e) { img.src = e.target.result; };
            reader.readAsDataURL(file);

            var removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'form-upload-preview-remove';
            removeBtn.innerHTML = '&times;';
            removeBtn.setAttribute('aria-label', 'Odebrat ' + file.name);
            removeBtn.addEventListener('click', function() {
                selectedFiles[idx] = null;
                item.remove();
                updateFileInput();
            });

            item.appendChild(img);
            item.appendChild(removeBtn);
            uploadPreview.appendChild(item);
        }

        function updateFileInput() {
            var dt = new DataTransfer();
            selectedFiles.forEach(function(f) {
                if (f) dt.items.add(f);
            });
            uploadInput.files = dt.files;
        }

        // Clear previews on form reset
        contactForm.addEventListener('reset', function() {
            selectedFiles = [];
            uploadPreview.innerHTML = '';
        });
    }

    // ─── Initialize ───
    preSelectService();

})();

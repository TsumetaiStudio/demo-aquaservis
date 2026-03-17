(function() {
    'use strict';

    var COOKIE_KEY = 'aquapool_cookies';

    function hasConsent() {
        // Backwards compat: migrate old key from main.js cookie system
        if (localStorage.getItem(COOKIE_KEY) === null && localStorage.getItem('cookies-accepted') !== null) {
            var old = localStorage.getItem('cookies-accepted');
            var prefs = { analytics: false, marketing: false };
            if (old === 'all') {
                prefs = { analytics: true, marketing: true };
            } else {
                try { var p = JSON.parse(old); prefs = { analytics: !!p.analytics, marketing: !!p.marketing }; } catch(e) {}
            }
            setConsent(prefs);
            localStorage.removeItem('cookies-accepted');
        }
        return localStorage.getItem(COOKIE_KEY) !== null;
    }

    function getConsent() {
        var stored = localStorage.getItem(COOKIE_KEY);
        if (!stored) return null;
        try { return JSON.parse(stored); } catch(e) { return null; }
    }

    function setConsent(preferences) {
        localStorage.setItem(COOKIE_KEY, JSON.stringify({
            necessary: true,
            analytics: preferences.analytics || false,
            marketing: preferences.marketing || false,
            timestamp: new Date().toISOString()
        }));
    }

    function createBanner() {
        var banner = document.getElementById('cookie-banner');
        if (!banner) return;

        banner.innerHTML =
            '<div class="cookie-settings" id="cookieSettings">' +
                '<h4 class="cookie-settings-title">Nastavení cookies</h4>' +
                '<div class="cookie-category">' +
                    '<div class="cookie-category-info">' +
                        '<div class="cookie-category-name">Nezbytné <span class="cookie-required">Vždy aktivní</span></div>' +
                        '<div class="cookie-category-desc">Nutné pro základní funkčnost webu, navigaci a bezpečnost.</div>' +
                    '</div>' +
                    '<label class="cookie-toggle">' +
                        '<input type="checkbox" checked disabled>' +
                        '<span class="cookie-toggle-slider"></span>' +
                    '</label>' +
                '</div>' +
                '<div class="cookie-category">' +
                    '<div class="cookie-category-info">' +
                        '<div class="cookie-category-name">Analytické</div>' +
                        '<div class="cookie-category-desc">Pomáhají nám pochopit, jak návštěvníci používají web.</div>' +
                    '</div>' +
                    '<label class="cookie-toggle">' +
                        '<input type="checkbox" id="cookieAnalytics">' +
                        '<span class="cookie-toggle-slider"></span>' +
                    '</label>' +
                '</div>' +
                '<div class="cookie-category">' +
                    '<div class="cookie-category-info">' +
                        '<div class="cookie-category-name">Marketingové</div>' +
                        '<div class="cookie-category-desc">Umožňují zobrazovat relevantní reklamy a měřit jejich účinnost.</div>' +
                    '</div>' +
                    '<label class="cookie-toggle">' +
                        '<input type="checkbox" id="cookieMarketing">' +
                        '<span class="cookie-toggle-slider"></span>' +
                    '</label>' +
                '</div>' +
                '<div class="cookie-settings-save">' +
                    '<button class="cookie-btn cookie-btn-accept" id="cookieSaveSettings">Uložit nastavení</button>' +
                '</div>' +
            '</div>' +
            '<div class="cookie-banner-inner">' +
                '<div class="cookie-banner-text">' +
                    'Tento web používá cookies pro zlepšení vašeho zážitku. ' +
                    'Nezbytné cookies jsou vždy aktivní. Můžete si vybrat, které další kategorie povolíte. ' +
                    '<a href="smluvni-podminky.html">Více informací</a>' +
                '</div>' +
                '<div class="cookie-banner-buttons">' +
                    '<button class="cookie-btn cookie-btn-accept" id="cookieAcceptAll">Přijmout vše</button>' +
                    '<button class="cookie-btn cookie-btn-reject" id="cookieRejectAll">Odmítnout vše</button>' +
                    '<button class="cookie-btn cookie-btn-settings" id="cookieShowSettings">Nastavení</button>' +
                '</div>' +
            '</div>';
    }

    function showBanner() {
        var banner = document.getElementById('cookie-banner');
        if (banner) {
            banner.classList.add('visible');
        }
    }

    function hideBanner() {
        var banner = document.getElementById('cookie-banner');
        if (banner) {
            banner.classList.remove('visible');
        }
    }

    function toggleSettings() {
        var settings = document.getElementById('cookieSettings');
        if (settings) {
            settings.classList.toggle('visible');
        }
    }

    function init() {
        createBanner();

        if (hasConsent()) {
            return;
        }

        // Small delay for smooth entrance
        setTimeout(showBanner, 800);

        // Accept all
        var acceptBtn = document.getElementById('cookieAcceptAll');
        if (acceptBtn) {
            acceptBtn.addEventListener('click', function() {
                setConsent({ analytics: true, marketing: true });
                hideBanner();
            });
        }

        // Reject all
        var rejectBtn = document.getElementById('cookieRejectAll');
        if (rejectBtn) {
            rejectBtn.addEventListener('click', function() {
                setConsent({ analytics: false, marketing: false });
                hideBanner();
            });
        }

        // Show settings
        var settingsBtn = document.getElementById('cookieShowSettings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', function() {
                toggleSettings();
            });
        }

        // Save settings
        var saveBtn = document.getElementById('cookieSaveSettings');
        if (saveBtn) {
            saveBtn.addEventListener('click', function() {
                var analytics = document.getElementById('cookieAnalytics');
                var marketing = document.getElementById('cookieMarketing');
                setConsent({
                    analytics: analytics ? analytics.checked : false,
                    marketing: marketing ? marketing.checked : false
                });
                hideBanner();
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

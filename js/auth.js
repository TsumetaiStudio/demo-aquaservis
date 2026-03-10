/**
 * AquaServis — Demo Auth System (localStorage)
 * Handles user registration, login, and session management.
 * Passwords are stored as SHA-256 hashes — never in plaintext.
 */
(function() {
    'use strict';

    var STORAGE_KEY = 'aquaservis_users';
    var SESSION_KEY = 'aquaservis_session';

    // ─── SHA-256 hash (Web Crypto API) ───
    function sha256(message) {
        var msgBuffer = new TextEncoder().encode(message);
        return crypto.subtle.digest('SHA-256', msgBuffer).then(function(hashBuffer) {
            var hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
        });
    }

    // ─── Default demo accounts (passwords are pre-hashed with SHA-256) ───
    var DEFAULT_ACCOUNTS = [
        {
            id: 1,
            firstName: 'Z\u00e1kazn\u00edk',
            lastName: 'Demo',
            email: 'zakaznik@mail.cz',
            password: '02b345c6ed9bf2bf9ab67ba2bcb6ba0caad9402aec50150a62cedd6a56599a85',
            phone: '+420 607 241 000',
            role: 'customer',
            createdAt: '2026-03-10T08:00:00.000Z'
        },
        {
            id: 2,
            firstName: 'Admin',
            lastName: 'Spr\u00e1vce',
            email: 'admin@cistimebazeny.cz',
            password: '02b345c6ed9bf2bf9ab67ba2bcb6ba0caad9402aec50150a62cedd6a56599a85',
            phone: '+420 600 000 000',
            role: 'admin',
            createdAt: '2026-03-10T08:00:00.000Z'
        }
    ];

    // ─── Initialize storage with default accounts if empty ───
    function initStorage() {
        var stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
        } else {
            var users = JSON.parse(stored);
            var updated = false;
            DEFAULT_ACCOUNTS.forEach(function(def) {
                var exists = users.some(function(u) { return u.email === def.email; });
                if (!exists) {
                    users.push(def);
                    updated = true;
                }
            });
            if (updated) localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        }
    }

    // ─── Get all users ───
    function getUsers() {
        var stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    // ─── Find user by email ───
    function findByEmail(email) {
        var users = getUsers();
        return users.find(function(u) { return u.email.toLowerCase() === email.toLowerCase(); }) || null;
    }

    // ─── Register new user (async — returns Promise) ───
    function register(userData) {
        var users = getUsers();

        // Check duplicate email
        var exists = users.some(function(u) { return u.email.toLowerCase() === userData.email.toLowerCase(); });
        if (exists) {
            return Promise.resolve({ success: false, error: '\u00da\u010det s t\u00edmto e-mailem ji\u017e existuje.' });
        }

        var maxId = users.reduce(function(max, u) { return u.id > max ? u.id : max; }, 0);

        return sha256(userData.password).then(function(hashedPw) {
            var newUser = {
                id: maxId + 1,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                password: hashedPw,
                phone: userData.phone || '',
                role: 'customer',
                createdAt: new Date().toISOString()
            };

            var currentUsers = getUsers();
            currentUsers.push(newUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUsers));
            return { success: true, user: newUser };
        });
    }

    // ─── Login (async — returns Promise) ───
    function login(email, password) {
        var user = findByEmail(email);
        if (!user) {
            return Promise.resolve({ success: false, error: 'Nespr\u00e1vn\u00fd e-mail nebo heslo.' });
        }

        return sha256(password).then(function(hashedPw) {
            if (user.password !== hashedPw) {
                return { success: false, error: 'Nespr\u00e1vn\u00fd e-mail nebo heslo.' };
            }

            var session = {
                userId: user.id,
                email: user.email,
                role: user.role,
                name: user.firstName + ' ' + user.lastName
            };
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
            return { success: true, user: user, session: session };
        });
    }

    // ─── Logout ───
    function logout() {
        localStorage.removeItem(SESSION_KEY);
    }

    // ─── Get current session ───
    function getSession() {
        var stored = localStorage.getItem(SESSION_KEY);
        return stored ? JSON.parse(stored) : null;
    }

    // ─── Is admin? ───
    function isAdmin() {
        var session = getSession();
        return session && session.role === 'admin';
    }

    // ─── Expose globally ───
    window.AquaAuth = {
        init: initStorage,
        register: register,
        login: login,
        logout: logout,
        getSession: getSession,
        getUsers: getUsers,
        findByEmail: findByEmail,
        isAdmin: isAdmin,
        hashPassword: sha256
    };

    // Auto-initialize
    initStorage();
})();

/**
 * AquaServis — Demo Auth System (localStorage)
 * Handles user registration, login, and session management.
 */
(function() {
    'use strict';

    var STORAGE_KEY = 'aquaservis_users';
    var SESSION_KEY = 'aquaservis_session';

    // ─── Default demo accounts ───
    var DEFAULT_ACCOUNTS = [
        {
            id: 1,
            firstName: 'Zákazník',
            lastName: 'Demo',
            email: 'zakaznik@mail.cz',
            password: '321demo11',
            phone: '+420 607 241 000',
            role: 'customer',
            createdAt: '2026-03-10T08:00:00.000Z'
        },
        {
            id: 2,
            firstName: 'Admin',
            lastName: 'WebZitra',
            email: 'pekarna@webzitra.cz',
            password: '321demo11',
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
            // Ensure default accounts exist
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

    // ─── Register new user ───
    function register(userData) {
        var users = getUsers();

        // Check duplicate email
        var exists = users.some(function(u) { return u.email.toLowerCase() === userData.email.toLowerCase(); });
        if (exists) {
            return { success: false, error: 'Účet s tímto e-mailem již existuje.' };
        }

        var maxId = users.reduce(function(max, u) { return u.id > max ? u.id : max; }, 0);
        var newUser = {
            id: maxId + 1,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: userData.password,
            phone: userData.phone || '',
            role: 'customer',
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        return { success: true, user: newUser };
    }

    // ─── Login ───
    function login(email, password) {
        var user = findByEmail(email);
        if (!user) {
            return { success: false, error: 'Nesprávný e-mail nebo heslo.' };
        }
        if (user.password !== password) {
            return { success: false, error: 'Nesprávný e-mail nebo heslo.' };
        }

        // Save session
        var session = { userId: user.id, email: user.email, role: user.role, name: user.firstName + ' ' + user.lastName };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return { success: true, user: user, session: session };
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
        isAdmin: isAdmin
    };

    // Auto-initialize
    initStorage();
})();

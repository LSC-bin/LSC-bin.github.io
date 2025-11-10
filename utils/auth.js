/**
 * utils/auth.js
 * 인증 상태를 관리하는 공통 서비스
 */
(function (global) {
    'use strict';

    const STORAGE_KEY = 'auth.session';
    const LEGACY_KEYS = ['isLoggedIn', 'userRole', 'userName', 'userEmail', 'userPhone', 'userBio'];

    let sessionCache = null;

    const storage = () => {
        try {
            return global.localStorage;
        } catch (err) {
            console.warn('[AuthService] localStorage is not available:', err);
            return null;
        }
    };

    function createAuthError(code, message) {
        const error = new Error(message);
        error.name = 'AuthError';
        error.code = code;
        return error;
    }

    function loadSessionFromStorage() {
        if (sessionCache) {
            return sessionCache;
        }
        const store = storage();
        if (!store) {
            return null;
        }
        try {
            const raw = store.getItem(STORAGE_KEY);
            sessionCache = raw ? JSON.parse(raw) : null;
        } catch (err) {
            console.warn('[AuthService] Failed to parse stored session:', err);
            sessionCache = null;
        }
        return sessionCache;
    }

    function persistSession(session) {
        sessionCache = session;
        const store = storage();
        if (!store) {
            return;
        }
        try {
            if (!session) {
                store.removeItem(STORAGE_KEY);
            } else {
                store.setItem(STORAGE_KEY, JSON.stringify(session));
            }
        } catch (err) {
            console.warn('[AuthService] Failed to persist session:', err);
        }
    }

    function syncLegacyProfile(user) {
        const store = storage();
        if (!store) {
            return;
        }
        try {
            if (!user) {
                LEGACY_KEYS.forEach((key) => store.removeItem(key));
                return;
            }
            store.setItem('isLoggedIn', 'true');
            store.setItem('userRole', user.role || 'admin');
            store.setItem('userName', user.name || '사용자');
            if (user.email) {
                store.setItem('userEmail', user.email);
            }
            if (user.phone) {
                store.setItem('userPhone', user.phone);
            }
            if (user.bio) {
                store.setItem('userBio', user.bio);
            }
        } catch (err) {
            console.warn('[AuthService] Failed to sync legacy profile data:', err);
        }
    }

    function clearLegacyProfile() {
        syncLegacyProfile(null);
        const store = storage();
        if (!store) {
            return;
        }
        try {
            store.removeItem('selectedClass');
            store.removeItem('selectedClassId');
        } catch (err) {
            console.warn('[AuthService] Failed to remove legacy class selection:', err);
        }
    }

    function getCurrentSession() {
        return loadSessionFromStorage();
    }

    function getCurrentUser() {
        const session = getCurrentSession();
        return session && session.user ? session.user : null;
    }

    async function signIn(credentials = {}) {
        const normalized = credentials || {};
        const { identifier, email, username } = normalized;

        return new Promise((resolve) => {
            setTimeout(() => {
                const user = {
                    id: normalized.id || 'mock-admin',
                    name: normalized.name || username || identifier || '관리자',
                    role: 'admin',
                    email: email || 'admin@classboard.io',
                    lastLoginAt: new Date().toISOString()
                };

                // TODO: Replace with real API

                const session = {
                    user,
                    issuedAt: Date.now(),
                    provider: normalized.provider || 'legacy'
                };

                persistSession(session);
                syncLegacyProfile(user);

                resolve({ user, session });
            }, 200);
        });
    }

    async function signOut() {
        persistSession(null);
        clearLegacyProfile();
        return Promise.resolve();
    }

    async function requireSession(options = {}) {
        const session = getCurrentSession();
        if (session && session.user) {
            return session.user;
        }

        if (options.redirect !== false && typeof global.window !== 'undefined') {
            const redirectTo = options.redirectTo || options.loginPage || 'index.html';
            if (redirectTo) {
                global.window.location.href = redirectTo;
            }
        }

        throw createAuthError('AUTH_REQUIRED', 'Authentication is required.');
    }

    function isAuthenticated() {
        const session = getCurrentSession();
        return Boolean(session && session.user);
    }

    function updateUser(partialUser = {}) {
        const session = getCurrentSession();
        if (!session || !session.user) {
            return null;
        }
        const updatedUser = Object.assign({}, session.user, partialUser);
        const updatedSession = Object.assign({}, session, { user: updatedUser });
        persistSession(updatedSession);
        syncLegacyProfile(updatedUser);
        return updatedUser;
    }

    const AuthService = {
        signIn,
        signOut,
        requireSession,
        isAuthenticated,
        getCurrentSession,
        getCurrentUser,
        updateUser
    };

    global.AuthService = Object.assign({}, global.AuthService || {}, AuthService);

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = AuthService;
    }
})(typeof window !== 'undefined' ? window : globalThis);

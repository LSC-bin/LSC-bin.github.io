const STORAGE_KEY = 'auth.session';
const LEGACY_KEYS = ['isLoggedIn', 'userRole', 'userName', 'userEmail', 'userPhone', 'userBio'];

let sessionCache = null;

const globalRef = typeof window !== 'undefined' ? window : globalThis;

function getStorage() {
    try {
        return globalRef.localStorage;
    } catch (error) {
        console.warn('[AuthService] localStorage is not available:', error);
        return null;
    }
}

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

    const store = getStorage();
    if (!store) {
        return null;
    }

    try {
        const raw = store.getItem(STORAGE_KEY);
        sessionCache = raw ? JSON.parse(raw) : null;
    } catch (error) {
        console.warn('[AuthService] Failed to parse stored session:', error);
        sessionCache = null;
    }

    return sessionCache;
}

function persistSession(session) {
    sessionCache = session;
    const store = getStorage();
    if (!store) {
        return;
    }

    try {
        if (!session) {
            store.removeItem(STORAGE_KEY);
        } else {
            store.setItem(STORAGE_KEY, JSON.stringify(session));
        }
    } catch (error) {
        console.warn('[AuthService] Failed to persist session:', error);
    }
}

function syncLegacyProfile(user) {
    const store = getStorage();
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
    } catch (error) {
        console.warn('[AuthService] Failed to sync legacy profile data:', error);
    }
}

function clearLegacyProfile() {
    syncLegacyProfile(null);
    const store = getStorage();
    if (!store) {
        return;
    }

    try {
        store.removeItem('selectedClass');
        store.removeItem('selectedClassId');
    } catch (error) {
        console.warn('[AuthService] Failed to remove legacy class selection:', error);
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

    if (options.redirect !== false && typeof globalRef.window !== 'undefined') {
        const redirectTo = options.redirectTo || options.loginPage || 'index.html';
        if (redirectTo) {
            globalRef.window.location.href = redirectTo;
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

if (typeof window !== 'undefined') {
    window.AuthService = Object.assign({}, window.AuthService || {}, AuthService);
}

export {
    AuthService,
    signIn,
    signOut,
    requireSession,
    isAuthenticated,
    getCurrentSession,
    getCurrentUser,
    updateUser
};

export default AuthService;

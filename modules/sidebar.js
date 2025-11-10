const globalRef = typeof window !== 'undefined' ? window : globalThis;

const AppUtilsRef = globalRef.AppUtils || {};
const AuthServiceRef = globalRef.AuthService || {};

const getStoredValue = typeof AppUtilsRef.getStoredValue === 'function'
    ? (key, fallback) => AppUtilsRef.getStoredValue(key, fallback)
    : () => null;

const setStoredValue = typeof AppUtilsRef.setStoredValue === 'function'
    ? (key, value) => AppUtilsRef.setStoredValue(key, value)
    : () => {};

const DEFAULT_STORAGE_KEY = 'sidebar.collapsed';
const controllers = new WeakMap();

let preferenceHook = {
    load: null,
    persist: null
};

function registerSidebarPreferenceHook(hook = {}) {
    preferenceHook = {
        load: typeof hook.load === 'function' ? hook.load : null,
        persist: typeof hook.persist === 'function' ? hook.persist : null
    };
}

function resolveUserIdentifier() {
    if (!AuthServiceRef || typeof AuthServiceRef.getCurrentUser !== 'function') {
        return null;
    }
    try {
        const user = AuthServiceRef.getCurrentUser();
        if (!user) {
            return null;
        }
        return user.id || user.email || user.username || user.name || null;
    } catch (error) {
        console.warn('[sidebar] Failed to resolve user identifier:', error);
        return null;
    }
}

function buildStorageKey(baseKey, userKey) {
    return userKey ? `${baseKey}::${userKey}` : baseKey;
}

function parseStoredBoolean(value, fallback) {
    if (value === null || value === undefined) {
        return fallback;
    }
    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'string') {
        if (value === 'true') {
            return true;
        }
        if (value === 'false') {
            return false;
        }
    }
    return Boolean(value);
}

function getRaf(provider) {
    if (typeof provider === 'function') {
        return provider;
    }
    if (typeof globalRef.requestAnimationFrame === 'function') {
        return globalRef.requestAnimationFrame.bind(globalRef);
    }
    return (callback) => setTimeout(callback, 0);
}

function initSidebar(rootElement, options = {}) {
    const doc = rootElement && rootElement.ownerDocument
        ? rootElement.ownerDocument
        : (globalRef.document || null);

    if (!doc) {
        return null;
    }

    let root = rootElement;
    if (!root) {
        root = doc.querySelector('.sidebar') || doc.getElementById('sidebar');
    }

    if (!root) {
        return null;
    }

    const existingController = controllers.get(root);
    if (existingController) {
        return existingController;
    }

    const {
        collapsedClass = 'collapsed',
        activeClass = 'active',
        navbarToggleSelector = '#navbar-sidebar-toggle',
        menuToggleSelector = '#menu-btn',
        storageKey = DEFAULT_STORAGE_KEY,
        breakpoint = 768,
        persistToAuth = true,
        autoCloseOnNavigate = true,
        rafProvider
    } = options;

    const navbarToggle = navbarToggleSelector ? doc.querySelector(navbarToggleSelector) : null;
    const menuToggle = menuToggleSelector ? doc.querySelector(menuToggleSelector) : null;
    const raf = getRaf(rafProvider);

    const userKey = resolveUserIdentifier();
    const effectiveStorageKey = buildStorageKey(storageKey, userKey);

    function loadPreference() {
        if (preferenceHook.load) {
            try {
                const result = preferenceHook.load({
                    root,
                    storageKey: effectiveStorageKey,
                    userKey,
                    options
                });
                if (typeof result === 'boolean') {
                    return result;
                }
            } catch (error) {
                console.warn('[sidebar] preference load hook failed:', error);
            }
        }

        const stored = getStoredValue(effectiveStorageKey, null);
        if (stored !== null && stored !== undefined) {
            return parseStoredBoolean(stored, false);
        }

        if (persistToAuth && userKey && typeof AuthServiceRef.getCurrentUser === 'function') {
            try {
                const user = AuthServiceRef.getCurrentUser();
                if (user && user.preferences && Object.prototype.hasOwnProperty.call(user.preferences, 'sidebarCollapsed')) {
                    return Boolean(user.preferences.sidebarCollapsed);
                }
            } catch (error) {
                console.warn('[sidebar] Failed to load sidebar state from AuthService:', error);
            }
        }

        return false;
    }

    function updateAria(collapsed) {
        const expandedValue = collapsed ? 'false' : 'true';
        root.setAttribute('aria-expanded', expandedValue);
        root.setAttribute('data-sidebar-collapsed', collapsed ? 'true' : 'false');
        if (navbarToggle) {
            navbarToggle.setAttribute('aria-expanded', expandedValue);
            navbarToggle.setAttribute('aria-pressed', collapsed ? 'true' : 'false');
        }
    }

    function persistPreference(collapsed) {
        try {
            setStoredValue(effectiveStorageKey, String(collapsed));
        } catch (error) {
            console.warn('[sidebar] Failed to persist sidebar state:', error);
        }

        if (persistToAuth && userKey && typeof AuthServiceRef.updateUser === 'function') {
            try {
                const currentUser = typeof AuthServiceRef.getCurrentUser === 'function'
                    ? AuthServiceRef.getCurrentUser()
                    : null;
                if (currentUser) {
                    const preferences = Object.assign({}, currentUser.preferences || {}, {
                        sidebarCollapsed: Boolean(collapsed)
                    });
                    AuthServiceRef.updateUser({ preferences });
                }
            } catch (error) {
                console.warn('[sidebar] Failed to sync sidebar state with AuthService:', error);
            }
        }

        if (preferenceHook.persist) {
            try {
                preferenceHook.persist({
                    collapsed,
                    root,
                    storageKey: effectiveStorageKey,
                    userKey,
                    options
                });
            } catch (error) {
                console.warn('[sidebar] preference persist hook failed:', error);
            }
        }
    }

    function setCollapsedState(collapsed, { persist = true } = {}) {
        const next = Boolean(collapsed);
        root.classList.toggle(collapsedClass, next);
        updateAria(next);
        if (persist) {
            persistPreference(next);
        }
        return next;
    }

    function toggleCollapsedState() {
        const next = !root.classList.contains(collapsedClass);
        return setCollapsedState(next);
    }

    function openMobile() {
        root.classList.add(activeClass);
    }

    function closeMobile() {
        root.classList.remove(activeClass);
    }

    const removeListeners = [];

    if (navbarToggle) {
        const handleNavbarToggle = (event) => {
            event.preventDefault();
            toggleCollapsedState();
        };
        navbarToggle.addEventListener('click', handleNavbarToggle);
        removeListeners.push(() => navbarToggle.removeEventListener('click', handleNavbarToggle));
    }

    if (menuToggle) {
        const handleMenuToggle = (event) => {
            event.preventDefault();
            if (root.classList.contains(activeClass)) {
                closeMobile();
            } else {
                openMobile();
            }
        };
        menuToggle.addEventListener('click', handleMenuToggle);
        removeListeners.push(() => menuToggle.removeEventListener('click', handleMenuToggle));
    }

    let resizeScheduled = false;
    const handleResize = () => {
        if (resizeScheduled) {
            return;
        }
        resizeScheduled = true;
        raf(() => {
            resizeScheduled = false;
            const width = typeof globalRef.innerWidth === 'number' ? globalRef.innerWidth : Infinity;
            if (width > breakpoint) {
                closeMobile();
            }
        });
    };

    if (typeof globalRef.addEventListener === 'function') {
        globalRef.addEventListener('resize', handleResize, { passive: true });
        removeListeners.push(() => globalRef.removeEventListener('resize', handleResize));
    }

    if (autoCloseOnNavigate) {
        const handleMenuClick = (event) => {
            const target = event.target;
            if (!target || typeof target.closest !== 'function') {
                return;
            }
            const link = target.closest('.menu-link, .menu-item a');
            if (!link || !root.contains(link)) {
                return;
            }
            const width = typeof globalRef.innerWidth === 'number' ? globalRef.innerWidth : Infinity;
            if (width <= breakpoint) {
                closeMobile();
            }
        };
        root.addEventListener('click', handleMenuClick);
        removeListeners.push(() => root.removeEventListener('click', handleMenuClick));
    }

    const initialCollapsed = loadPreference();
    setCollapsedState(initialCollapsed, { persist: false });

    const controller = {
        root,
        get collapsed() {
            return root.classList.contains(collapsedClass);
        },
        setCollapsed(value) {
            return setCollapsedState(value);
        },
        toggleCollapsed() {
            return toggleCollapsedState();
        },
        isMobileOpen() {
            return root.classList.contains(activeClass);
        },
        openMobile,
        closeMobile,
        destroy() {
            removeListeners.forEach((remove) => remove());
            controllers.delete(root);
            root.removeAttribute('data-sidebar-collapsed');
            root.removeAttribute('aria-expanded');
        }
    };

    controllers.set(root, controller);
    return controller;
}

function getSidebarController(rootElement) {
    const doc = globalRef.document;
    const root = rootElement || (doc && (doc.querySelector('.sidebar') || doc.getElementById('sidebar')));
    return root ? controllers.get(root) || null : null;
}

const SidebarModule = {
    initSidebar,
    getSidebarController,
    registerSidebarPreferenceHook
};

if (typeof window !== 'undefined') {
    window.SidebarModule = Object.assign({}, window.SidebarModule || {}, SidebarModule);
    window.initSidebar = initSidebar;
    window.registerSidebarPreferenceHook = registerSidebarPreferenceHook;
}

export { initSidebar, getSidebarController, registerSidebarPreferenceHook };
export default SidebarModule;

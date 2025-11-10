/* global Intl */

const DEFAULT_LOCALE = 'ko-KR';
const DEFAULT_TIME_STYLE = { hour: '2-digit', minute: '2-digit' };

const hasWindow = typeof window !== 'undefined';
const storage = hasWindow ? window.localStorage : null;

function toDate(input) {
    if (!input && input !== 0) {
        return null;
    }

    if (input instanceof Date) {
        return Number.isNaN(input.getTime()) ? null : input;
    }

    if (typeof input === 'number' || typeof input === 'string') {
        const date = new Date(input);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    if (typeof input === 'object' && input !== null) {
        if (typeof input.seconds === 'number') {
            const date = new Date(input.seconds * 1000);
            return Number.isNaN(date.getTime()) ? null : date;
        }
        if (typeof input.toDate === 'function') {
            try {
                const date = input.toDate();
                return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
            } catch {
                return null;
            }
        }
    }

    return null;
}

function formatDate(value, options = {}) {
    const date = toDate(value);
    if (!date) {
        return '';
    }

    const { style = 'literal', locale = DEFAULT_LOCALE } = options;

    if (style === 'iso') {
        return date.toISOString();
    }

    if (style === 'time') {
        return new Intl.DateTimeFormat(locale, DEFAULT_TIME_STYLE).format(date);
    }

    if (style === 'numeric') {
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(date);
    }

    if (style === 'weekday') {
        return new Intl.DateTimeFormat(locale, {
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    if (style === 'long') {
        return new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
}

function formatTime(value, options = {}) {
    const date = toDate(value);
    if (!date) {
        return '';
    }

    const { locale = DEFAULT_LOCALE, ...timeOptions } = options;
    const resolvedOptions = Object.keys(timeOptions).length > 0 ? timeOptions : DEFAULT_TIME_STYLE;

    return new Intl.DateTimeFormat(locale, resolvedOptions).format(date);
}

function timeAgo(value, options = {}) {
    const date = toDate(value);
    if (!date) {
        return '';
    }

    const { locale = DEFAULT_LOCALE, now = Date.now() } = options;
    const diff = date.getTime() - (now instanceof Date ? now.getTime() : now);

    const divisors = [
        { unit: 'year', value: 1000 * 60 * 60 * 24 * 365 },
        { unit: 'month', value: 1000 * 60 * 60 * 24 * 30 },
        { unit: 'week', value: 1000 * 60 * 60 * 24 * 7 },
        { unit: 'day', value: 1000 * 60 * 60 * 24 },
        { unit: 'hour', value: 1000 * 60 * 60 },
        { unit: 'minute', value: 1000 * 60 },
        { unit: 'second', value: 1000 }
    ];

    const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    for (const divisor of divisors) {
        if (Math.abs(diff) >= divisor.value || divisor.unit === 'second') {
            const valueInUnit = Math.round(diff / divisor.value);
            return formatter.format(valueInUnit, divisor.unit);
        }
    }

    return '';
}

function getRelativeTime(value, options = {}) {
    return timeAgo(value, options);
}

function getTimeAgo(value, options = {}) {
    return timeAgo(value, options);
}

function truncateText(text, limit = 120, ellipsis = '…') {
    if (text == null) {
        return '';
    }

    const stringified = String(text);
    if (stringified.length <= limit) {
        return stringified;
    }

    return `${stringified.slice(0, Math.max(0, limit)).trimEnd()}${ellipsis}`;
}

function escapeHtml(value) {
    if (value == null) {
        return '';
    }

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function generateId(prefix = 'id') {
    const random = Math.random().toString(36).slice(2, 9);
    return `${prefix}_${Date.now()}_${random}`;
}

function parseStorage(value, fallback) {
    if (value == null) {
        return fallback;
    }

    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

function getStoredData(key, fallback = null) {
    if (!storage) {
        return fallback;
    }

    const value = storage.getItem(key);
    return parseStorage(value, fallback);
}

function setStoredData(key, value) {
    if (!storage) {
        return;
    }

    try {
        storage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn('[AppUtils] Failed to persist data to storage:', error);
    }
}

function getStoredValue(key, fallback = null) {
    if (!storage) {
        return fallback;
    }

    const value = storage.getItem(key);
    return value == null ? fallback : value;
}

function setStoredValue(key, value) {
    if (!storage) {
        return;
    }

    try {
        storage.setItem(key, value);
    } catch (error) {
        console.warn('[AppUtils] Failed to set value in storage:', error);
    }
}

function removeStoredData(key) {
    if (!storage) {
        return;
    }

    try {
        storage.removeItem(key);
    } catch (error) {
        console.warn('[AppUtils] Failed to remove value from storage:', error);
    }
}

function getStoredArray(key, fallback = []) {
    const value = getStoredData(key, fallback);
    return Array.isArray(value) ? value : fallback;
}

function setStoredArray(key, value) {
    setStoredData(key, Array.isArray(value) ? value : []);
}

function showToast(message, type = 'info') {
    if (!hasWindow) {
        return;
    }

    if (typeof window.showAlert === 'function') {
        window.showAlert(message, type);
        return;
    }

    // eslint-disable-next-line no-alert
    window.alert(message);
}

const AppUtils = {
    escapeHtml,
    generateId,
    formatDate,
    formatTime,
    getRelativeTime,
    getTimeAgo,
    timeAgo,
    truncateText,
    getStoredData,
    setStoredData,
    getStoredValue,
    setStoredValue,
    removeStoredData,
    getStoredArray,
    setStoredArray,
    showToast
};

export { AppUtils };
export default AppUtils;

/**
 * utils/common.js
 * 공통 유틸리티 함수 모음 - 모든 프런트엔드 스크립트에서 재사용
 */
(function (global) {
    'use strict';

    const toDate = (input) => {
        if (input instanceof Date) {
            return Number.isNaN(input.getTime()) ? null : input;
        }
        const date = new Date(input);
        return Number.isNaN(date.getTime()) ? null : date;
    };

    function escapeHtml(text = '') {
        const div = global.document ? global.document.createElement('div') : null;
        const value = text == null ? '' : String(text);
        if (!div) {
            return value
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }
        div.textContent = value;
        return div.innerHTML;
    }

    function generateId(prefix = 'id') {
        const timestamp = Date.now();
        const randomSegment = Math.random().toString(36).slice(2, 10);
        return `${prefix}_${timestamp}_${randomSegment}`;
    }

    function formatTime(dateInput, options = {}) {
        const date = toDate(dateInput);
        if (!date) return '';
        const {
            locale = 'ko-KR',
            timeStyle,
            timeOptions = { hour: '2-digit', minute: '2-digit' }
        } = options;
        if (timeStyle) {
            return date.toLocaleTimeString(locale, { timeStyle });
        }
        return date.toLocaleTimeString(locale, timeOptions);
    }

    function formatDate(dateInput, options = {}) {
        const date = toDate(dateInput);
        if (!date) return '';

        const {
            locale = 'ko-KR',
            style = 'literal',
            includeTime = false,
            timeOptions
        } = options;

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        let formatted;
        switch (style) {
            case 'iso':
                formatted = `${year}-${month}-${day}`;
                break;
            case 'compact':
                formatted = `${month}/${day}`;
                break;
            case 'numeric':
                formatted = date.toLocaleDateString(locale, {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
                break;
            case 'long':
                formatted = date.toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                break;
            case 'literal':
            default:
                formatted = `${year}년 ${month}월 ${day}일`;
                break;
        }

        if (includeTime) {
            const timeString = formatTime(date, { locale, timeOptions });
            formatted = timeString ? `${formatted} ${timeString}` : formatted;
        }

        return formatted;
    }

    function getRelativeTime(dateInput, options = {}) {
        const date = toDate(dateInput);
        if (!date) return '';
        const now = options.now ? toDate(options.now) : new Date();
        if (!now) return '';

        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return options.justNowText || '방금 전';
        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        if (days < 7) return `${days}일 전`;

        return formatDate(date, { style: options.fallbackStyle || 'long', locale: options.locale || 'ko-KR' });
    }

    function getTimeAgo(dateInput) {
        const date = toDate(dateInput);
        if (!date) return '';

        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return '방금 전';
        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        if (days < 7) return `${days}일 전`;

        return formatDate(date, { style: 'numeric' });
    }

    const safeJsonParse = (value, fallback) => {
        if (value === null || value === undefined || value === '') {
            return fallback;
        }
        try {
            return JSON.parse(value);
        } catch (err) {
            console.warn('[AppUtils] Failed to parse JSON from storage:', err);
            return fallback;
        }
    };

    function getStoredData(key, fallback = null) {
        if (typeof global.localStorage === 'undefined') {
            return fallback;
        }
        const raw = global.localStorage.getItem(key);
        return safeJsonParse(raw, fallback);
    }

    function setStoredData(key, value) {
        if (typeof global.localStorage === 'undefined') {
            return;
        }
        try {
            global.localStorage.setItem(key, JSON.stringify(value));
        } catch (err) {
            console.warn('[AppUtils] Failed to stringify data for storage:', err);
        }
    }

    function getStoredArray(key, fallback = []) {
        const data = getStoredData(key, fallback);
        return Array.isArray(data) ? data : fallback;
    }

    function setStoredArray(key, value) {
        setStoredData(key, Array.isArray(value) ? value : []);
    }

    function showToast(message, type = 'success') {
        if (!global.document) return;
        const toastContainer = global.document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = global.document.createElement('div');
        toast.className = `toast toast-${type}`;
        const iconClass = type === 'success'
            ? 'bx-check-circle'
            : type === 'error'
                ? 'bx-error-circle'
                : 'bx-info-circle';

        toast.innerHTML = `
        <div class="toast-content">
            <i class="bx ${iconClass}"></i>
            <span>${escapeHtml(message)}</span>
        </div>
    `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    const AppUtils = {
        escapeHtml,
        generateId,
        formatDate,
        formatTime,
        getRelativeTime,
        getTimeAgo,
        getStoredData,
        setStoredData,
        getStoredArray,
        setStoredArray,
        showToast
    };

    global.AppUtils = Object.assign({}, global.AppUtils || {}, AppUtils);

    if (global.AppUtils.showToast) {
        global.showToast = global.AppUtils.showToast;
    }

    if (global.AppUtils.escapeHtml) {
        global.escapeHtml = global.AppUtils.escapeHtml;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = global.AppUtils;
    }
})(typeof window !== 'undefined' ? window : globalThis);


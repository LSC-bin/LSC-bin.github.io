import AppUtils, { AppUtils as AppUtilsNamed } from './app-utils.js';

const globalRef = typeof window !== 'undefined' ? window : globalThis;

function showToast(message, type = 'success') {
    if (!globalRef.document) {
        AppUtils.showToast(message, type);
        return;
    }

    const toastContainer = globalRef.document.getElementById('toast-container');
    if (!toastContainer) {
        AppUtils.showToast(message, type);
        return;
    }

    const toast = globalRef.document.createElement('div');
    toast.className = `toast toast-${type}`;
    const iconClass = type === 'success'
        ? 'bx-check-circle'
        : type === 'error'
            ? 'bx-error-circle'
            : 'bx-info-circle';

    toast.innerHTML = `
        <div class="toast-content">
            <i class="bx ${iconClass}"></i>
            <span>${AppUtils.escapeHtml(message)}</span>
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

const CommonUtils = Object.assign({}, AppUtilsNamed, { showToast });

if (typeof window !== 'undefined') {
    window.AppUtils = Object.assign({}, window.AppUtils || {}, CommonUtils);
    window.showToast = showToast;
    window.escapeHtml = AppUtils.escapeHtml;
}

export { CommonUtils as AppUtils, CommonUtils, showToast };
export default CommonUtils;

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './toast.css';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, durationMs?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', durationMs = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id));
      }, durationMs);
    }
  }, []);

  const value = useMemo(() => ({ toasts, showToast }), [toasts, showToast]);

  const portalTarget = typeof document !== 'undefined' ? document.body : null;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {portalTarget
        ? createPortal(
            <div className="toast-container">
              {toasts.map((toast) => (
                <div key={toast.id} className={`toast toast-${toast.type}`} role="status">
                  {toast.message}
                </div>
              ))}
            </div>,
            portalTarget
          )
        : null}
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

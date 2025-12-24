'use client';

import { useState, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

// Global toast state
let toastListeners: Array<(toast: Toast) => void> = [];

/**
 * Show a toast notification
 */
export function showToast(
  type: ToastType,
  message: string,
  title?: string,
  duration: number = 5000
): void {
  const toast: Toast = {
    id: Math.random().toString(36).substr(2, 9),
    type,
    message,
    title,
    duration,
  };
  
  toastListeners.forEach(listener => listener(toast));
}

// Convenience methods
export const toast = {
  success: (message: string, title?: string) => showToast('success', message, title),
  error: (message: string, title?: string) => showToast('error', message, title),
  warning: (message: string, title?: string) => showToast('warning', message, title),
  info: (message: string, title?: string) => showToast('info', message, title),
};

const typeConfig: Record<ToastType, { icon: string; bg: string; border: string }> = {
  success: { icon: 'ti-check', bg: 'bg-success', border: 'border-success' },
  error: { icon: 'ti-x', bg: 'bg-danger', border: 'border-danger' },
  warning: { icon: 'ti-alert-triangle', bg: 'bg-warning', border: 'border-warning' },
  info: { icon: 'ti-info-circle', bg: 'bg-info', border: 'border-info' },
};

/**
 * Toast Container Component
 * Place this once in your layout
 */
export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts(prev => [...prev, toast]);
      
      // Auto remove after duration
      if (toast.duration) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toast.id));
        }, toast.duration);
      }
    };
    
    toastListeners.push(listener);
    
    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div 
      className="position-fixed top-0 end-0 p-3" 
      style={{ zIndex: 1100, minWidth: '300px' }}
    >
      {toasts.map(toast => {
        const config = typeConfig[toast.type];
        
        return (
          <div
            key={toast.id}
            className={`toast show mb-2 border-start border-4 ${config.border}`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="toast-header">
              <i className={`ti ${config.icon} me-2 text-${toast.type === 'error' ? 'danger' : toast.type}`}></i>
              <strong className="me-auto">
                {toast.title || toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}
              </strong>
              <button
                type="button"
                className="btn-close"
                onClick={() => removeToast(toast.id)}
                aria-label="Close"
              ></button>
            </div>
            <div className="toast-body">
              {toast.message}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ToastContainer;

'use client';

import React from 'react';

// ============================================
// LOADING SPINNER
// ============================================

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export function Spinner({ size = 'md', variant = 'primary', className = '' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg',
  };

  const variantClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    white: 'text-white',
  };

  return (
    <div
      className={`spinner-border ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      role="status"
    >
      <span className="visually-hidden">Loading...</span>
    </div>
  );
}

// ============================================
// PAGE LOADING
// ============================================

interface PageLoadingProps {
  text?: string;
}

export function PageLoading({ text = 'Loading...' }: PageLoadingProps) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-50 py-5">
      <Spinner size="lg" />
      <p className="mt-3 text-muted">{text}</p>
    </div>
  );
}

// ============================================
// BUTTON LOADING
// ============================================

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'outline-primary' | 'outline-secondary';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  children: React.ReactNode;
}

export function LoadingButton({
  loading = false,
  loadingText,
  variant = 'primary',
  size = 'md',
  icon,
  children,
  disabled,
  className = '',
  ...props
}: LoadingButtonProps) {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';

  return (
    <button
      className={`btn btn-${variant} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size="sm" variant={variant.includes('outline') ? 'primary' : 'white'} className="me-2" />
          {loadingText || children}
        </>
      ) : (
        <>
          {icon && <i className={`ti ${icon} me-2`}></i>}
          {children}
        </>
      )}
    </button>
  );
}

// ============================================
// SKELETON LOADERS
// ============================================

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  width,
  height,
  variant = 'text',
  className = '',
  animation = 'pulse',
}: SkeletonProps) {
  const baseStyle: React.CSSProperties = {
    backgroundColor: '#e9ecef',
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1em' : undefined),
    borderRadius: variant === 'circular' ? '50%' : variant === 'text' ? '4px' : '8px',
    animation: animation === 'pulse' ? 'skeleton-pulse 1.5s ease-in-out infinite' : 
               animation === 'wave' ? 'skeleton-wave 1.5s ease-in-out infinite' : 'none',
  };

  return (
    <>
      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes skeleton-wave {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
      <span className={`d-inline-block ${className}`} style={baseStyle} />
    </>
  );
}

export function SkeletonCard() {
  return (
    <div className="card">
      <div className="card-body">
        <Skeleton height={200} variant="rectangular" className="mb-3" />
        <Skeleton width="60%" className="mb-2" />
        <Skeleton width="40%" className="mb-3" />
        <div className="d-flex gap-2">
          <Skeleton width={80} height={32} variant="rectangular" />
          <Skeleton width={80} height={32} variant="rectangular" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th><Skeleton width="80%" /></th>
            <th><Skeleton width="60%" /></th>
            <th><Skeleton width="70%" /></th>
            <th><Skeleton width="50%" /></th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              <td><Skeleton /></td>
              <td><Skeleton width="80%" /></td>
              <td><Skeleton width="60%" /></td>
              <td><Skeleton width="40%" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// EMPTY STATE
// ============================================

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  className?: string;
}

export function EmptyState({
  icon = 'ti-inbox',
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`text-center py-5 ${className}`}>
      <div className="mb-3">
        <i className={`ti ${icon} ti-xl text-muted`} style={{ fontSize: '4rem' }}></i>
      </div>
      <h5 className="text-muted mb-2">{title}</h5>
      {description && <p className="text-muted mb-4">{description}</p>}
      {action && (
        <button
          className={`btn btn-${action.variant || 'primary'}`}
          onClick={action.onClick}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// ============================================
// ERROR DISPLAY
// ============================================

interface ErrorDisplayProps {
  title?: string;
  message: string;
  retry?: () => void;
  className?: string;
}

export function ErrorDisplay({
  title = 'Something went wrong',
  message,
  retry,
  className = '',
}: ErrorDisplayProps) {
  return (
    <div className={`text-center py-5 ${className}`}>
      <div className="mb-3">
        <i className="ti ti-alert-circle ti-xl text-danger" style={{ fontSize: '4rem' }}></i>
      </div>
      <h5 className="text-danger mb-2">{title}</h5>
      <p className="text-muted mb-4">{message}</p>
      {retry && (
        <button className="btn btn-outline-primary" onClick={retry}>
          <i className="ti ti-refresh me-2"></i>
          Try Again
        </button>
      )}
    </div>
  );
}

// ============================================
// ALERT / NOTIFICATION BANNER
// ============================================

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  closable?: boolean;
  onClose?: () => void;
  className?: string;
}

export function Alert({
  type,
  title,
  message,
  closable = false,
  onClose,
  className = '',
}: AlertProps) {
  const typeConfig = {
    success: { class: 'alert-success', icon: 'ti-check' },
    error: { class: 'alert-danger', icon: 'ti-x' },
    warning: { class: 'alert-warning', icon: 'ti-alert-triangle' },
    info: { class: 'alert-info', icon: 'ti-info-circle' },
  };

  const config = typeConfig[type];

  return (
    <div className={`alert ${config.class} d-flex align-items-center ${className}`} role="alert">
      <i className={`ti ${config.icon} me-3`}></i>
      <div className="flex-grow-1">
        {title && <strong className="d-block">{title}</strong>}
        {message}
      </div>
      {closable && onClose && (
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={onClose}
        ></button>
      )}
    </div>
  );
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  onClose: (id: string) => void;
}

export function Toast({ id, type, message, title, onClose }: ToastProps) {
  const typeConfig = {
    success: { bg: 'bg-success', icon: 'ti-check' },
    error: { bg: 'bg-danger', icon: 'ti-x' },
    warning: { bg: 'bg-warning', icon: 'ti-alert-triangle' },
    info: { bg: 'bg-info', icon: 'ti-info-circle' },
  };

  const config = typeConfig[type];

  React.useEffect(() => {
    const timer = setTimeout(() => onClose(id), 5000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div
      className={`toast show ${config.bg} text-white`}
      role="alert"
      style={{ animation: 'slideIn 0.3s ease-out' }}
    >
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      <div className="toast-header">
        <i className={`ti ${config.icon} me-2`}></i>
        <strong className="me-auto">{title || type.charAt(0).toUpperCase() + type.slice(1)}</strong>
        <button
          type="button"
          className="btn-close btn-close-white"
          onClick={() => onClose(id)}
        ></button>
      </div>
      <div className="toast-body">{message}</div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function ToastContainer({
  toasts,
  onClose,
  position = 'top-right',
}: ToastContainerProps) {
  const positionStyles: Record<string, React.CSSProperties> = {
    'top-right': { top: '1rem', right: '1rem' },
    'top-left': { top: '1rem', left: '1rem' },
    'bottom-right': { bottom: '1rem', right: '1rem' },
    'bottom-left': { bottom: '1rem', left: '1rem' },
  };

  return (
    <div
      className="toast-container position-fixed"
      style={{ ...positionStyles[position], zIndex: 1100 }}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
}

// ============================================
// PROGRESS BAR
// ============================================

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  striped?: boolean;
  animated?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  striped = false,
  animated = false,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  
  const heightClass = size === 'sm' ? 'height: 0.5rem' : size === 'lg' ? 'height: 1.5rem' : 'height: 1rem';

  return (
    <div className={`progress ${className}`} style={{ [heightClass.split(':')[0]]: heightClass.split(':')[1] }}>
      <div
        className={`progress-bar bg-${variant} ${striped ? 'progress-bar-striped' : ''} ${animated ? 'progress-bar-animated' : ''}`}
        role="progressbar"
        style={{ width: `${percentage}%` }}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        {showLabel && `${percentage}%`}
      </div>
    </div>
  );
}

// ============================================
// BADGE
// ============================================

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark' | 'light';
  pill?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = 'primary',
  pill = false,
  children,
  className = '',
}: BadgeProps) {
  return (
    <span className={`badge bg-${variant} ${pill ? 'rounded-pill' : ''} ${className}`}>
      {children}
    </span>
  );
}

// ============================================
// CONFIRMATION MODAL
// ============================================

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger' | 'warning';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onCancel}></div>
      <div className="modal fade show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onCancel}></button>
            </div>
            <div className="modal-body">
              <p>{message}</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
                disabled={loading}
              >
                {cancelText}
              </button>
              <LoadingButton
                variant={variant}
                loading={loading}
                onClick={onConfirm}
              >
                {confirmText}
              </LoadingButton>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================
// EXPORT ALL
// ============================================

export default {
  Spinner,
  PageLoading,
  LoadingButton,
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  EmptyState,
  ErrorDisplay,
  Alert,
  Toast,
  ToastContainer,
  ProgressBar,
  Badge,
  ConfirmModal,
};

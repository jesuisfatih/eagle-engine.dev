'use client';

import React from 'react';

// ============================================
// LOADING OVERLAY
// ============================================

interface LoadingOverlayProps {
  visible: boolean;
  text?: string;
  blur?: boolean;
  fullScreen?: boolean;
}

export function LoadingOverlay({
  visible,
  text = 'Loading...',
  blur = true,
  fullScreen = false,
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className={`${fullScreen ? 'position-fixed' : 'position-absolute'} top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center`}
      style={{
        backgroundColor: blur ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: blur ? 'blur(4px)' : 'none',
        zIndex: 1000,
      }}
    >
      <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3 text-muted">{text}</p>
    </div>
  );
}

// ============================================
// ACTION RESULT TOAST
// ============================================

interface ActionResultProps {
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose: () => void;
}

export function ActionResult({ show, type, message, onClose }: ActionResultProps) {
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const typeConfig = {
    success: { bg: 'success', icon: 'ti-check' },
    error: { bg: 'danger', icon: 'ti-x' },
    warning: { bg: 'warning', icon: 'ti-alert-triangle' },
    info: { bg: 'info', icon: 'ti-info-circle' },
  };

  const config = typeConfig[type];

  return (
    <div
      className={`position-fixed bottom-0 end-0 m-3 toast show bg-${config.bg} text-white`}
      style={{ 
        zIndex: 1100,
        animation: 'slideInUp 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <div className="d-flex">
        <div className="toast-body d-flex align-items-center">
          <i className={`ti ${config.icon} me-2`}></i>
          {message}
        </div>
        <button
          type="button"
          className="btn-close btn-close-white me-2 m-auto"
          onClick={onClose}
        ></button>
      </div>
    </div>
  );
}

// ============================================
// STATS SKELETON
// ============================================

export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="row g-3 mb-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="col-sm-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div
                  className="rounded-3 me-3"
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#e9ecef',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
                <div className="flex-grow-1">
                  <div
                    style={{
                      width: '60%',
                      height: '14px',
                      backgroundColor: '#e9ecef',
                      borderRadius: '4px',
                      marginBottom: '8px',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                  />
                  <div
                    style={{
                      width: '40%',
                      height: '24px',
                      backgroundColor: '#e9ecef',
                      borderRadius: '4px',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

// ============================================
// TABLE SKELETON
// ============================================

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="card">
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i}>
                  <div
                    style={{
                      width: `${60 + Math.random() * 30}%`,
                      height: '16px',
                      backgroundColor: '#e9ecef',
                      borderRadius: '4px',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex}>
                    <div
                      style={{
                        width: `${50 + Math.random() * 40}%`,
                        height: '14px',
                        backgroundColor: '#e9ecef',
                        borderRadius: '4px',
                        animation: 'pulse 1.5s ease-in-out infinite',
                        animationDelay: `${(rowIndex * columns + colIndex) * 0.05}s`,
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

// ============================================
// FORM SKELETON
// ============================================

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="card">
      <div className="card-body">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="mb-3">
            <div
              style={{
                width: '30%',
                height: '14px',
                backgroundColor: '#e9ecef',
                borderRadius: '4px',
                marginBottom: '8px',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
            <div
              style={{
                width: '100%',
                height: '38px',
                backgroundColor: '#e9ecef',
                borderRadius: '6px',
                animation: 'pulse 1.5s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          </div>
        ))}
        <div className="d-flex gap-2 mt-4">
          <div
            style={{
              width: '100px',
              height: '38px',
              backgroundColor: '#e9ecef',
              borderRadius: '6px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              width: '80px',
              height: '38px',
              backgroundColor: '#e9ecef',
              borderRadius: '6px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

// ============================================
// INLINE ERROR
// ============================================

interface InlineErrorProps {
  message: string;
  className?: string;
}

export function InlineError({ message, className = '' }: InlineErrorProps) {
  return (
    <div className={`text-danger small mt-1 d-flex align-items-center ${className}`}>
      <i className="ti ti-alert-circle me-1"></i>
      {message}
    </div>
  );
}

// ============================================
// FIELD VALIDATION STATUS
// ============================================

interface FieldStatusProps {
  status: 'valid' | 'invalid' | 'pending' | 'none';
  message?: string;
}

export function FieldStatus({ status, message }: FieldStatusProps) {
  if (status === 'none') return null;

  const statusConfig = {
    valid: { icon: 'ti-check', color: 'text-success' },
    invalid: { icon: 'ti-x', color: 'text-danger' },
    pending: { icon: 'ti-loader', color: 'text-muted', spin: true },
  };

  const config = statusConfig[status];

  return (
    <span className={`${config.color} ms-2`}>
      <i
        className={`ti ${config.icon}`}
        style={'spin' in config && config.spin ? { animation: 'spin 1s linear infinite' } : undefined}
      />
      {message && <span className="ms-1 small">{message}</span>}
      {'spin' in config && config.spin && (
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      )}
    </span>
  );
}

// ============================================
// STEP INDICATOR
// ============================================

interface Step {
  label: string;
  completed?: boolean;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function StepIndicator({ steps, currentStep, className = '' }: StepIndicatorProps) {
  return (
    <div className={`d-flex align-items-center justify-content-between ${className}`}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="d-flex flex-column align-items-center">
            <div
              className={`rounded-circle d-flex align-items-center justify-content-center ${
                index < currentStep
                  ? 'bg-success text-white'
                  : index === currentStep
                  ? 'bg-primary text-white'
                  : 'bg-light text-muted'
              }`}
              style={{ width: '32px', height: '32px' }}
            >
              {index < currentStep ? (
                <i className="ti ti-check"></i>
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span className={`small mt-1 ${index <= currentStep ? 'text-dark' : 'text-muted'}`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-grow-1 mx-2 ${index < currentStep ? 'bg-success' : 'bg-light'}`}
              style={{ height: '2px' }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ============================================
// ANIMATED COUNTER
// ============================================

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1000,
  prefix = '',
  suffix = '',
  className = '',
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let start = 0;
    const end = value;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (end - start) * eased);
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

// ============================================
// COPY BUTTON
// ============================================

interface CopyButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function CopyButton({ text, className = '', size = 'md' }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      type="button"
      className={`btn btn-outline-secondary ${size === 'sm' ? 'btn-sm' : ''} ${className}`}
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      <i className={`ti ${copied ? 'ti-check' : 'ti-copy'}`}></i>
      {size !== 'sm' && <span className="ms-1">{copied ? 'Copied!' : 'Copy'}</span>}
    </button>
  );
}

// ============================================
// EXPORT ALL
// ============================================

export {
  LoadingOverlay,
  ActionResult,
  StatsSkeleton,
  TableSkeleton,
  FormSkeleton,
  InlineError,
  FieldStatus,
  StepIndicator,
  AnimatedCounter,
  CopyButton,
};

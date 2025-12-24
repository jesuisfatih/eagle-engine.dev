'use client';

import { InputHTMLAttributes, forwardRef, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: string;
  fullWidth?: boolean;
}

/**
 * Reusable Input Component
 * Consistent form styling across admin panel
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    hint,
    icon,
    fullWidth = true,
    className = '',
    id,
    ...props 
  }, ref) => {
    const generatedId = useId();
    const inputId = id || props.name || generatedId;
    const hasError = !!error;
    
    const inputClasses = [
      'form-control',
      hasError ? 'is-invalid' : '',
      className,
    ].filter(Boolean).join(' ');

    const wrapperClasses = fullWidth ? 'w-100' : '';

    return (
      <div className={`mb-3 ${wrapperClasses}`}>
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
            {props.required && <span className="text-danger ms-1">*</span>}
          </label>
        )}
        
        <div className={icon ? 'input-group' : ''}>
          {icon && (
            <span className="input-group-text">
              <i className={`ti ${icon}`}></i>
            </span>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            {...props}
          />
          
          {hasError && (
            <div className="invalid-feedback">{error}</div>
          )}
        </div>
        
        {hint && !hasError && (
          <div className="form-text">{hint}</div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

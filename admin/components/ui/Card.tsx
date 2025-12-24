'use client';

import { ReactNode } from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  icon?: string;
  children: ReactNode;
  actions?: ReactNode;
  noPadding?: boolean;
  className?: string;
}

/**
 * Reusable Card Component
 * Consistent card styling across admin panel
 */
export default function Card({ 
  title, 
  subtitle,
  icon,
  children, 
  actions,
  noPadding = false,
  className = '',
}: CardProps) {
  return (
    <div className={`card ${className}`}>
      {(title || actions) && (
        <div className="card-header d-flex align-items-center justify-content-between">
          <div>
            {title && (
              <h5 className="card-title mb-0">
                {icon && <i className={`ti ${icon} me-2`}></i>}
                {title}
              </h5>
            )}
            {subtitle && (
              <small className="text-muted">{subtitle}</small>
            )}
          </div>
          {actions && (
            <div className="card-actions">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className={noPadding ? '' : 'card-body'}>
        {children}
      </div>
    </div>
  );
}

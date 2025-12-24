'use client';

import React from 'react';
import Link from 'next/link';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageAction {
  label: string;
  icon?: string;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  disabled?: boolean;
  loading?: boolean;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: PageAction[];
  children?: React.ReactNode;
}

/**
 * PageHeader - Consistent page header with title, breadcrumbs, and actions
 */
export function PageHeader({ 
  title, 
  subtitle, 
  breadcrumbs, 
  actions,
  children 
}: PageHeaderProps) {
  return (
    <div className="mb-4">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="breadcrumb" className="mb-2">
          <ol className="breadcrumb">
            {breadcrumbs.map((crumb, index) => (
              <li 
                key={index} 
                className={`breadcrumb-item ${!crumb.href ? 'active' : ''}`}
              >
                {crumb.href ? (
                  <Link href={crumb.href}>{crumb.label}</Link>
                ) : (
                  crumb.label
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Title and Actions Row */}
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h4 className="fw-bold mb-1">{title}</h4>
          {subtitle && (
            <p className="mb-0 text-muted">{subtitle}</p>
          )}
        </div>
        
        {/* Actions */}
        {actions && actions.length > 0 && (
          <div className="d-flex gap-2">
            {actions.map((action, index) => {
              const className = `btn btn-${action.variant || 'primary'} ${action.disabled || action.loading ? 'disabled' : ''}`;
              
              if (action.href) {
                return (
                  <Link key={index} href={action.href} className={className}>
                    {action.icon && <i className={`ti ti-${action.icon} me-1`}></i>}
                    {action.label}
                  </Link>
                );
              }
              
              return (
                <button
                  key={index}
                  className={className}
                  onClick={action.onClick}
                  disabled={action.disabled || action.loading}
                >
                  {action.loading ? (
                    <span className="spinner-border spinner-border-sm me-1"></span>
                  ) : action.icon ? (
                    <i className={`ti ti-${action.icon} me-1`}></i>
                  ) : null}
                  {action.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Optional filter/search row */}
      {children}
    </div>
  );
}

interface PageContentProps {
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  empty?: {
    show: boolean;
    icon?: string;
    title: string;
    message?: string;
    action?: PageAction;
  };
}

/**
 * PageContent - Content wrapper with loading, error, and empty states
 */
export function PageContent({ children, loading, error, empty }: PageContentProps) {
  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="ti ti-alert-circle me-2"></i>
        {error}
      </div>
    );
  }

  if (empty?.show) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-center py-5">
            {empty.icon && (
              <i className={`ti ti-${empty.icon} ti-3x text-muted mb-3 d-block`}></i>
            )}
            <h5>{empty.title}</h5>
            {empty.message && (
              <p className="text-muted mb-3">{empty.message}</p>
            )}
            {empty.action && (
              empty.action.href ? (
                <Link href={empty.action.href} className={`btn btn-${empty.action.variant || 'primary'}`}>
                  {empty.action.icon && <i className={`ti ti-${empty.action.icon} me-1`}></i>}
                  {empty.action.label}
                </Link>
              ) : (
                <button 
                  className={`btn btn-${empty.action.variant || 'primary'}`}
                  onClick={empty.action.onClick}
                >
                  {empty.action.icon && <i className={`ti ti-${empty.action.icon} me-1`}></i>}
                  {empty.action.label}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: string;
  iconColor?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  change?: {
    value: number;
    label?: string;
  };
  loading?: boolean;
}

/**
 * StatsCard - Dashboard-style stat display
 */
export function StatsCard({ 
  title, 
  value, 
  icon, 
  iconColor = 'primary',
  change,
  loading 
}: StatsCardProps) {
  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between">
          <div>
            <p className="card-text mb-0 text-muted">{title}</p>
            {loading ? (
              <div className="spinner-border spinner-border-sm mt-2"></div>
            ) : (
              <h4 className="mb-0">{value}</h4>
            )}
            {change && !loading && (
              <small className={change.value >= 0 ? 'text-success' : 'text-danger'}>
                <i className={`ti ti-arrow-${change.value >= 0 ? 'up' : 'down'} me-1`}></i>
                {Math.abs(change.value)}% {change.label || 'vs last period'}
              </small>
            )}
          </div>
          {icon && (
            <span className={`badge bg-label-${iconColor} rounded p-2`}>
              <i className={`ti ti-${icon} ti-sm`}></i>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface TabItem {
  id: string;
  label: string;
  icon?: string;
  count?: number;
  disabled?: boolean;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

/**
 * Tabs - Tab navigation component
 */
export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <ul className="nav nav-tabs mb-4">
      {tabs.map(tab => (
        <li key={tab.id} className="nav-item">
          <button
            className={`nav-link ${activeTab === tab.id ? 'active' : ''} ${tab.disabled ? 'disabled' : ''}`}
            onClick={() => !tab.disabled && onChange(tab.id)}
            disabled={tab.disabled}
          >
            {tab.icon && <i className={`ti ti-${tab.icon} me-1`}></i>}
            {tab.label}
            {tab.count !== undefined && (
              <span className="badge bg-label-primary ms-1">{tab.count}</span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}

interface FilterBarProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * FilterBar - Filter/search bar container
 */
export function FilterBar({ children, className = '' }: FilterBarProps) {
  return (
    <div className={`d-flex gap-2 align-items-center flex-wrap mt-3 ${className}`}>
      {children}
    </div>
  );
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: string;
}

/**
 * SearchInput - Search input with icon
 */
export function SearchInput({ 
  value, 
  onChange, 
  placeholder = 'Search...', 
  width = '250px' 
}: SearchInputProps) {
  return (
    <div className="input-group" style={{ maxWidth: width }}>
      <span className="input-group-text">
        <i className="ti ti-search"></i>
      </span>
      <input
        type="text"
        className="form-control"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button 
          className="btn btn-outline-secondary" 
          onClick={() => onChange('')}
          type="button"
        >
          <i className="ti ti-x"></i>
        </button>
      )}
    </div>
  );
}

interface SelectFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  width?: string;
}

/**
 * SelectFilter - Dropdown filter
 */
export function SelectFilter({ 
  value, 
  onChange, 
  options, 
  placeholder = 'All',
  width = '150px'
}: SelectFilterProps) {
  return (
    <select 
      className="form-select" 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      style={{ maxWidth: width }}
    >
      <option value="">{placeholder}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

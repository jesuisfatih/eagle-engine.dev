'use client';

import React from 'react';
import { formatCurrency, formatPercent, calculateDiscount } from '@/lib/utils';
import type { QuantityBreak } from '@/types';

// ============================================
// PRICE DISPLAY - Main Component
// ============================================

interface PriceDisplayProps {
  listPrice: number;
  companyPrice: number;
  quantityBreaks?: QuantityBreak[];
  currentQuantity?: number;
  currency?: string;
  showBreaks?: boolean;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'vertical' | 'horizontal' | 'compact';
}

export function PriceDisplay({
  listPrice,
  companyPrice,
  quantityBreaks = [],
  currentQuantity = 1,
  currency = 'USD',
  showBreaks = true,
  size = 'md',
  layout = 'vertical',
}: PriceDisplayProps) {
  const hasDiscount = companyPrice < listPrice;
  const discountPercentage = hasDiscount ? calculateDiscount(listPrice, companyPrice) : 0;

  // Find applicable price based on quantity
  const applicableBreak = findApplicableBreak(currentQuantity, quantityBreaks);
  const finalPrice = applicableBreak ? applicableBreak.price : companyPrice;
  const finalDiscount = calculateDiscount(listPrice, finalPrice);

  const sizeClasses = {
    sm: { main: 'fs-6', strike: 'small', badge: 'badge-sm' },
    md: { main: 'fs-5', strike: 'fs-6', badge: '' },
    lg: { main: 'fs-3', strike: 'fs-5', badge: 'badge-lg' },
  };

  const sizes = sizeClasses[size];

  if (layout === 'compact') {
    return (
      <div className="d-flex align-items-center gap-2">
        <span className={`fw-bold text-success ${sizes.main}`}>
          {formatCurrency(finalPrice, currency)}
        </span>
        {hasDiscount && (
          <span className={`text-muted text-decoration-line-through ${sizes.strike}`}>
            {formatCurrency(listPrice, currency)}
          </span>
        )}
        {finalDiscount > 0 && (
          <span className={`badge bg-success ${sizes.badge}`}>
            -{formatPercent(finalDiscount)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={layout === 'horizontal' ? 'd-flex align-items-center gap-3' : ''}>
      {/* List Price (Strikethrough) */}
      {hasDiscount && (
        <div className={layout === 'horizontal' ? '' : 'mb-1'}>
          <span className={`text-muted text-decoration-line-through ${sizes.strike}`}>
            List: {formatCurrency(listPrice, currency)}
          </span>
        </div>
      )}

      {/* Company Price */}
      <div className="d-flex align-items-center gap-2">
        <span className={`fw-bold text-success ${sizes.main}`}>
          {formatCurrency(finalPrice, currency)}
        </span>
        {finalDiscount > 0 && (
          <span className={`badge bg-success ${sizes.badge}`}>
            -{formatPercent(finalDiscount)}
          </span>
        )}
      </div>

      {/* Discount Label */}
      {hasDiscount && !applicableBreak && (
        <small className="text-success">
          <i className="ti ti-tag me-1"></i>
          Your B2B Price
        </small>
      )}

      {/* Volume Discount Applied */}
      {applicableBreak && (
        <small className="text-success">
          <i className="ti ti-package me-1"></i>
          Volume Discount ({currentQuantity}+ items)
        </small>
      )}

      {/* Quantity Breaks */}
      {showBreaks && quantityBreaks.length > 0 && (
        <QuantityBreaksDisplay
          breaks={quantityBreaks}
          currentQuantity={currentQuantity}
          listPrice={listPrice}
          currency={currency}
          size={size}
        />
      )}
    </div>
  );
}

// ============================================
// QUANTITY BREAKS DISPLAY
// ============================================

interface QuantityBreaksDisplayProps {
  breaks: QuantityBreak[];
  currentQuantity: number;
  listPrice: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function QuantityBreaksDisplay({
  breaks,
  currentQuantity,
  listPrice,
  currency = 'USD',
  size = 'md',
}: QuantityBreaksDisplayProps) {
  if (!breaks || breaks.length === 0) return null;

  const sortedBreaks = [...breaks].sort((a, b) => a.qty - b.qty);

  return (
    <div className="mt-2 pt-2 border-top">
      <small className="text-muted d-block mb-2">
        <i className="ti ti-trending-down me-1"></i>
        Volume Pricing:
      </small>
      <div className="d-flex flex-wrap gap-2">
        {sortedBreaks.map((breakItem, index) => {
          const isActive = currentQuantity >= breakItem.qty;
          const isNext = !isActive && 
            (index === 0 || currentQuantity >= sortedBreaks[index - 1].qty);
          const discount = calculateDiscount(listPrice, breakItem.price);

          return (
            <QuantityBreakBadge
              key={breakItem.qty}
              qty={breakItem.qty}
              price={breakItem.price}
              discount={discount}
              isActive={isActive}
              isNext={isNext}
              currency={currency}
              size={size}
            />
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// QUANTITY BREAK BADGE
// ============================================

interface QuantityBreakBadgeProps {
  qty: number;
  price: number;
  discount: number;
  isActive: boolean;
  isNext: boolean;
  currency?: string;
  size?: 'sm' | 'md' | 'lg';
}

function QuantityBreakBadge({
  qty,
  price,
  discount,
  isActive,
  isNext,
  currency = 'USD',
  size = 'md',
}: QuantityBreakBadgeProps) {
  const baseClass = 'd-inline-flex align-items-center gap-1 rounded px-2 py-1';
  const activeClass = isActive 
    ? 'bg-success text-white' 
    : isNext 
      ? 'bg-warning bg-opacity-25 border border-warning' 
      : 'bg-light text-muted';

  const sizeClass = size === 'sm' ? 'small' : size === 'lg' ? '' : 'small';

  return (
    <div className={`${baseClass} ${activeClass} ${sizeClass}`}>
      <i className="ti ti-package"></i>
      <span>{qty}+</span>
      <span className="fw-bold">{formatCurrency(price, currency)}</span>
      {discount > 0 && (
        <span className={isActive ? '' : 'text-success'}>
          (-{formatPercent(discount)})
        </span>
      )}
      {isActive && <i className="ti ti-check"></i>}
      {isNext && !isActive && (
        <span className="badge bg-warning text-dark ms-1">Best Value</span>
      )}
    </div>
  );
}

// ============================================
// DISCOUNT BADGE
// ============================================

interface DiscountBadgeProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning';
}

export function DiscountBadge({ 
  percentage, 
  size = 'md', 
  variant = 'success' 
}: DiscountBadgeProps) {
  if (percentage <= 0) return null;

  const sizeClasses = {
    sm: 'small px-1 py-0',
    md: 'px-2 py-1',
    lg: 'px-3 py-2 fs-6',
  };

  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning text-dark',
  };

  return (
    <span className={`badge ${variantClasses[variant]} ${sizeClasses[size]}`}>
      -{formatPercent(percentage)}
    </span>
  );
}

// ============================================
// SAVINGS DISPLAY
// ============================================

interface SavingsDisplayProps {
  originalTotal: number;
  discountedTotal: number;
  currency?: string;
  showPerItem?: boolean;
  quantity?: number;
}

export function SavingsDisplay({
  originalTotal,
  discountedTotal,
  currency = 'USD',
  showPerItem = false,
  quantity = 1,
}: SavingsDisplayProps) {
  const savings = originalTotal - discountedTotal;
  const savingsPercent = calculateDiscount(originalTotal, discountedTotal);
  const savingsPerItem = savings / quantity;

  if (savings <= 0) return null;

  return (
    <div className="alert alert-success py-2 mb-0 d-flex align-items-center justify-content-between">
      <div>
        <i className="ti ti-discount me-2"></i>
        <span>You&apos;re saving </span>
        <strong>{formatCurrency(savings, currency)}</strong>
        <span className="ms-1">({formatPercent(savingsPercent)})</span>
      </div>
      {showPerItem && quantity > 1 && (
        <small className="text-muted">
          {formatCurrency(savingsPerItem, currency)}/item
        </small>
      )}
    </div>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function findApplicableBreak(
  quantity: number,
  breaks: QuantityBreak[]
): QuantityBreak | null {
  if (!breaks || breaks.length === 0) return null;

  const sortedBreaks = [...breaks].sort((a, b) => b.qty - a.qty);

  for (const breakItem of sortedBreaks) {
    if (quantity >= breakItem.qty) {
      return breakItem;
    }
  }

  return null;
}

// ============================================
// PRODUCT PRICE TAG (For Cards)
// ============================================

interface ProductPriceTagProps {
  listPrice: number;
  companyPrice: number;
  hasQuantityBreaks?: boolean;
  currency?: string;
}

export function ProductPriceTag({
  listPrice,
  companyPrice,
  hasQuantityBreaks = false,
  currency = 'USD',
}: ProductPriceTagProps) {
  const hasDiscount = companyPrice < listPrice;
  const discountPercent = hasDiscount ? calculateDiscount(listPrice, companyPrice) : 0;

  return (
    <div>
      {/* Your Price */}
      <div className="d-flex align-items-baseline gap-2">
        <span className="fs-5 fw-bold text-success">
          {formatCurrency(companyPrice, currency)}
        </span>
        {hasDiscount && (
          <span className="text-muted text-decoration-line-through small">
            {formatCurrency(listPrice, currency)}
          </span>
        )}
      </div>

      {/* Badges */}
      <div className="d-flex flex-wrap gap-1 mt-1">
        {hasDiscount && (
          <span className="badge bg-success">
            Save {formatPercent(discountPercent)}
          </span>
        )}
        {hasQuantityBreaks && (
          <span className="badge bg-info">
            <i className="ti ti-package me-1"></i>
            Volume Discounts
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================
// EXPORTS
// ============================================

export default PriceDisplay;

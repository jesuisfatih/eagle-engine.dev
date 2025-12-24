'use client';

import React from 'react';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { LoadingButton } from '@/components/ui';
import type { Promotion } from '@/types';

// ============================================
// CART SUMMARY - Enhanced with savings display
// ============================================

interface CartItem {
  id: string;
  title: string;
  quantity: number;
  unitPrice: number;
  listPrice?: number;
}

interface CartSummaryProps {
  items: CartItem[];
  subtotal: number;
  listTotal?: number;
  discount?: number;
  shipping?: number;
  tax?: number;
  total: number;
  savings?: number;
  currency?: string;
  appliedPromotions?: Promotion[];
  onCheckout?: () => void;
  onSaveQuote?: () => void;
  checkoutLoading?: boolean;
  quoteLoading?: boolean;
  needsApproval?: boolean;
  approvalLimit?: number;
  disabled?: boolean;
}

export function CartSummary({
  items,
  subtotal,
  listTotal,
  discount = 0,
  shipping = 0,
  tax = 0,
  total,
  savings = 0,
  currency = 'USD',
  appliedPromotions = [],
  onCheckout,
  onSaveQuote,
  checkoutLoading = false,
  quoteLoading = false,
  needsApproval = false,
  approvalLimit,
  disabled = false,
}: CartSummaryProps) {
  const hasItems = items.length > 0;
  const hasSavings = savings > 0 || discount > 0;
  const totalSavings = savings + discount;
  const savingsPercent = listTotal && listTotal > 0 
    ? ((listTotal - subtotal + discount) / listTotal) * 100 
    : 0;

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">Order Summary</h5>
      </div>
      <div className="card-body">
        {/* Item Count */}
        <div className="d-flex justify-content-between mb-2">
          <span className="text-muted">Items ({items.length})</span>
          <span>{items.reduce((sum, i) => sum + i.quantity, 0)} units</span>
        </div>

        {/* List Price (if different from subtotal) */}
        {listTotal && listTotal > subtotal && (
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">List Price</span>
            <span className="text-decoration-line-through text-muted">
              {formatCurrency(listTotal, currency)}
            </span>
          </div>
        )}

        {/* Subtotal (Your Price) */}
        <div className="d-flex justify-content-between mb-2">
          <span className="text-muted">Subtotal</span>
          <span>{formatCurrency(subtotal, currency)}</span>
        </div>

        {/* B2B Discount */}
        {hasSavings && (
          <div className="d-flex justify-content-between mb-2 text-success">
            <span>
              <i className="ti ti-tag me-1"></i>
              B2B Savings
            </span>
            <span>-{formatCurrency(totalSavings, currency)}</span>
          </div>
        )}

        {/* Applied Promotions */}
        {appliedPromotions.map((promo) => (
          <div key={promo.id} className="d-flex justify-content-between mb-2 text-success">
            <span>
              <i className="ti ti-ticket me-1"></i>
              {promo.title}
            </span>
            <span>
              -{promo.discountType === 'percentage' 
                ? formatPercent(promo.discountValue) 
                : formatCurrency(promo.discountValue, currency)}
            </span>
          </div>
        ))}

        {/* Discount line (if separate) */}
        {discount > 0 && !hasSavings && (
          <div className="d-flex justify-content-between mb-2 text-success">
            <span>Discount</span>
            <span>-{formatCurrency(discount, currency)}</span>
          </div>
        )}

        {/* Shipping */}
        <div className="d-flex justify-content-between mb-2">
          <span className="text-muted">Shipping</span>
          <span>
            {shipping > 0 ? formatCurrency(shipping, currency) : 'Calculated at checkout'}
          </span>
        </div>

        {/* Tax */}
        {tax > 0 && (
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Tax</span>
            <span>{formatCurrency(tax, currency)}</span>
          </div>
        )}

        <hr />

        {/* Total */}
        <div className="d-flex justify-content-between mb-3">
          <strong className="fs-5">Total</strong>
          <strong className="fs-5">{formatCurrency(total, currency)}</strong>
        </div>

        {/* Savings Highlight */}
        {hasSavings && (
          <div className="alert alert-success py-2 mb-3">
            <div className="d-flex align-items-center">
              <i className="ti ti-discount ti-lg me-2"></i>
              <div>
                <strong>You&apos;re saving {formatCurrency(totalSavings, currency)}</strong>
                {savingsPercent > 0 && (
                  <span className="ms-1">({formatPercent(savingsPercent)})</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Approval Warning */}
        {needsApproval && approvalLimit && (
          <div className="alert alert-warning py-2 mb-3">
            <div className="d-flex align-items-center">
              <i className="ti ti-alert-circle me-2"></i>
              <small>
                Orders over {formatCurrency(approvalLimit, currency)} require manager approval.
              </small>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="d-grid gap-2">
          {onCheckout && (
            <LoadingButton
              variant="primary"
              size="lg"
              loading={checkoutLoading}
              disabled={disabled || !hasItems}
              onClick={onCheckout}
            >
              {needsApproval ? (
                <>
                  <i className="ti ti-send me-2"></i>
                  Submit for Approval
                </>
              ) : (
                <>
                  <i className="ti ti-shopping-cart me-2"></i>
                  Proceed to Checkout
                </>
              )}
            </LoadingButton>
          )}

          {onSaveQuote && (
            <LoadingButton
              variant="outline-primary"
              loading={quoteLoading}
              disabled={disabled || !hasItems}
              onClick={onSaveQuote}
            >
              <i className="ti ti-file-text me-2"></i>
              Save as Quote
            </LoadingButton>
          )}
        </div>

        {/* Trust Badges */}
        <div className="mt-4 pt-3 border-top">
          <div className="d-flex justify-content-around text-center small text-muted">
            <div>
              <i className="ti ti-shield-check d-block mb-1"></i>
              Secure Checkout
            </div>
            <div>
              <i className="ti ti-truck d-block mb-1"></i>
              Fast Shipping
            </div>
            <div>
              <i className="ti ti-headset d-block mb-1"></i>
              24/7 Support
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MINI CART SUMMARY (For sidebar/header)
// ============================================

interface MiniCartSummaryProps {
  itemCount: number;
  total: number;
  savings?: number;
  currency?: string;
  onViewCart?: () => void;
  onCheckout?: () => void;
}

export function MiniCartSummary({
  itemCount,
  total,
  savings = 0,
  currency = 'USD',
  onViewCart,
  onCheckout,
}: MiniCartSummaryProps) {
  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between mb-2">
          <span>{itemCount} items</span>
          <strong>{formatCurrency(total, currency)}</strong>
        </div>
        {savings > 0 && (
          <div className="small text-success mb-2">
            <i className="ti ti-discount me-1"></i>
            Saving {formatCurrency(savings, currency)}
          </div>
        )}
        <div className="d-grid gap-2">
          {onViewCart && (
            <button className="btn btn-outline-primary btn-sm" onClick={onViewCart}>
              View Cart
            </button>
          )}
          {onCheckout && (
            <button className="btn btn-primary btn-sm" onClick={onCheckout}>
              Checkout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// CART ITEM ROW (For cart page)
// ============================================

interface CartItemRowProps {
  item: {
    id: string;
    title: string;
    variantTitle?: string;
    sku?: string;
    quantity: number;
    unitPrice: number;
    listPrice?: number;
    imageUrl?: string;
  };
  quantityBreaks?: { qty: number; price: number }[];
  onUpdateQuantity?: (quantity: number) => void;
  onRemove?: () => void;
  loading?: boolean;
  currency?: string;
}

export function CartItemRow({
  item,
  quantityBreaks = [],
  onUpdateQuantity,
  onRemove,
  loading = false,
  currency = 'USD',
}: CartItemRowProps) {
  const hasDiscount = item.listPrice && item.listPrice > item.unitPrice;
  const itemTotal = item.quantity * item.unitPrice;
  const listTotal = item.listPrice ? item.quantity * item.listPrice : itemTotal;
  const itemSavings = listTotal - itemTotal;

  return (
    <div className={`card mb-3 ${loading ? 'opacity-50' : ''}`}>
      <div className="card-body">
        <div className="row align-items-center">
          {/* Image */}
          <div className="col-auto">
            <img
              src={item.imageUrl || '/placeholder.png'}
              alt={item.title}
              className="rounded"
              style={{ width: 80, height: 80, objectFit: 'cover' }}
            />
          </div>

          {/* Details */}
          <div className="col">
            <h6 className="mb-1">{item.title}</h6>
            {item.variantTitle && (
              <small className="text-muted d-block">{item.variantTitle}</small>
            )}
            {item.sku && (
              <small className="text-muted d-block">SKU: {item.sku}</small>
            )}
            
            {/* Price Display */}
            <div className="mt-2">
              <span className="fw-bold text-success">
                {formatCurrency(item.unitPrice, currency)}
              </span>
              {hasDiscount && (
                <span className="text-muted text-decoration-line-through ms-2 small">
                  {formatCurrency(item.listPrice!, currency)}
                </span>
              )}
            </div>
          </div>

          {/* Quantity */}
          <div className="col-auto">
            <div className="input-group" style={{ width: 120 }}>
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => onUpdateQuantity?.(item.quantity - 1)}
                disabled={loading || item.quantity <= 1}
              >
                -
              </button>
              <input
                type="text"
                className="form-control text-center"
                value={item.quantity}
                readOnly
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => onUpdateQuantity?.(item.quantity + 1)}
                disabled={loading}
              >
                +
              </button>
            </div>

            {/* Quantity Break Hint */}
            {quantityBreaks.length > 0 && (
              <QuantityBreakMiniHint
                currentQty={item.quantity}
                breaks={quantityBreaks}
                currentPrice={item.unitPrice}
              />
            )}
          </div>

          {/* Total */}
          <div className="col-auto text-end">
            <div className="fw-bold">{formatCurrency(itemTotal, currency)}</div>
            {itemSavings > 0 && (
              <small className="text-success">
                Save {formatCurrency(itemSavings, currency)}
              </small>
            )}
            {onRemove && (
              <button
                className="btn btn-link text-danger p-0 d-block mt-1"
                onClick={onRemove}
                disabled={loading}
              >
                <i className="ti ti-trash"></i> Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// QUANTITY BREAK MINI HINT
// ============================================

interface QuantityBreakMiniHintProps {
  currentQty: number;
  breaks: { qty: number; price: number }[];
  currentPrice: number;
}

function QuantityBreakMiniHint({ currentQty, breaks, currentPrice }: QuantityBreakMiniHintProps) {
  const sortedBreaks = [...breaks].sort((a, b) => a.qty - b.qty);
  const nextBreak = sortedBreaks.find(b => b.qty > currentQty);

  if (!nextBreak) return null;

  const additionalNeeded = nextBreak.qty - currentQty;

  return (
    <small className="text-warning d-block text-center mt-1">
      +{additionalNeeded} for better price
    </small>
  );
}

// ============================================
// EXPORTS
// ============================================

export default CartSummary;
